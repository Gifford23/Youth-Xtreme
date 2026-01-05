import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import MediaGrid from "../components/media/MediaGrid";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  caption: string;
  event_name: string;
  date: string;
  featured: boolean;
  created_at: any;
}

interface EventGroup {
  eventName: string;
  date: string;
  items: MediaItem[];
}

const Media = () => {
  const [groupedMedia, setGroupedMedia] = useState<EventGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // --- CRUD STATE ---
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({
    url: "",
    caption: "",
    event_name: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");

  // --- 1. READ (Fetch & Group Data) ---
  const groupMediaByEvent = (flatList: MediaItem[]) => {
    const groups: { [key: string]: EventGroup } = {};
    flatList.forEach((item) => {
      const key = item.event_name || "General Highlights";
      if (!groups[key]) {
        groups[key] = {
          eventName: key,
          date: item.date,
          items: [],
        };
      }
      groups[key].items.push(item);
    });
    return Object.values(groups);
  };

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    const q = query(collection(db, "media"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const rawData = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as MediaItem)
      );
      const groups = groupMediaByEvent(rawData);
      setGroupedMedia(groups);
      setLoading(false);
    });
    return unsub;
  }, []);

  // --- 2. CREATE (Add New Post) ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newPost.url || !newPost.event_name) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, "media"), {
        type: "photo", // Defaulting to photo for simplicity (URL based)
        url: newPost.url,
        caption: newPost.caption,
        event_name: newPost.event_name,
        date: newPost.date,
        featured: false,
        created_at: serverTimestamp(),
      });
      // Reset form
      setNewPost({
        url: "",
        caption: "",
        event_name: "",
        date: new Date().toISOString().split("T")[0],
      });
      alert("✅ Moment shared successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("❌ Failed to post.");
    } finally {
      setIsPosting(false);
    }
  };

  // --- 3. DELETE (Remove Item) ---
  const handleDelete = async (id: string) => {
    if (!db || !confirm("Are you sure you want to delete this moment?")) return;
    try {
      await deleteDoc(doc(db, "media", id));
      setSelectedItem(null); // Close lightbox
    } catch (error) {
      console.error("Error removing document: ", error);
      alert("❌ Failed to delete.");
    }
  };

  // --- 4. UPDATE (Edit Caption) ---
  const handleUpdate = async () => {
    if (!db || !selectedItem) return;
    try {
      await updateDoc(doc(db, "media", selectedItem.id), {
        caption: editCaption,
      });
      // Update local state to reflect change immediately in lightbox
      setSelectedItem({ ...selectedItem, caption: editCaption });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("❌ Failed to update.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            Xtreme <span className="text-brand-accent">Feed</span>
          </h1>
          <p className="text-lg text-brand-muted">
            Share and relive the best moments.
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-10 bg-brand-gray p-6 rounded-3xl border border-white/5 text-center">
            <p className="text-brand-muted">Firebase is not configured.</p>
          </div>
        )}

        {/* --- CREATE SECTION (Facebook Style Input) --- */}
        <div className="bg-brand-gray rounded-3xl p-6 border border-white/5 shadow-xl mb-12 animate-fade-in-up">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center text-brand-dark font-bold text-lg shrink-0">
                You
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Paste an Image URL (e.g., from Unsplash)..."
                  className="w-full bg-brand-dark/50 border-none rounded-xl px-4 py-3 text-white placeholder-brand-muted focus:ring-1 focus:ring-brand-accent transition-all"
                  value={newPost.url}
                  onChange={(e) =>
                    setNewPost({ ...newPost, url: e.target.value })
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Event Name (e.g., Neon Night)"
                    className="bg-brand-dark/50 border-none rounded-xl px-4 py-3 text-white placeholder-brand-muted text-sm focus:ring-1 focus:ring-brand-accent"
                    value={newPost.event_name}
                    onChange={(e) =>
                      setNewPost({ ...newPost, event_name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="date"
                    className="bg-brand-dark/50 border-none rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-brand-accent [color-scheme:dark]"
                    value={newPost.date}
                    onChange={(e) =>
                      setNewPost({ ...newPost, date: e.target.value })
                    }
                    required
                  />
                </div>
                <textarea
                  placeholder="Write a caption..."
                  className="w-full bg-brand-dark/50 border-none rounded-xl px-4 py-3 text-white placeholder-brand-muted text-sm focus:ring-1 focus:ring-brand-accent resize-none h-20"
                  value={newPost.caption}
                  onChange={(e) =>
                    setNewPost({ ...newPost, caption: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="submit"
                disabled={isPosting}
                className="bg-brand-accent text-brand-dark font-bold px-8 py-2 rounded-xl hover:bg-white hover:scale-105 transition-all disabled:opacity-50"
              >
                {isPosting ? "Posting..." : "Post Moment"}
              </button>
            </div>
          </form>
        </div>

        {/* --- READ SECTION (Feed) --- */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
          </div>
        ) : groupedMedia.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-brand-muted">
              No posts yet. Be the first to share!
            </p>
          </div>
        ) : (
          <div className="space-y-12 animate-fade-in-up">
            {groupedMedia.map((group) => (
              <div
                key={group.eventName + group.date}
                className="bg-brand-gray/50 rounded-3xl p-6 border border-white/5 shadow-2xl"
              >
                {/* Post Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center text-brand-dark font-bold text-lg shadow-lg">
                    YX
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {group.eventName}
                    </h3>
                    <p className="text-brand-muted text-xs font-medium uppercase tracking-wider">
                      {group.date} • {group.items.length} moments
                    </p>
                  </div>
                </div>

                {/* Group Caption (uses first item's caption) */}
                <p className="text-white mb-4 pl-1 text-sm sm:text-base opacity-90">
                  {group.items[0]?.caption}
                </p>

                {/* Grid */}
                <MediaGrid
                  items={group.items}
                  onItemClick={(item) => {
                    setSelectedItem(item);
                    setEditCaption(item.caption); // Initialize edit form
                    setIsEditing(false); // Reset edit mode
                  }}
                />

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <button className="flex items-center gap-2 text-brand-muted hover:text-brand-accent transition-colors text-sm font-bold px-4 py-2 hover:bg-white/5 rounded-lg">
                    <span>🔥</span> Fire
                  </button>
                  <button className="flex items-center gap-2 text-brand-muted hover:text-brand-accent transition-colors text-sm font-bold px-4 py-2 hover:bg-white/5 rounded-lg">
                    <span>🙌</span> Amen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- LIGHTBOX (With UPDATE & DELETE) --- */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="relative max-w-6xl w-full h-full flex flex-col justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-black/50 text-white hover:bg-white hover:text-black flex items-center justify-center transition-all"
              >
                ✕
              </button>

              {/* CRUD Actions */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2"
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/10 text-white hover:bg-brand-accent hover:text-brand-dark px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2"
                >
                  ✏️ {isEditing ? "Cancel Edit" : "Edit Caption"}
                </button>
              </div>

              {/* Image Display */}
              <div className="flex-1 flex items-center justify-center overflow-hidden mb-4">
                {selectedItem.type === "video" ? (
                  <video
                    className="max-h-full max-w-full rounded-xl shadow-2xl"
                    controls
                    autoPlay
                    src={selectedItem.url}
                  />
                ) : (
                  <img
                    src={selectedItem.url}
                    alt="Full view"
                    className="max-h-full max-w-full rounded-xl shadow-2xl"
                  />
                )}
              </div>

              {/* Caption / Edit Form */}
              <div className="bg-black/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-2xl mx-auto w-full">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="flex-1 bg-white/10 border-none rounded-lg px-4 py-2 text-white"
                    />
                    <button
                      onClick={handleUpdate}
                      className="bg-brand-accent text-brand-dark font-bold px-4 py-2 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {selectedItem.event_name}
                    </h3>
                    <p className="text-brand-muted">{selectedItem.caption}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;
