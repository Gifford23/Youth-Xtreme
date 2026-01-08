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

    // ✅ FIX: Added () to call the function
    return () => unsub();
  }, []);

  // --- 2. SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quote)
      return alert("Name and Quote are required!");

    try {
      if (isEditing) {
        await updateDoc(doc(db, "testimonials", isEditing.id), { ...formData });
        alert("Updated successfully!");
        setIsEditing(null);
      } else {
        await addDoc(collection(db, "testimonials"), {
          ...formData,
          created_at: serverTimestamp(),
        });
        alert("Created successfully!");
      }
      setFormData({ name: "", campus: "Liceo U", role: "Member", quote: "", image: "" });
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
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">Name</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Angelo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">Campus</label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                >
                  {["Liceo U", "USTP", "Phinma COC", "Xavier U", "Capitol U", "SPC", "Other"].map((c) => (
                    <option key={c} value={c} className="bg-brand-dark">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase mb-1">Role</label>
                <input
                  type="text"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Student Leader"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">Image URL</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/testimonials/angelo.jpg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">Testimony Quote</label>
              <textarea
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none h-32 resize-none"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="Share their story..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-brand-accent text-brand-dark font-bold py-3 rounded-xl hover:bg-white transition-colors">
                {isEditing ? "Update Story" : "Publish Story"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(null);
                    setFormData({ name: "", campus: "Liceo U", role: "Member", quote: "", image: "" });
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
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold">Existing Stories</h2>
            <span className="bg-brand-accent/10 text-brand-accent text-xs font-bold px-2 py-1 rounded-md border border-brand-accent/20">
              {testimonials.length} Total
            </span>
          </div>

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
                  className="bg-brand-dark border border-white/10 p-5 rounded-2xl flex gap-5 items-start group hover:border-brand-accent/30 hover:bg-white/5 transition-all"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-black border-2 border-white/10 shadow-lg group-hover:border-brand-accent transition-colors">
                    <img
                      src={item.image || "https://placehold.co/100x100?text=?"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=?"; }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-white leading-none mb-2">{item.name}</h4>
                        
                        {/* ORGANIZED BADGES */}
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-brand-accent text-brand-dark uppercase tracking-wide">
                            {item.campus}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-gray-300 border border-white/10">
                            {item.role}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-white/5 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Quote Preview */}
                    <div className="relative pl-3 border-l-2 border-white/20 mt-3">
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 italic">
                        "{item.quote}"
                      </p>
                    </div>
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