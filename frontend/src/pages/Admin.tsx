import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import { Link } from "react-router-dom";
import { logActivity } from "../utils/logger";
import EditProfileModal from "../components/profile/EditProfileModal";

// --- TYPES ---
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

interface Moment {
  id: string;
  url: string;
  caption: string;
}

// ✅ New Type for Bulletin
interface Notice {
  id: string;
  type: string;
  title: string;
  content: string;
  isPinned: boolean;
  author: string;
  created_at: any;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState("new event");

  // --- STATE FOR LISTS ---
  const [eventsList, setEventsList] = useState<AppEvent[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [momentsList, setMomentsList] = useState<Moment[]>([]);

  // ✅ STATE FOR BULLETIN
  const [noticesList, setNoticesList] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    type: "general",
    isPinned: false,
  });
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // --- LOADING STATES ---
  const [loadingList, setLoadingList] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingMoments, setLoadingMoments] = useState(false);

  // --- MOMENT FORM STATE ---
  const [momentForm, setMomentForm] = useState({ url: "", caption: "" });
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);

  // --- PROFILE STATE ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // --- EVENT FORM STATE ---
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "Worship",
    imageUrl: "",
    description: "",
  });

  // 1. DATA FETCHING
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        if (db) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        }
      }
    });

    if (activeTab === "all events" && db) {
      setLoadingList(true);
      const q = query(collection(db, "events"), orderBy("event_date", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        setEventsList(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppEvent))
        );
        setLoadingList(false);
      });
      return () => unsub();
    }

    if (activeTab === "activity logs" && db) {
      setLoadingLogs(true);
      const q = query(
        collection(db, "activity_logs"),
        orderBy("timestamp", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        setActivityLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingLogs(false);
      });
      return () => unsub();
    }

    if (activeTab === "photos" && db) {
      setLoadingMoments(true);
      const q = query(collection(db, "moments"), orderBy("created_at", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        setMomentsList(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Moment))
        );
        setLoadingMoments(false);
      });
      return () => unsub();
    }

    // ✅ FETCH BULLETIN NOTICES
    if (activeTab === "bulletin" && db) {
      setLoadingNotices(true);
      const q = query(
        collection(db, "bulletin_board"),
        orderBy("created_at", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        setNoticesList(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notice))
        );
        setLoadingNotices(false);
      });
      return () => unsub();
    }

    return () => unsubAuth();
  }, [activeTab]);

  // --- BULLETIN HANDLERS ---
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    try {
      // ✅ FIX: Define base data (fields shared by create and update)
      const baseNoticeData = {
        title: noticeForm.title,
        content: noticeForm.content,
        type: noticeForm.type,
        isPinned: noticeForm.isPinned,
        author: userData?.name || "Admin",
      };

      if (editingNoticeId) {
        // ✅ UPDATE: We DO NOT include 'created_at' here.
        // Including "created_at: undefined" causes the Firebase error.
        await updateDoc(doc(db, "bulletin_board", editingNoticeId), {
          ...baseNoticeData,
          updated_at: serverTimestamp(),
        });
        await logActivity(
          "Updated Bulletin",
          `Updated notice: ${noticeForm.title}`
        );
        alert("✅ Announcement Updated!");
        setEditingNoticeId(null);
      } else {
        // ✅ CREATE: We DO include 'created_at' here.
        await addDoc(collection(db, "bulletin_board"), {
          ...baseNoticeData,
          created_at: serverTimestamp(),
        });
        await logActivity(
          "Posted Bulletin",
          `Posted notice: ${noticeForm.title}`
        );
        alert("✅ Announcement Posted!");
      }
      // Reset form
      setNoticeForm({
        title: "",
        content: "",
        type: "general",
        isPinned: false,
      });
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("❌ Error saving announcement. Check console for details.");
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteDoc(doc(db!, "bulletin_board", id));
        await logActivity("Deleted Bulletin", `Deleted notice ID: ${id}`);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setNoticeForm({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      isPinned: notice.isPinned || false,
    });
    setEditingNoticeId(notice.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelNoticeEdit = () => {
    setEditingNoticeId(null);
    setNoticeForm({ title: "", content: "", type: "general", isPinned: false });
  };

  // --- OTHER HANDLERS (Unchanged) ---
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
      await logActivity("Created Event", `Created event: ${eventForm.title}`);
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
      console.error(error);
      alert("❌ Failed to create event.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this event?")) {
      try {
        await deleteDoc(doc(db!, "events", id));
        await logActivity("Deleted Event", `Deleted event ID: ${id}`);
      } catch (error) {
        alert("Error deleting event");
      }
    }
  };

  const handleMomentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      if (editingMomentId) {
        await updateDoc(doc(db, "moments", editingMomentId), {
          url: momentForm.url,
          caption: momentForm.caption,
          updated_at: serverTimestamp(),
        });
        setEditingMomentId(null);
      } else {
        await addDoc(collection(db, "moments"), {
          url: momentForm.url,
          caption: momentForm.caption,
          created_at: serverTimestamp(),
        });
      }
      setMomentForm({ url: "", caption: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMoment = async (id: string) => {
    if (confirm("Delete this moment?")) {
      try {
        await deleteDoc(doc(db!, "moments", id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditMoment = (moment: Moment) => {
    setMomentForm({ url: moment.url, caption: moment.caption });
    setEditingMomentId(moment.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingMomentId(null);
    setMomentForm({ url: "", caption: "" });
  };

  // Printing logic simplified for brevity (keep your existing implementation)
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
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const filteredEvents = eventsList.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNoticeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-red-500/50 bg-red-500/10 text-red-200";
      case "shoutout":
        return "border-yellow-500/50 bg-yellow-500/10 text-yellow-200";
      case "event":
        return "border-blue-500/50 bg-blue-500/10 text-blue-200";
      case "volunteer":
        return "border-purple-500/50 bg-purple-500/10 text-purple-200";
      default:
        return "border-white/10 bg-white/5 text-brand-muted";
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Profile Modal */}
      {showProfileModal && currentUser && (
        <EditProfileModal
          user={currentUser}
          userData={userData || {}}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Header */}
      <div className="mb-10 pt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            ADMIN <span className="text-brand-accent">CONSOLE</span>
          </h1>
          <p className="text-brand-muted">
            Manage your ministry events and data.
          </p>
        </div>
        <button
          onClick={() => setShowProfileModal(true)}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
        >
          Edit Profile
        </button>
      </div>

      {/* Quick Actions Grid (Scanner, etc.) - Keep your existing code here */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {/* ... (Keep your Scanner, Live List, Members buttons) ... */}
        <Link
          to="/scanner"
          className="bg-gradient-to-br from-brand-accent to-green-600 p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform shadow-lg h-32"
        >
          <div>
            <h2 className="text-2xl font-bold text-brand-dark">📷 Scanner</h2>
          </div>
        </Link>
        <Link
          to="/admin/rsvps"
          className="bg-brand-gray border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors h-32"
        >
          <div>
            <h2 className="text-xl font-bold text-white">📋 Live List</h2>
          </div>
        </Link>
        <Link
          to="/admin/members"
          className="bg-brand-gray border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors h-32"
        >
          <div>
            <h2 className="text-xl font-bold text-white">👥 Members</h2>
          </div>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-6 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
        {["new event", "all events", "bulletin", "photos", "activity logs"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap px-2 pb-2 ${
                activeTab === tab
                  ? "text-brand-accent"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              {tab === "photos" ? "Moments" : tab}
              {activeTab === tab && (
                <span className="absolute -bottom-4 left-0 w-full h-0.5 bg-brand-accent"></span>
              )}
            </button>
          )
        )}
      </div>

      {/* --- TAB: NEW EVENT --- */}
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
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-xl"></div>
            </div>
            <p className="text-center text-xs text-brand-muted mt-4">
              This is how users will see it.
            </p>
          </div>
        </div>
      )}

      {/* --- TAB: ALL EVENTS --- */}
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
                            {/* Print Button */}
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

      {/* --- ✅ TAB: BULLETIN MANAGER --- */}
      {activeTab === "bulletin" && (
        <div className="grid lg:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* LEFT: Bulletin Form */}
          <div className="lg:col-span-1">
            <div className="bg-brand-gray/50 rounded-3xl border border-white/5 p-6 shadow-xl sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  {editingNoticeId ? "✏️ Edit Post" : "📢 Post Announcement"}
                </h3>
                {editingNoticeId && (
                  <button
                    onClick={cancelNoticeEdit}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleNoticeSubmit} className="space-y-5">
                <div>
                  <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Service Time Change"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none text-sm"
                    value={noticeForm.title}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                      Type
                    </label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none text-sm appearance-none"
                      value={noticeForm.type}
                      onChange={(e) =>
                        setNoticeForm({ ...noticeForm, type: e.target.value })
                      }
                    >
                      <option value="general">📌 General</option>
                      <option value="urgent">🚨 Urgent</option>
                      <option value="event">📅 Event</option>
                      <option value="shoutout">🎉 Shoutout</option>
                      <option value="volunteer">🤝 Needs</option>
                      <option value="devotional">📖 Devo</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={noticeForm.isPinned}
                        onChange={(e) =>
                          setNoticeForm({
                            ...noticeForm,
                            isPinned: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-white/20 bg-black/40 text-brand-accent focus:ring-offset-0 focus:ring-0"
                      />
                      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                        Pin to Top?
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                    Message
                  </label>
                  <textarea
                    placeholder="Write your announcement here..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none text-sm h-32 resize-none"
                    value={noticeForm.content}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, content: e.target.value })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full font-bold text-brand-dark py-4 rounded-xl transition-all shadow-lg ${
                    editingNoticeId
                      ? "bg-yellow-400 hover:bg-yellow-300"
                      : "bg-brand-accent hover:bg-white"
                  }`}
                >
                  {editingNoticeId ? "Update Post" : "Post to Board"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: Bulletin List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Active Board</h3>
              <span className="text-xs font-mono text-brand-muted bg-white/5 px-2 py-1 rounded">
                {noticesList.length} Posts
              </span>
            </div>

            {loadingNotices ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
              </div>
            ) : noticesList.length === 0 ? (
              <div className="bg-brand-gray/30 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4 opacity-50">📭</div>
                <p className="text-brand-muted">
                  The board is empty. Post something!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {noticesList.map((notice) => (
                  <div
                    key={notice.id}
                    className={`group relative bg-brand-gray border rounded-2xl p-5 transition-all hover:border-white/20 ${getNoticeColor(
                      notice.type
                    )}`}
                  >
                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditNotice(notice)}
                        className="p-2 bg-black/40 hover:bg-yellow-500 hover:text-black text-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-2 bg-black/40 hover:bg-red-500 text-white rounded-lg transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      {notice.isPinned && (
                        <span title="Pinned" className="text-lg">
                          📌
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest border border-current px-2 py-0.5 rounded opacity-70">
                        {notice.type}
                      </span>
                      <span className="text-[10px] opacity-50 font-mono">
                        {notice.created_at?.toDate
                          ? notice.created_at.toDate().toLocaleDateString()
                          : "Just now"}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2 pr-16">
                      {notice.title}
                    </h4>
                    <p className="text-sm opacity-90 leading-relaxed max-w-2xl">
                      {notice.content}
                    </p>

                    <div className="mt-4 pt-4 border-t border-black/10 flex items-center gap-2 opacity-60">
                      <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-bold">
                        {notice.author?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold">
                        Posted by {notice.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB: MOMENTS (Previously Photos) --- */}
      {activeTab === "photos" && (
        <div className="grid lg:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* LEFT: Moment Form */}
          <div className="lg:col-span-1">
            <div className="bg-brand-gray/50 rounded-3xl border border-white/5 p-6 shadow-xl sticky top-8">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                {editingMomentId ? "✏️ Edit Moment" : "📸 Add New Moment"}
              </h3>

              <form onSubmit={handleMomentSubmit} className="space-y-4">
                <div>
                  <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none text-sm"
                    value={momentForm.url}
                    onChange={(e) =>
                      setMomentForm({ ...momentForm, url: e.target.value })
                    }
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Tip: Use a public image link (e.g., from your storage or
                    external).
                  </p>
                </div>

                <div>
                  <label className="block text-brand-muted text-xs font-bold uppercase mb-2">
                    Caption
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Worship Night"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none text-sm"
                    value={momentForm.caption}
                    onChange={(e) =>
                      setMomentForm({ ...momentForm, caption: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className={`flex-1 font-bold text-brand-dark py-3 rounded-xl transition-all ${
                      editingMomentId
                        ? "bg-yellow-400 hover:bg-yellow-300"
                        : "bg-brand-accent hover:bg-white"
                    }`}
                  >
                    {editingMomentId ? "Update" : "Add Moment"}
                  </button>

                  {editingMomentId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Moments List */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">
              Gallery Preview
            </h3>

            {loadingMoments ? (
              <div className="text-center py-10 text-brand-muted">
                Loading moments...
              </div>
            ) : momentsList.length === 0 ? (
              <div className="bg-brand-gray/30 rounded-2xl border border-white/5 p-10 text-center text-brand-muted">
                No moments added yet. Add one on the left!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {momentsList.map((moment) => (
                  <div
                    key={moment.id}
                    className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-black border border-white/10"
                  >
                    <img
                      src={moment.url}
                      alt={moment.caption}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditMoment(moment)}
                          className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteMoment(moment.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-white text-xs font-bold text-center">
                        {moment.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB: ACTIVITY LOGS --- */}
      {activeTab === "activity logs" && (
        <div className="bg-brand-gray/50 rounded-2xl border border-white/5 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Activity Logs</h2>
          {loadingLogs ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
              <p className="mt-4 text-brand-muted">Loading activity logs...</p>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center py-12 text-brand-muted">
              <p>No activity logs found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-brand-dark/50 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">
                        {log.action}
                      </h3>
                      <p className="text-brand-muted text-sm mt-1">
                        {log.details}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-brand-accent text-xs">
                        {log.timestamp?.toDate?.()
                          ? log.timestamp.toDate().toLocaleString()
                          : "Unknown time"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
