import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface AppEvent {
  id: string;
  title: string;
  event_date: any;
  location: string;
  category: string;
  image_url: string;
  description: string;
  is_featured?: boolean;
}

const CalendarManager = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "Worship",
    imageUrl: "",
    description: "",
  });

  // 1. Fetch Events
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("event_date", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AppEvent[];
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. TOGGLE FEATURED LOGIC (Activate/Deactivate)
  const handleSetFeatured = async (event: AppEvent) => {
    if (!db) return;
    try {
      const batch = writeBatch(db);
      const newStatus = !event.is_featured; // Toggle the current status

      // If we are activating this event, we must deactivate all others first
      if (newStatus === true) {
        const featuredQuery = query(
          collection(db, "events"),
          where("is_featured", "==", true)
        );
        const featuredSnapshot = await getDocs(featuredQuery);

        featuredSnapshot.forEach((doc) => {
          // Don't waste writes on the one we're about to change anyway
          if (doc.id !== event.id) {
            batch.update(doc.ref, { is_featured: false });
          }
        });
      }

      // Update the specific event with the new status (True or False)
      const eventRef = doc(db, "events", event.id);
      batch.update(eventRef, { is_featured: newStatus });

      await batch.commit();
    } catch (error) {
      console.error("Error updating featured event:", error);
      alert("❌ Failed to update status.");
    }
  };

  // 3. Handle Create / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    try {
      const eventDateTime = new Date(`${form.date}T${form.time}`);

      const eventData = {
        title: form.title,
        event_date: eventDateTime,
        location: form.location,
        category: form.category,
        image_url: form.imageUrl,
        description: form.description,
        updated_at: serverTimestamp(),
      };

      if (isEditing && selectedId) {
        await updateDoc(doc(db, "events", selectedId), eventData);
        alert("✅ Event Updated!");
      } else {
        await addDoc(collection(db, "events"), {
          ...eventData,
          is_featured: false,
          created_at: serverTimestamp(),
        });
        alert("✅ Event Created!");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("❌ Failed to save.");
    }
  };

  // 4. Handle Delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "events", id));
    }
  };

  // 5. Load Event into Form
  const handleEdit = (event: AppEvent) => {
    setIsEditing(true);
    setSelectedId(event.id);

    let dateStr = "";
    let timeStr = "";

    if (event.event_date?.toDate) {
      const d = event.event_date.toDate();
      dateStr = d.toISOString().split("T")[0];
      timeStr = d.toTimeString().slice(0, 5);
    }

    setForm({
      title: event.title,
      date: dateStr,
      time: timeStr,
      location: event.location,
      category: event.category,
      imageUrl: event.image_url,
      description: event.description || "",
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({
      title: "",
      date: "",
      time: "",
      location: "",
      category: "Worship",
      imageUrl: "",
      description: "",
    });
  };

  if (loading)
    return <div className="p-8 text-brand-muted">Loading events...</div>;

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[400px,1fr] gap-8">
      {/* LEFT COLUMN: FORM */}
      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 p-6 h-fit sticky top-24">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
          <span>{isEditing ? "Edit Event" : "Create New Event"}</span>
          {isEditing && (
            <button
              onClick={resetForm}
              className="text-xs text-brand-muted hover:text-white underline"
            >
              Cancel
            </button>
          )}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
              placeholder="e.g. Youth Camp 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-brand-accent focus:outline-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Time
              </label>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-brand-accent focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Location
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-brand-accent focus:outline-none"
                placeholder="Main Hall"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-brand-accent focus:outline-none"
              >
                <option>Worship</option>
                <option>Fellowship</option>
                <option>Outreach</option>
                <option>Workshop</option>
                <option>Special</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Image URL
            </label>
            <input
              type="text"
              required
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-accent focus:outline-none h-20 resize-none"
              placeholder="Event details..."
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
              isEditing
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-brand-accent text-brand-dark hover:bg-white"
            }`}
          >
            {isEditing ? "Update Event" : "Create Event"}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: LIST */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-6">
          Upcoming Events
        </h1>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-2xl text-brand-muted">
              No events found. Create one to get started!
            </div>
          ) : (
            events.map((event) => {
              const dateObj = event.event_date?.toDate
                ? event.event_date.toDate()
                : null;

              return (
                <div
                  key={event.id}
                  className={`group flex flex-col sm:flex-row gap-4 bg-brand-gray/30 hover:bg-brand-gray border p-4 rounded-2xl transition-all ${
                    event.is_featured
                      ? "border-brand-accent shadow-[0_0_15px_rgba(204,255,0,0.1)] bg-brand-gray"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Image Thumb */}
                  <div className="w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-black relative">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    {event.is_featured && (
                      <div className="absolute top-2 left-2 bg-brand-accent text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
                        Active
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-brand-muted">
                        {event.category}
                      </span>
                      {dateObj && (
                        <span className="text-xs text-brand-accent font-bold">
                          {dateObj.toLocaleDateString()} •{" "}
                          {dateObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-brand-muted line-clamp-2">
                      {event.description || "No description provided."}
                    </p>
                    <div className="text-xs text-brand-muted mt-2 flex items-center gap-1">
                      <span>📍</span> {event.location}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row sm:flex-col justify-center gap-2 sm:border-l sm:border-white/10 sm:pl-4">
                    {/* ✅ TOGGLE BUTTON */}
                    <button
                      onClick={() => handleSetFeatured(event)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        event.is_featured
                          ? "bg-brand-accent text-brand-dark hover:bg-white"
                          : "bg-white/5 hover:bg-brand-accent/20 hover:text-brand-accent text-brand-muted"
                      }`}
                      title={
                        event.is_featured
                          ? "Click to Deactivate"
                          : "Click to Activate"
                      }
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="sm:hidden md:inline">
                        {event.is_featured ? "ON" : "OFF"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-brand-muted text-sm font-bold transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-brand-muted text-sm font-bold transition-all"
                    >
                      Delete
                    </button>
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

export default CalendarManager;
