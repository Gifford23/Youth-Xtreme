import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  caption: string;
  event_name: string;
  date: string;
  created_at: any;
}

const MediaManager = () => {
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ caption: "", event_name: "" });

  // Create Form State
  const [newPost, setNewPost] = useState({
    url: "",
    caption: "",
    event_name: "",
    date: new Date().toISOString().split("T")[0],
    type: "photo" as "photo" | "video",
  });

  // --- 1. FETCH POSTS (Real-time) ---
  useEffect(() => {
    const q = query(collection(db, "media"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MediaItem[];
      setPosts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. CREATE POST ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newPost.url || !newPost.event_name) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, "media"), {
        type: newPost.type,
        url: newPost.url,
        caption: newPost.caption,
        event_name: newPost.event_name,
        date: newPost.date,
        featured: false,
        created_at: serverTimestamp(),
      });

      // Reset Form
      setNewPost({
        url: "",
        caption: "",
        event_name: "",
        date: new Date().toISOString().split("T")[0],
        type: "photo",
      });
      alert("✅ Published to Xtreme Feed!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("❌ Failed to post.");
    } finally {
      setIsPosting(false);
    }
  };

  // --- 3. DELETE POST ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "media", id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete.");
    }
  };

  // --- 4. START EDITING ---
  const startEdit = (post: MediaItem) => {
    setEditingId(post.id);
    setEditForm({
      caption: post.caption,
      event_name: post.event_name,
    });
  };

  // --- 5. SAVE EDIT ---
  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateDoc(doc(db, "media", editingId), {
        caption: editForm.caption,
        event_name: editForm.event_name,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update.");
    }
  };

  // 🛠️ Helper: Extract YouTube ID
  const getYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[400px,1fr] gap-8">
      {/* --- LEFT COLUMN: CREATE FORM --- */}
      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 p-6 h-fit sticky top-24">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📸</span> Create New Post
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNewPost({ ...newPost, type: "photo" })}
              className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                newPost.type === "photo"
                  ? "bg-brand-accent text-brand-dark border-brand-accent"
                  : "bg-black/20 text-brand-muted border-white/10 hover:bg-white/5"
              }`}
            >
              Photo
            </button>
            <button
              type="button"
              onClick={() => setNewPost({ ...newPost, type: "video" })}
              className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                newPost.type === "video"
                  ? "bg-brand-accent text-brand-dark border-brand-accent"
                  : "bg-black/20 text-brand-muted border-white/10 hover:bg-white/5"
              }`}
            >
              Video
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Media URL
            </label>
            <input
              type="text"
              placeholder={
                newPost.type === "photo"
                  ? "Image URL"
                  : "Video URL (YouTube/MP4)"
              }
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent focus:outline-none"
              value={newPost.url}
              onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Event Name
              </label>
              <input
                type="text"
                placeholder="Event..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-brand-accent focus:outline-none"
                value={newPost.event_name}
                onChange={(e) =>
                  setNewPost({ ...newPost, event_name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-brand-accent focus:outline-none [color-scheme:dark]"
                value={newPost.date}
                onChange={(e) =>
                  setNewPost({ ...newPost, date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Caption
            </label>
            <textarea
              placeholder="Caption..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent focus:outline-none h-24 resize-none"
              value={newPost.caption}
              onChange={(e) =>
                setNewPost({ ...newPost, caption: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isPosting}
            className="w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-lg"
          >
            {isPosting ? "Posting..." : "Publish to Feed"}
          </button>
        </form>
      </div>

      {/* --- RIGHT COLUMN: MANAGE POSTS --- */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Media Library
        </h1>
        <p className="text-brand-muted mb-6">
          Manage all photos and videos on the feed.
        </p>

        <div className="space-y-4">
          {loading ? (
            <div className="text-brand-muted">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center text-brand-muted">
              No media posts yet. Use the form to create one!
            </div>
          ) : (
            posts.map((post) => {
              const youtubeId =
                post.type === "video" ? getYouTubeId(post.url) : null;

              return (
                <div
                  key={post.id}
                  className={`bg-brand-gray/30 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 transition-all hover:bg-brand-gray/50 ${
                    editingId === post.id
                      ? "ring-2 ring-brand-accent bg-brand-gray"
                      : ""
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-full sm:w-40 h-32 bg-black rounded-xl overflow-hidden shrink-0 relative group">
                    {post.type === "video" ? (
                      youtubeId ? (
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                          alt="Video Thumb"
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <video
                          src={post.url}
                          className="w-full h-full object-cover opacity-80"
                        />
                      )
                    ) : (
                      <img
                        src={post.url}
                        alt="Post"
                        className="w-full h-full object-cover opacity-80"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase backdrop-blur-sm border border-white/10">
                      {post.type}
                    </div>
                  </div>

                  {/* Content & Edit Mode */}
                  <div className="flex-1 flex flex-col justify-center">
                    {editingId === post.id ? (
                      <div className="space-y-3 animate-fade-in">
                        <input
                          type="text"
                          value={editForm.event_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              event_name: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-brand-accent rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                          placeholder="Event Name"
                        />
                        <textarea
                          value={editForm.caption}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              caption: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-brand-accent rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none h-16 resize-none"
                          placeholder="Caption"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdate}
                            className="bg-brand-accent text-brand-dark px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-brand-muted px-3 py-1.5 text-xs hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-white">
                            {post.event_name}
                          </h3>
                          <span className="text-xs text-brand-muted">
                            {post.date}
                          </span>
                        </div>
                        <p className="text-sm text-brand-muted line-clamp-2 mb-3">
                          {post.caption}
                        </p>

                        <div className="flex gap-3 mt-auto">
                          <button
                            onClick={() => startEdit(post)}
                            className="text-xs font-bold text-brand-muted hover:text-white flex items-center gap-1 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-xs font-bold text-brand-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-brand-muted hover:text-brand-accent flex items-center gap-1 transition-colors ml-auto"
                          >
                            🔗 Link
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaManager;
