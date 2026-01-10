import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp, // ✅ Import Timestamp
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion } from "framer-motion";

// --- TYPES ---
interface Reel {
  id: string;
  video: string;
  caption: string;
  createdAt: any; // Firestore Timestamp
}

const ManageReels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    videoInput: "",
    caption: "",
  });

  // 1. READ (Fetch Reels)
  useEffect(() => {
    const q = query(collection(db, "reels"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reelsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reel[];
      setReels(reelsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- HELPER: Extract SRC from Iframe String ---
  const extractSrc = (input: string) => {
    if (input.includes("<iframe")) {
      const srcMatch = input.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : input;
    }
    return input;
  };

  // --- HELPER: Format Date ---
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown Date";
    // Check if it's a Firestore Timestamp (has .toDate()) or a regular Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 2. CREATE / UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoInput) return;

    const cleanUrl = extractSrc(formData.videoInput);

    try {
      if (isEditing && currentId) {
        // UPDATE
        const docRef = doc(db, "reels", currentId);
        await updateDoc(docRef, {
          video: cleanUrl,
          caption: formData.caption,
        });
        alert("Reel updated successfully!");
      } else {
        // CREATE
        await addDoc(collection(db, "reels"), {
          video: cleanUrl,
          caption: formData.caption,
          createdAt: new Date(), // This saves as a Timestamp in Firestore
        });
        alert("New Reel added!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving reel:", error);
      alert("Error saving reel: " + error);
    }
  };

  // 3. DELETE
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this reel?")) {
      await deleteDoc(doc(db, "reels", id));
    }
  };

  const handleEdit = (reel: Reel) => {
    setIsEditing(true);
    setCurrentId(reel.id);
    setFormData({
      videoInput: reel.video,
      caption: reel.caption,
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ videoInput: "", caption: "" });
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-display font-bold">Manage Reels</h1>
          <span className="text-brand-muted text-sm">
            Total Reels: {reels.length}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: FORM SECTION */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-brand-accent">
                {isEditing ? "Edit Reel" : "Add New Reel"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                    Video Embed Code or URL
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste the full <iframe...> code from Facebook here..."
                    value={formData.videoInput}
                    onChange={(e) =>
                      setFormData({ ...formData, videoInput: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-brand-accent focus:outline-none text-sm font-mono"
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Tip: You can paste the entire Facebook iframe code; we'll
                    extract the link automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
                    Internal Caption (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Campus Tour Highlights"
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData({ ...formData, caption: e.target.value })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-brand-accent focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-white transition-colors"
                  >
                    {isEditing ? "Update Reel" : "Add Reel"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: LIST SECTION */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-10 text-brand-muted">
                Loading reels...
              </div>
            ) : reels.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-xl text-brand-muted">
                No reels found. Add your first one!
              </div>
            ) : (
              reels.map((reel) => (
                <motion.div
                  key={reel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex gap-4 items-center group hover:border-white/20 transition-colors"
                >
                  {/* Preview Thumbnail (Live Iframe) */}
                  <div className="w-20 h-32 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/10 relative">
                    <div className="absolute inset-0 z-10 bg-transparent"></div>
                    <iframe
                      src={reel.video}
                      className="w-full h-full object-cover scale-[2.5] origin-top-left"
                      style={{ pointerEvents: "none" }}
                    ></iframe>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {reel.caption || "Untitled Reel"}
                    </h3>
                    <p className="text-xs text-brand-muted truncate mt-1 font-mono opacity-60">
                      {reel.video}
                    </p>

                    {/* ✅ ADDED: Date Display */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-block text-[10px] bg-white/5 px-2 py-1 rounded border border-white/5 text-brand-muted">
                        Facebook Reel
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(reel.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(reel)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      title="Edit"
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
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(reel.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete"
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
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageReels;
