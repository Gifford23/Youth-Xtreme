import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

const MediaManager = () => {
  const [isPosting, setIsPosting] = useState(false);

  // Form State
  const [newPost, setNewPost] = useState({
    url: "",
    caption: "",
    event_name: "",
    date: new Date().toISOString().split("T")[0],
    type: "photo" as "photo" | "video", // Added Type Selector
  });

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          Media Manager
        </h1>
        <p className="text-brand-muted">
          Upload photos and videos to the public Xtreme Feed.
        </p>
      </div>

      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📸</span> Create New Post
        </h2>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Media Type Selector */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setNewPost({ ...newPost, type: "photo" })}
              className={`p-3 rounded-xl border text-center font-bold transition-all ${
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
              className={`p-3 rounded-xl border text-center font-bold transition-all ${
                newPost.type === "video"
                  ? "bg-brand-accent text-brand-dark border-brand-accent"
                  : "bg-black/20 text-brand-muted border-white/10 hover:bg-white/5"
              }`}
            >
              Video
            </button>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
              Media URL
            </label>
            <input
              type="text"
              placeholder={
                newPost.type === "photo"
                  ? "Image URL (Unsplash, etc.)"
                  : "Video URL (MP4 Link)"
              }
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none transition-colors"
              value={newPost.url}
              onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
              required
            />
          </div>

          {/* Event & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                Event Name
              </label>
              <input
                type="text"
                placeholder="e.g. Neon Night"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                value={newPost.event_name}
                onChange={(e) =>
                  setNewPost({ ...newPost, event_name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                Date
              </label>
              <input
                type="date"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none [color-scheme:dark]"
                value={newPost.date}
                onChange={(e) =>
                  setNewPost({ ...newPost, date: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
              Caption
            </label>
            <textarea
              placeholder="What happened in this moment?"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none h-32 resize-none"
              value={newPost.caption}
              onChange={(e) =>
                setNewPost({ ...newPost, caption: e.target.value })
              }
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isPosting}
              className="w-full bg-brand-accent text-brand-dark font-bold py-4 rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-lg shadow-brand-accent/10"
            >
              {isPosting ? "Posting..." : "Publish to Feed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaManager;
