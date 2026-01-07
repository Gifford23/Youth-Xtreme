import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Scanner } from "@yudiel/react-qr-scanner";

interface AppEvent {
  id: string;
  title: string;
  event_date: any;
  location: string;
}

interface RSVPData {
  id: string;
  name: string;
  email: string;
  phone: string;
  attendees: number;
  notes: string;
  status?: "pending" | "checked-in";
  created_at: any;
}

const RSVPManager = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRsvps, setLoadingRsvps] = useState(false);

  // ✅ NEW: Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Scanner & Modal States
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  // Walk-in State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // 1. Fetch Events
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("event_date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AppEvent[];
      setEvents(data);
      setLoadingEvents(false);
      if (!selectedEvent && data.length > 0) setSelectedEvent(data[0]);
    });
    return unsub;
  }, []);

  // 2. Fetch RSVPs
  useEffect(() => {
    if (!selectedEvent) return;
    setLoadingRsvps(true);
    const q = query(
      collection(db, "events", selectedEvent.id, "rsvps"),
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRsvps(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as RSVPData[]);
      setLoadingRsvps(false);
    });
    return unsub;
  }, [selectedEvent]);

  // 3. Toggle Status
  const handleCheckIn = async (rsvp: RSVPData) => {
    if (!selectedEvent) return;
    const newStatus = rsvp.status === "checked-in" ? "pending" : "checked-in";
    await updateDoc(doc(db, "events", selectedEvent.id, "rsvps", rsvp.id), {
      status: newStatus,
    });
  };

  // 4. Walk-In Logic
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !walkInForm.name.trim()) return;
    try {
      await addDoc(collection(db, "events", selectedEvent.id, "rsvps"), {
        name: walkInForm.name.trim(),
        email: walkInForm.email.trim() || "walkin@noemail.com",
        phone: walkInForm.phone.trim(),
        attendees: 1,
        notes: "Walk-in",
        status: "checked-in",
        created_at: serverTimestamp(),
      });
      setWalkInForm({ name: "", email: "", phone: "" });
      setShowWalkInModal(false);
    } catch (error) {
      alert("Failed to add walk-in.");
    }
  };

  // 5. QR SCAN HANDLER
  const handleScan = (result: any[]) => {
    if (result && result.length > 0) {
      const scannedEmail = result[0].rawValue;

      const matchedRSVP = rsvps.find(
        (r) => r.email.toLowerCase() === scannedEmail.toLowerCase()
      );

      if (matchedRSVP) {
        if (matchedRSVP.status !== "checked-in") {
          handleCheckIn(matchedRSVP);
          setScanStatus(`✅ Checked in: ${matchedRSVP.name}`);
        } else {
          setScanStatus(`⚠️ Already here: ${matchedRSVP.name}`);
        }
      } else {
        setScanStatus(`❌ Not found: ${scannedEmail}`);
      }
    }
  };

  const handleDeleteRSVP = async (rsvpId: string) => {
    if (!selectedEvent) return;
    if (confirm("Remove this registration?")) {
      await deleteDoc(doc(db, "events", selectedEvent.id, "rsvps", rsvpId));
    }
  };

  // ✅ NEW: Search Logic
  const filteredRsvps = rsvps.filter((rsvp) => {
    const search = searchTerm.toLowerCase();
    return (
      rsvp.name.toLowerCase().includes(search) ||
      rsvp.email.toLowerCase().includes(search)
    );
  });

  const totalRSVP = rsvps.length;
  const actualAttendance = rsvps.filter(
    (r) => r.status === "checked-in"
  ).length;

  if (loadingEvents)
    return <div className="p-8 text-brand-muted">Loading events...</div>;

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[300px,1fr] gap-8 h-[calc(100vh-140px)]">
      {/* LEFT: Event List */}
      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 bg-black/20">
          <h2 className="font-bold text-white uppercase tracking-wider text-sm">
            Select Event
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`w-full text-left p-3 rounded-xl transition-all border ${
                selectedEvent?.id === event.id
                  ? "bg-brand-accent text-brand-dark border-brand-accent font-bold"
                  : "text-brand-muted hover:bg-white/5 border-transparent hover:text-white"
              }`}
            >
              <div className="truncate">{event.title}</div>
              <div className="text-xs opacity-60 mt-1">
                {event.event_date?.toDate
                  ? event.event_date.toDate().toLocaleDateString()
                  : "TBD"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Manager */}
      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
        {selectedEvent ? (
          <>
            {/* Header Stats & Tools */}
            <div className="p-6 border-b border-white/10 flex flex-col gap-4 bg-black/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">
                    {selectedEvent.title}
                  </h1>
                  <p className="text-brand-muted text-sm">Live Attendance</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-brand-muted uppercase font-bold">
                    Present / Total
                  </div>
                  <div className="text-xl font-bold text-white">
                    <span className="text-brand-accent">
                      {actualAttendance}
                    </span>
                    <span className="text-brand-muted"> / {totalRSVP}</span>
                  </div>
                </div>
              </div>

              {/* Toolbar: Search + Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* ✅ NEW: Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search attendee..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-brand-accent focus:outline-none transition-colors"
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

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowWalkInModal(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-colors border border-white/10 font-bold text-sm whitespace-nowrap"
                  >
                    <span>+</span> Walk-in
                  </button>

                  <button
                    onClick={() => {
                      setShowScanner(true);
                      setScanStatus("");
                    }}
                    className="flex items-center gap-2 bg-brand-accent text-brand-dark px-4 py-3 rounded-xl transition-colors font-bold text-sm hover:bg-white shadow-lg whitespace-nowrap"
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
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    Scan
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
              {loadingRsvps ? (
                <div className="p-12 text-center text-brand-muted">
                  Loading...
                </div>
              ) : filteredRsvps.length === 0 ? (
                <div className="p-12 text-center text-brand-muted">
                  {searchTerm ? "No results found." : "No attendees yet."}
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-brand-gray z-10 shadow-sm">
                    <tr className="text-brand-muted text-xs uppercase tracking-wider">
                      <th className="p-4 border-b border-white/10 text-center w-32">
                        Status
                      </th>
                      <th className="p-4 border-b border-white/10">Name</th>
                      <th className="p-4 border-b border-white/10 hidden sm:table-cell">
                        Details
                      </th>
                      <th className="p-4 border-b border-white/10 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRsvps.map((rsvp) => {
                      const isCheckedIn = rsvp.status === "checked-in";
                      return (
                        <tr
                          key={rsvp.id}
                          className={`transition-colors ${
                            isCheckedIn
                              ? "bg-green-500/10 hover:bg-green-500/20"
                              : "hover:bg-white/5"
                          }`}
                        >
                          {/* ✅ NEW: Status Badge */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleCheckIn(rsvp)}
                              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all uppercase ${
                                isCheckedIn
                                  ? "bg-green-500 text-brand-dark border-green-500 shadow-md"
                                  : "bg-transparent text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10"
                              }`}
                            >
                              {isCheckedIn ? "Attended" : "Waiting"}
                            </button>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-white">
                              {rsvp.name}
                            </div>
                            {rsvp.email === "walkin@noemail.com" && (
                              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-brand-muted mt-1 inline-block">
                                WALK-IN
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm hidden sm:table-cell text-brand-muted">
                            {rsvp.email}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteRSVP(rsvp.id)}
                              className="text-brand-muted hover:text-red-400 p-2 transition-colors"
                              title="Delete Registration"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-brand-muted">
            Select an event to start.
          </div>
        )}
      </div>

      {/* WALK-IN MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-gray border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Register New Visitor
            </h3>
            <form onSubmit={handleWalkInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-brand-muted font-bold mb-1">
                  Name *
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                  value={walkInForm.name}
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-brand-muted font-bold mb-1">
                  Email (For QR Code)
                </label>
                <input
                  type="email"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                  placeholder="Optional but recommended"
                  value={walkInForm.email}
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-brand-muted font-bold mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent focus:outline-none"
                  placeholder="Optional"
                  value={walkInForm.phone}
                  onChange={(e) =>
                    setWalkInForm({ ...walkInForm, phone: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-accent text-brand-dark font-bold hover:bg-white transition-colors"
                >
                  Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4">
          <button
            onClick={() => setShowScanner(false)}
            className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-white mb-6 animate-pulse">
            Scanning...
          </h2>

          <div className="w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden border-2 border-brand-accent shadow-[0_0_50px_rgba(204,255,0,0.3)] relative">
            <Scanner
              onScan={handleScan}
              styles={{ container: { width: "100%", height: "100%" } }}
            />
            <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none"></div>
          </div>

          {scanStatus && (
            <div
              className={`mt-8 px-6 py-4 rounded-xl text-lg font-bold animate-bounce ${
                scanStatus.includes("✅")
                  ? "bg-green-500 text-brand-dark"
                  : "bg-red-500 text-white"
              }`}
            >
              {scanStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RSVPManager;
