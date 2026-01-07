import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import MediaGrid from "../components/media/MediaGrid";

// --- TYPES ---
interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  caption: string;
  event_name: string;
  date: string;
  featured: boolean;
  likes?: string[]; // ✅ Store list of User IDs who liked this
  created_at: any;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  created_at: any;
}

interface EventGroup {
  id: string;
  eventName: string;
  date: string;
  items: MediaItem[];
  timestamp: any;
}

// --- HELPER: Relative Time (e.g. "2 mins ago") ---
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diff)) return dateString;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

// --- COMPONENT: Single Feed Post ---
const FeedPost = ({
  group,
  isAdmin,
  currentUser,
  onEdit,
  onDelete,
  onExpand,
}: {
  group: EventGroup;
  isAdmin: boolean;
  currentUser: any;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
  onExpand: (item: MediaItem) => void;
}) => {
  // We use the first item in the group as the "Main Post" for likes/comments
  const mainPost = group.items[0];
  const postId = mainPost.id;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  // 1. Sync Likes from Database (Real-time)
  useEffect(() => {
    if (mainPost.likes) {
      setLikeCount(mainPost.likes.length);
      // Check if current user is in the "likes" list
      if (currentUser && mainPost.likes.includes(currentUser.uid)) {
        setLiked(true);
      } else {
        setLiked(false);
      }
    }
  }, [mainPost.likes, currentUser]);

  // 2. Fetch Comments from Database (Real-time)
  useEffect(() => {
    if (showComments) {
      // ✅ Listen to the 'comments' sub-collection
      const q = query(
        collection(db, "media", postId, "comments"),
        orderBy("created_at", "asc")
      );
      const unsub = onSnapshot(q, (snap) => {
        setComments(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment))
        );
      });
      return unsub;
    }
  }, [showComments, postId]);

  // --- ACTIONS ---

  const handleLike = async () => {
    if (!currentUser) return alert("Please login to like!");

    // 1. Optimistic Update (Make it feel instant before DB responds)
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    const postRef = doc(db, "media", postId);
    try {
      if (liked) {
        // ✅ Remove ID from DB
        await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
      } else {
        // ✅ Add ID to DB
        await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
      }
    } catch (error) {
      console.error("Like failed:", error);
      setLiked(!liked); // Revert if failed
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    try {
      // ✅ Save Comment to DB
      await addDoc(collection(db, "media", postId, "comments"), {
        userId: currentUser.uid,
        userName: currentUser.displayName || "Member",
        text: commentText,
        created_at: serverTimestamp(),
      });
      setCommentText(""); // Clear input
    } catch (error) {
      console.error("Comment failed:", error);
      alert("Failed to post comment.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${group.eventName}`,
          text: "Look at these moments from Youth Xtreme!",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share canceled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard! 📋");
    }
  };

  return (
    <div className="bg-brand-gray/50 rounded-3xl border border-white/5 shadow-xl overflow-hidden mb-8 animate-fade-in-up">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-accent to-green-400 flex items-center justify-center text-black font-bold text-xs shadow-lg">
            YX
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">
              {group.eventName}
            </h3>
            <p className="text-brand-muted text-xs flex items-center gap-1">
              <span>{getRelativeTime(group.date)}</span>
              <span>•</span>
              <span className="text-brand-accent">Official</span>
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(postId)}
            className="text-red-500 hover:text-red-400 p-2 text-xs font-bold uppercase"
          >
            Delete
          </button>
        )}
      </div>

      {/* Caption */}
      {mainPost.caption && (
        <div className="px-4 pb-3">
          <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
            {mainPost.caption}
          </p>
        </div>
      )}

      {/* Grid */}
      <MediaGrid items={group.items} onItemClick={onExpand} />

      {/* Stats Bar */}
      <div className="px-4 py-3 flex justify-between items-center text-xs text-brand-muted border-b border-white/5">
        <div className="flex items-center gap-1">
          {likeCount > 0 && (
            <div className="flex -space-x-1 mr-1">
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">
                ❤️
              </div>
            </div>
          )}
          <span>
            {likeCount > 0 ? `${likeCount} likes` : "Be the first to like"}
          </span>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:underline"
        >
          {comments.length > 0 ? `${comments.length} comments` : "No comments"}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex justify-between items-center">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all active:scale-95 ${
            liked ? "text-red-500" : "text-brand-muted hover:bg-white/5"
          }`}
        >
          <svg
            className={`w-5 h-5 ${
              liked ? "fill-current" : "fill-none stroke-current"
            }`}
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-brand-muted hover:bg-white/5 transition-all active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Comment
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-brand-muted hover:bg-white/5 transition-all active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </button>
      </div>

      {/* Comments Section (Collapsible) */}
      {showComments && (
        <div className="bg-black/20 p-4 border-t border-white/5 animate-slide-down">
          {/* Scrollable List */}
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
            {comments.length === 0 && (
              <p className="text-center text-xs text-gray-500 py-2">
                No comments yet. Say something!
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {c.userName.charAt(0)}
                </div>
                <div className="bg-white/10 rounded-2xl px-3 py-2 max-w-[85%]">
                  <p className="text-white text-xs font-bold mb-0.5">
                    {c.userName}
                  </p>
                  <p className="text-gray-300 text-sm leading-snug">{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <form
            onSubmit={handlePostComment}
            className="relative flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-bold shrink-0">
              {currentUser ? currentUser.displayName?.charAt(0) || "U" : "?"}
            </div>
            <input
              type="text"
              placeholder={
                currentUser ? "Write a comment..." : "Login to comment"
              }
              className="w-full bg-brand-dark border border-white/10 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent pr-10 transition-all"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!currentUser}
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="absolute right-2 text-brand-accent p-1.5 hover:bg-white/10 rounded-full disabled:opacity-50"
            >
              <svg
                className="w-4 h-4 transform rotate-90"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE ---
const Media = () => {
  const [groupedMedia, setGroupedMedia] = useState<EventGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // For Editing (Admin)
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");

  // 1. Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // 2. Fetch Data (Real-time Feed)
  useEffect(() => {
    if (!db) return;
    setLoading(true);
    // Listen to all media posts
    const q = query(collection(db, "media"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const rawData = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as MediaItem)
      );

      // Group photos/videos by event
      const groups: { [key: string]: EventGroup } = {};
      rawData.forEach((item) => {
        const key = item.event_name || "General Highlights";
        const uniqueKey = key + item.date;
        if (!groups[uniqueKey]) {
          groups[uniqueKey] = {
            id: uniqueKey,
            eventName: key,
            date: item.date,
            items: [],
            timestamp: item.created_at,
          };
        }
        groups[uniqueKey].items.push(item);
      });

      // Sort feed by newest
      const sortedGroups = Object.values(groups).sort((a, b) => {
        const tA = a.timestamp?.seconds || 0;
        const tB = b.timestamp?.seconds || 0;
        return tB - tA;
      });

      setGroupedMedia(sortedGroups);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Delete (Admin)
  const handleDelete = async (id: string) => {
    if (!isAdmin || !confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, "media", id));
      setSelectedItem(null);
    } catch (e) {
      alert("Error deleting");
    }
  };

  // Update Caption (Admin)
  const handleUpdate = async () => {
    if (!selectedItem || !db) return;
    try {
      await updateDoc(doc(db, "media", selectedItem.id), {
        caption: editCaption,
      });
      setSelectedItem({ ...selectedItem, caption: editCaption });
      setIsEditing(false);
    } catch (e) {
      alert("Error updating");
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
        {/* Feed Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Social <span className="text-brand-accent">Feed</span>
          </h1>
          <p className="text-brand-muted text-sm">
            Highlights from Youth Xtreme
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="p-4 bg-red-500/10 text-red-400 text-center rounded-xl mb-4">
            Firebase Config Missing
          </div>
        )}

        {/* FEED */}
        {loading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white/5 rounded-3xl h-96 animate-pulse"
              />
            ))}
          </div>
        ) : groupedMedia.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No posts yet.</div>
        ) : (
          <div>
            {groupedMedia.map((group) => (
              <FeedPost
                key={group.id}
                group={group}
                isAdmin={isAdmin}
                currentUser={currentUser}
                onEdit={() => {}}
                onDelete={handleDelete}
                onExpand={(item) => {
                  setSelectedItem(item);
                  setEditCaption(item.caption);
                  setIsEditing(false);
                }}
              />
            ))}
          </div>
        )}

        {/* LIGHTBOX (Fullscreen) */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-4 flex items-center justify-center animate-fade-in"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="relative w-full max-w-4xl max-h-screen flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-0 right-0 m-4 z-50 bg-white/10 p-2 rounded-full text-white hover:bg-white/20"
              >
                ✕
              </button>

              <div className="flex-1 flex items-center justify-center overflow-hidden">
                {selectedItem.type === "video" ? (
                  <video
                    src={selectedItem.url}
                    controls
                    autoPlay
                    className="max-h-[80vh] rounded-xl"
                  />
                ) : (
                  <img
                    src={selectedItem.url}
                    className="max-h-[80vh] object-contain rounded-xl"
                  />
                )}
              </div>

              {isAdmin && (
                <div className="mt-4 flex gap-2 justify-center">
                  {isEditing ? (
                    <div className="flex gap-2 w-full max-w-md">
                      <input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        className="flex-1 bg-white/10 rounded px-3 py-2 text-white"
                      />
                      <button
                        onClick={handleUpdate}
                        className="bg-brand-accent text-black font-bold px-4 rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white/10 text-white px-4 py-2 rounded font-bold"
                      >
                        Edit Caption
                      </button>
                      <button
                        onClick={() => handleDelete(selectedItem.id)}
                        className="bg-red-500/20 text-red-500 px-4 py-2 rounded font-bold"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;
