import { useState, useEffect, useMemo } from "react";
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

// ✅ CONFIGURATION
const SCHOOLS = ["General", "Liceo", "USTP", "COC", "CU", "STI", "SPC"];

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  caption: string;
  event_name: string;
  date: string;
  school?: string;
  created_at: any;
}

const MediaManager = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");
  const [posts, setPosts] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSchool, setFilterSchool] = useState("All");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // ✅ URL List State
  const [currentUrl, setCurrentUrl] = useState(""); // The input field
  const [addedUrls, setAddedUrls] = useState<string[]>([]); // The list of valid URLs

  // Form State
  const [formData, setFormData] = useState({
    caption: "",
    event_name: "",
    date: new Date().toISOString().split("T")[0],
    type: "photo" as "photo" | "video",
    school: "General",
  });

  // --- 1. REAL-TIME DATA FETCH ---
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

  // --- 2. HANDLE ADDING URL TO LIST ---
  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUrl.trim()) return;

    setAddedUrls((prev) => [...prev, currentUrl.trim()]);
    setCurrentUrl(""); // Clear input
  };

  const removeUrl = (index: number) => {
    setAddedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // --- 3. PUBLISH ALL URLS ---
  const handlePublish = async () => {
    if (!db || addedUrls.length === 0 || !formData.event_name) {
      return alert("Please add at least one URL and an Event Name.");
    }

    setIsPosting(true);
    try {
      // Loop through all added URLs and create a post for each
      const promises = addedUrls.map((url) => {
        return addDoc(collection(db, "media"), {
          type: formData.type,
          url: url,
          caption: formData.caption,
          event_name: formData.event_name,
          date: formData.date,
          school: formData.school,
          featured: false,
          created_at: serverTimestamp(),
        });
      });

      await Promise.all(promises);

      // Reset Form
      setAddedUrls([]);
      setFormData({
        caption: "",
        event_name: "",
        date: new Date().toISOString().split("T")[0],
        type: "photo",
        school: "General",
      });
      alert(`✅ Successfully published ${addedUrls.length} items!`);
      setActiveTab("library");
    } catch (error) {
      console.error("Error posting: ", error);
      alert("❌ Failed to post.");
    } finally {
      setIsPosting(false);
    }
  };

  // --- 4. DELETE ---
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, "media", id));
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  // --- 5. UPDATE ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await updateDoc(doc(db, "media", editingItem.id), {
        url: editingItem.url,
        caption: editingItem.caption,
        event_name: editingItem.event_name,
        date: editingItem.date,
        school: editingItem.school,
        type: editingItem.type,
      });
      setEditingItem(null);
    } catch (error) {
      alert("Failed to update.");
    }
  };

  // Filter Logic
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.event_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSchool =
        filterSchool === "All" || post.school === filterSchool;
      return matchesSearch && matchesSchool;
    });
  }, [posts, searchTerm, filterSchool]);

  // ✅ Helper: Extract YouTube ID
  const getYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Media <span className="text-brand-accent">Manager</span>
          </h1>
          <p className="text-brand-muted">
            Curate the feed. Add photos, video montages, and highlights.
          </p>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mt-4 md:mt-0">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "library"
                ? "bg-brand-accent text-brand-dark shadow-lg"
                : "text-brand-muted hover:text-white"
            }`}
          >
            📚 Library
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "upload"
                ? "bg-brand-accent text-brand-dark shadow-lg"
                : "text-brand-muted hover:text-white"
            }`}
          >
            ☁️ Upload New
          </button>
        </div>
      </div>

      {/* --- TAB 1: UPLOAD NEW --- */}
      {activeTab === "upload" && (
        <div className="max-w-4xl mx-auto animate-fade-in-up grid md:grid-cols-[1.5fr,1fr] gap-8">
          {/* Left Column: Input Form */}
          <div className="bg-brand-gray/50 rounded-3xl border border-white/5 p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              Create Album / Montage
            </h2>

            <div className="space-y-4">
              {/* Type Select */}
              <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "photo" })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                    formData.type === "photo"
                      ? "bg-brand-accent text-brand-dark shadow-md"
                      : "text-brand-muted hover:text-white"
                  }`}
                >
                  📸 Photos
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "video" })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                    formData.type === "video"
                      ? "bg-brand-accent text-brand-dark shadow-md"
                      : "text-brand-muted hover:text-white"
                  }`}
                >
                  🎥 Videos
                </button>
              </div>

              {/* URL ADDER */}
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1 ml-1">
                  {formData.type === "video"
                    ? "Add Video URL (YouTube)"
                    : "Add Image URL"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      formData.type === "video"
                        ? "https://youtube.com/watch?v=..."
                        : "https://example.com/image.jpg"
                    }
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent focus:outline-none"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddUrl(e)}
                  />
                  <button
                    onClick={handleAddUrl}
                    disabled={!currentUrl}
                    className="bg-white/10 text-white font-bold px-4 rounded-xl hover:bg-white/20 disabled:opacity-50"
                  >
                    ➕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase mb-1 ml-1">
                    Event
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-brand-accent focus:outline-none"
                    value={formData.event_name}
                    onChange={(e) =>
                      setFormData({ ...formData, event_name: e.target.value })
                    }
                    placeholder="Event Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase mb-1 ml-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-brand-accent focus:outline-none [color-scheme:dark]"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1 ml-1">
                  School
                </label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-brand-accent focus:outline-none"
                  value={formData.school}
                  onChange={(e) =>
                    setFormData({ ...formData, school: e.target.value })
                  }
                >
                  {SCHOOLS.map((s) => (
                    <option key={s} value={s} className="bg-brand-dark">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1 ml-1">
                  Caption
                </label>
                <textarea
                  placeholder="Caption for these moments..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent focus:outline-none h-20 resize-none"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handlePublish}
                disabled={isPosting || addedUrls.length === 0}
                className="w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-xl hover:bg-white transition-all transform active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg"
              >
                {isPosting
                  ? "Publishing..."
                  : `Publish ${addedUrls.length} Items`}
              </button>
            </div>
          </div>

          {/* Right Column: Preview Area (Optimized for Video & Photo) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-bold text-sm">
                Preview Queue ({addedUrls.length})
              </h3>
              {addedUrls.length > 0 && (
                <button
                  onClick={() => setAddedUrls([])}
                  className="text-xs text-red-400 hover:text-white"
                >
                  Clear All
                </button>
              )}
            </div>

            {addedUrls.length === 0 ? (
              <div className="border-2 border-dashed border-white/10 rounded-2xl h-64 flex flex-col items-center justify-center text-brand-muted p-8 text-center">
                <span className="text-2xl mb-2">
                  {formData.type === "video" ? "🎬" : "🖼️"}
                </span>
                <p className="text-sm">
                  Paste a URL and click "➕" to see it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {addedUrls.map((url, idx) => {
                  const isVideo = formData.type === "video";
                  const youtubeId = isVideo ? getYouTubeId(url) : null;

                  return (
                    <div
                      key={idx}
                      className="relative group aspect-square bg-black rounded-xl overflow-hidden border border-white/10"
                    >
                      {/* ✅ Smart Preview for Videos */}
                      {isVideo ? (
                        youtubeId ? (
                          <div className="w-full h-full relative">
                            <img
                              src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                              alt="Video Preview"
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/50 rounded-full p-1">
                                ▶️
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-brand-muted">
                            <span className="text-lg">📹</span>
                            <span className="text-[10px] mt-1">Video URL</span>
                          </div>
                        )
                      ) : (
                        <img
                          src={url}
                          alt="Preview"
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/400x400?text=Invalid+URL";
                          }}
                        />
                      )}

                      <button
                        onClick={() => removeUrl(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 z-10"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white font-mono backdrop-blur-sm">
                        #{idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: LIBRARY (MANAGE) --- */}
      {activeTab === "library" && (
        <div className="animate-fade-in">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-500 absolute left-3 top-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <select
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none cursor-pointer"
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
            >
              <option value="All">All Schools</option>
              {SCHOOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Table / Grid */}
          <div className="bg-brand-gray/30 border border-white/5 rounded-2xl overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="p-8 text-center text-brand-muted">
                Loading library...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="text-4xl mb-2">📂</div>
                <h3 className="text-white font-bold mb-1">Library Empty</h3>
                <p className="text-brand-muted text-sm">
                  No media found matching your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {filteredPosts.map((post) => {
                  const youtubeId =
                    post.type === "video" ? getYouTubeId(post.url) : null;
                  return (
                    <div
                      key={post.id}
                      className="bg-brand-dark border border-white/5 rounded-xl overflow-hidden group hover:border-white/20 transition-all flex flex-col"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-40 bg-black">
                        {post.type === "video" ? (
                          youtubeId ? (
                            <div className="w-full h-full relative">
                              <img
                                src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                                className="w-full h-full object-cover opacity-80"
                              />
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <span className="text-2xl">▶️</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-muted">
                              Video File
                            </div>
                          )
                        ) : (
                          <img
                            src={post.url}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm border border-white/10 uppercase">
                          {post.school || "General"}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h4
                          className="font-bold text-white text-sm mb-1 line-clamp-1"
                          title={post.event_name}
                        >
                          {post.event_name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {post.date}
                        </p>
                        <p className="text-xs text-brand-muted line-clamp-2 mb-4 flex-1">
                          {post.caption || "No caption"}
                        </p>

                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => setEditingItem(post)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-2 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-gray border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Edit Media</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                  Media URL
                </label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent focus:outline-none"
                  value={editingItem.url}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, url: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent focus:outline-none"
                    value={editingItem.event_name}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        event_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                    School
                  </label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent focus:outline-none"
                    value={editingItem.school}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, school: e.target.value })
                    }
                  >
                    {SCHOOLS.map((s) => (
                      <option key={s} value={s} className="bg-brand-dark">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                  Caption
                </label>
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-brand-accent focus:outline-none h-24 resize-none"
                  value={editingItem.caption}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, caption: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-accent text-brand-dark font-bold py-3 rounded-xl hover:bg-white transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;
