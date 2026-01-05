import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("events");

  // Event Form State
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "Worship",
    imageUrl: "",
    description: "",
  });

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      // Create a proper JS Date object
      const eventDateTime = new Date(`${eventForm.date}T${eventForm.time}`);

      await addDoc(collection(db, "events"), {
        title: eventForm.title,
        event_date: eventDateTime, // Firestore Timestamp
        location: eventForm.location,
        category: eventForm.category,
        image_url: eventForm.imageUrl,
        description: eventForm.description,
        created_at: serverTimestamp(),
      });
      alert("✅ Event Created Successfully!");
      setEventForm({
        title: "",
        date: "",
        time: "",
        location: "",
        category: "Worship",
        imageUrl: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      alert("❌ Failed to create event.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          ADMIN <span className="text-brand-accent">DASHBOARD</span>
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-white/10 pb-1">
          {["events", "photos", "content"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all rounded-t-lg ${
                activeTab === tab
                  ? "bg-brand-accent text-brand-dark"
                  : "text-brand-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* --- EVENTS TAB --- */}
      {activeTab === "events" && (
        <div className="bg-brand-gray/50 rounded-2xl border border-white/5 p-8 shadow-xl">
          <form onSubmit={handleEventSubmit} className="space-y-6">
            <div>
              <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                Event Title
              </label>
              <input
                type="text"
                placeholder="e.g., Neon Night Worship"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none transition-colors"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                  Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none [color-scheme:dark]"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                    required
                  />
                  <input
                    type="time"
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none [color-scheme:dark]"
                    value={eventForm.time}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                  Category
                </label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                  value={eventForm.category}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, category: e.target.value })
                  }
                >
                  <option value="Worship">Worship</option>
                  <option value="Fellowship">Fellowship</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Main Sanctuary"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                value={eventForm.location}
                onChange={(e) =>
                  setEventForm({ ...eventForm, location: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                Image URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                value={eventForm.imageUrl}
                onChange={(e) =>
                  setEventForm({ ...eventForm, imageUrl: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                Description
              </label>
              <textarea
                placeholder="What is this event about?"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none h-32 resize-none"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
              />
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                type="submit"
                className="w-full bg-brand-accent text-brand-dark font-bold py-4 rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-accent/20"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- PHOTOS TAB PLACEHOLDER --- */}
      {activeTab === "photos" && (
        <div className="bg-brand-gray/50 rounded-2xl border border-white/5 p-12 text-center">
          <p className="text-brand-muted text-lg">
            Use the <span className="text-white font-bold">Media Feed</span> tab
            in the sidebar to manage photos.
          </p>
        </div>
      )}

      {/* --- CONTENT TAB PLACEHOLDER --- */}
      {activeTab === "content" && (
        <div className="bg-brand-gray/50 rounded-2xl border border-white/5 p-12 text-center">
          <p className="text-brand-muted text-lg">
            Content management coming soon.
          </p>
        </div>
      )}
    </div>
  );
};

export default Admin;
