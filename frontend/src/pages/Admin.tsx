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
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";

// Types
interface AppEvent {
  id: string;
  title: string;
  event_date: any;
  time: string;
  location: string;
  category: string;
  imageUrl: string;
  description: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState("new event"); // Default tab

  // --- STATE FOR LIST OF EVENTS ---
  const [eventsList, setEventsList] = useState<AppEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  // --- STATE FOR CREATE EVENT FORM ---
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "Worship",
    imageUrl: "",
    description: "",
  });

  // 1. Fetch Events for the List
  useEffect(() => {
    if (activeTab === "all events") {
      setLoadingList(true);
      const q = query(collection(db, "events"), orderBy("event_date", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AppEvent[];
        setEventsList(data);
        setLoadingList(false);
      });
      return unsub;
    }
  }, [activeTab]);

  // 2. Handle Create Event
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      const eventDateTime = new Date(`${eventForm.date}T${eventForm.time}`);

      await addDoc(collection(db, "events"), {
        title: eventForm.title,
        event_date: eventDateTime,
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
      setActiveTab("all events");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("❌ Failed to create event.");
    }
  };

  // 3. Handle Delete Event
  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this event? This will also delete all RSVPs associated with it."
      )
    ) {
      try {
        await deleteDoc(doc(db, "events", id));
      } catch (error) {
        alert("Error deleting event");
      }
    }
  };

  // 4. ✅ NEW: Handle Print Attendance Sheet
  const handlePrintSheet = (event: AppEvent) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("Please allow popups to print");

    // Format Date & Time for Header
    const eventDate = event.event_date?.toDate
      ? event.event_date.toDate().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Date TBD";
    const eventTime = event.event_date?.toDate
      ? event.event_date
          .toDate()
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

    // Generate 25 Empty Rows
    const rows = Array(25)
      .fill(0)
      .map(
        (_, i) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #000; text-align: center;">${
          i + 1
        }</td>
        <td style="padding: 10px; border: 1px solid #000;"></td>
        <td style="padding: 10px; border: 1px solid #000;"></td>
        <td style="padding: 10px; border: 1px solid #000;"></td>
      </tr>
    `
      )
      .join("");

    // Construct the Printable HTML
    const html = `
      <html>
        <head>
          <title>Attendance Sheet - ${event.title}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #000; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            h1 { margin: 0 0 10px 0; font-size: 24px; text-transform: uppercase; }
            .meta { font-size: 14px; color: #444; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f0f0f0; padding: 12px; border: 1px solid #000; text-align: left; font-weight: bold; text-transform: uppercase; }
            @media print {
              body { padding: 0; }
              th { background-color: #eee !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${event.title}</h1>
            <div class="meta">
              <strong>DATE:</strong> ${eventDate} &nbsp;|&nbsp; 
              <strong>TIME:</strong> ${eventTime} &nbsp;|&nbsp; 
              <strong>LOCATION:</strong> ${event.location}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Contact Number</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; font-size: 12px; text-align: center; color: #666;">
            Manual Attendance Sheet &bull; Generated by Xtreme Admin Console
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Small timeout ensures styles are loaded before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // 5. Filter Logic
  const filteredEvents = eventsList.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10 pt-6">
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          ADMIN <span className="text-brand-accent">CONSOLE</span>
        </h1>
        <p className="text-brand-muted">
          Manage your ministry events and data.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <Link
          to="/scanner"
          className="bg-gradient-to-br from-brand-accent to-green-600 p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg group h-32 relative overflow-hidden"
        >
          <div className="absolute right-[-20px] top-[-20px] bg-white/20 w-24 h-24 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-brand-dark mb-1">
              📷 Scanner
            </h2>
            <p className="text-brand-dark/80 text-sm font-bold">
              Launch Check-in
            </p>
          </div>
          <div className="self-end bg-black/20 p-2 rounded-full text-brand-dark">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
        </Link>

        <Link
          to="/admin/rsvps"
          className="bg-brand-gray border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors group h-32"
        >
          <div>
            <h2 className="text-xl font-bold text-white mb-1">📋 Live List</h2>
            <p className="text-brand-muted text-sm">Monitor Attendance</p>
          </div>
          <div className="self-end bg-white/5 p-2 rounded-full text-white group-hover:bg-white/10">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </Link>

        <Link
          to="/admin/members"
          className="bg-brand-gray border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors group h-32"
        >
          <div>
            <h2 className="text-xl font-bold text-white mb-1">👥 Members</h2>
            <p className="text-brand-muted text-sm">Manage Users</p>
          </div>
          <div className="self-end bg-white/5 p-2 rounded-full text-white group-hover:bg-white/10">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex gap-6 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
        {["new event", "all events", "photos", "content"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
              activeTab === tab
                ? "text-brand-accent"
                : "text-brand-muted hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute -bottom-4 left-0 w-full h-0.5 bg-brand-accent shadow-[0_0_10px_rgba(204,255,0,0.5)]"></span>
            )}
          </button>
        ))}
      </div>

      {/* --- TAB 1: NEW EVENT FORM --- */}
      {activeTab === "new event" && (
        <div className="grid lg:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* LEFT: The Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleEventSubmit} className="space-y-6">
              <div className="bg-brand-gray/50 rounded-3xl border border-white/5 p-8 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">
                    1
                  </span>
                  Event Details
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-brand-muted text-xs font-bold uppercase mb-2 ml-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Neon Night Worship"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none focus:bg-black/60 transition-colors"
                      value={eventForm.title}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-brand-muted text-xs font-bold uppercase mb-2 ml-1">
                        Category
                      </label>
                      <select
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                        value={eventForm.category}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="Worship">Worship</option>
                        <option value="Fellowship">Fellowship</option>
                        <option value="Outreach">Outreach</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-brand-muted text-xs font-bold uppercase mb-2 ml-1">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Main Hall"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                        value={eventForm.location}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            location: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-gray/50 rounded-3xl border border-white/5 p-8 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">
                    2
                  </span>
                  Schedule
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-brand-muted text-xs font-bold uppercase mb-2 ml-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none [color-scheme:dark]"
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-brand-muted text-xs font-bold uppercase mb-2 ml-1">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none [color-scheme:dark]"
                      value={eventForm.time}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-brand-gray/50 rounded-3xl border border-white/5 p-8 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm">
                    3
                  </span>
                  Media & Content
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-brand-muted text-xs font-bold uppercase mb-2 ml-1">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                      value={eventForm.imageUrl}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, imageUrl: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-brand-muted text-xs font-bold uppercase mb-2 ml-1">
                      Description
                    </label>
                    <textarea
                      placeholder="What is this event about?"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none h-32 resize-none"
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-brand-accent text-brand-dark font-bold text-lg py-4 rounded-xl hover:bg-white transition-all transform hover:scale-[1.01] shadow-xl shadow-brand-accent/20"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <h3 className="text-brand-muted uppercase text-xs font-bold tracking-widest">
                  Live Preview
                </h3>
              </div>
              <div className="bg-black border-[8px] border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[600px]">
                <div className="bg-brand-dark h-full overflow-y-auto custom-scrollbar">
                  <div className="bg-brand-dark/90 backdrop-blur p-4 border-b border-white/5 sticky top-0 z-10 flex justify-between items-center">
                    <span className="text-xs font-bold text-white">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                      <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-brand-gray border border-white/10 rounded-2xl overflow-hidden shadow-lg mb-4">
                      <div className="h-40 bg-neutral-800 relative">
                        {eventForm.imageUrl ? (
                          <img
                            src={eventForm.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-brand-muted text-xs uppercase font-bold">
                            No Image
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-brand-accent text-brand-dark text-[10px] font-bold px-2 py-1 rounded">
                          {eventForm.category || "CATEGORY"}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white text-lg leading-tight mb-2">
                          {eventForm.title || "Event Title"}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>
                              {eventForm.date || "YYYY-MM-DD"} @{" "}
                              {eventForm.time || "--:--"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{eventForm.location || "Location"}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-3">
                          {eventForm.description ||
                            "Event description will appear here..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-xl"></div>
              </div>
              <p className="text-center text-xs text-brand-muted mt-4">
                This is how users will see it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ALL EVENTS LIST --- */}
      {activeTab === "all events" && (
        <div className="bg-brand-gray/50 rounded-3xl border border-white/5 p-8 shadow-xl animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Event List</h2>
              <p className="text-brand-muted text-sm">
                View and manage all past and upcoming events.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-brand-accent focus:outline-none transition-colors"
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-brand-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Event</th>
                  <th className="p-4 font-bold">Date & Time</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingList ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-brand-muted"
                    >
                      Loading events...
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-brand-muted"
                    >
                      No events found.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => {
                    const eventDate = event.event_date?.toDate
                      ? event.event_date.toDate()
                      : new Date();
                    const isPast = eventDate < new Date();

                    return (
                      <tr
                        key={event.id}
                        className="group hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-white">
                            {event.title}
                          </div>
                          <div className="text-xs text-brand-muted">
                            {event.location}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {eventDate.toLocaleDateString()}
                          <br />
                          <span className="text-xs text-brand-muted">
                            {eventDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs bg-white/10 px-2 py-1 rounded border border-white/10 text-white">
                            {event.category}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {isPast ? (
                            <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-500/10 px-2 py-1 rounded">
                              Past
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                              Upcoming
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* ✅ NEW: Print Button */}
                            <button
                              onClick={() => handlePrintSheet(event)}
                              className="text-gray-500 hover:text-brand-accent transition-colors p-2 rounded-lg hover:bg-white/5"
                              title="Print Manual Attendance Sheet"
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
                                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                              title="Delete Event"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
