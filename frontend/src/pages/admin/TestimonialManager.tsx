import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

// --- TYPES ---
interface Testimonial {
  id: string;
  name: string;
  campus: string;
  role: string;
  quote: string;
  image: string;
}

const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Testimonial | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    campus: "Liceo U",
    role: "Member",
    quote: "",
    image: "",
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    // Listen to real-time updates
    const q = query(
      collection(db, "testimonials"),
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Testimonial)
      );
      setTestimonials(data);
      setLoading(false);
    });
    return () => unsub;
  }, []);

  // --- 2. SUBMIT (CREATE / UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quote)
      return alert("Name and Quote are required!");

    try {
      if (isEditing) {
        // UPDATE existing
        await updateDoc(doc(db, "testimonials", isEditing.id), {
          ...formData,
        });
        alert("Updated successfully!");
        setIsEditing(null);
      } else {
        // CREATE new
        await addDoc(collection(db, "testimonials"), {
          ...formData,
          created_at: serverTimestamp(),
        });
        alert("Created successfully!");
      }

      // Reset Form
      setFormData({
        name: "",
        campus: "Liceo U",
        role: "Member",
        quote: "",
        image: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error saving testimonial.");
    }
  };

  // --- 3. DELETE ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await deleteDoc(doc(db, "testimonials", id));
    } catch (error) {
      alert("Error deleting.");
    }
  };

  // --- 4. PREPARE EDIT ---
  const handleEdit = (item: Testimonial) => {
    setIsEditing(item);
    setFormData({
      name: item.name,
      campus: item.campus,
      role: item.role,
      quote: item.quote,
      image: item.image,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Testimonial <span className="text-brand-accent">Manager</span>
        </h1>
        <p className="text-brand-muted">Share stories of transformation.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr,1.5fr] gap-8">
        {/* --- LEFT: FORM --- */}
        <div className="bg-brand-gray/50 border border-white/5 rounded-3xl p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-white mb-6">
            {isEditing ? "Edit Story" : "Add New Story"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Angelo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                  Campus
                </label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                  value={formData.campus}
                  onChange={(e) =>
                    setFormData({ ...formData, campus: e.target.value })
                  }
                >
                  {[
                    "Liceo U",
                    "USTP",
                    "Phinma COC",
                    "Xavier U",
                    "Capitol U",
                    "SPC",
                    "Other",
                  ].map((c) => (
                    <option key={c} value={c} className="bg-brand-dark">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                  Role
                </label>
                <input
                  type="text"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="e.g. Student Leader"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Image URL or Path
              </label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="/testimonials/angelo.jpg"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Paste a full URL or a path from your public folder.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Testimony Quote
              </label>
              <textarea
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none h-32 resize-none"
                value={formData.quote}
                onChange={(e) =>
                  setFormData({ ...formData, quote: e.target.value })
                }
                placeholder="Share their story..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-brand-accent text-brand-dark font-bold py-3 rounded-xl hover:bg-white transition-colors"
              >
                {isEditing ? "Update Story" : "Publish Story"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(null);
                    setFormData({
                      name: "",
                      campus: "Liceo U",
                      role: "Member",
                      quote: "",
                      image: "",
                    });
                  }}
                  className="px-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- RIGHT: LIST --- */}
        <div className="space-y-4">
          <h2 className="text-white font-bold mb-4">
            Existing Stories ({testimonials.length})
          </h2>

          {loading ? (
            <p className="text-brand-muted">Loading...</p>
          ) : testimonials.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center text-brand-muted">
              No stories yet. Add one via the form!
            </div>
          ) : (
            <div className="grid gap-4">
              {testimonials.map((item) => (
                <div
                  key={item.id}
                  className="bg-brand-dark border border-white/10 p-4 rounded-2xl flex gap-4 items-start group hover:border-brand-accent/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-black border border-white/20">
                    <img
                      src={item.image || "https://placehold.co/100x100?text=?"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/100x100?text=?";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold">{item.name}</h4>
                        <p className="text-brand-accent text-xs uppercase font-bold">
                          {item.campus} <span className="text-gray-500">|</span>{" "}
                          {item.role}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2 italic">
                      "{item.quote}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialManager;
