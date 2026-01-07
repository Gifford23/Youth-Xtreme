import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";

// --- CONFIGURATION ---
const ACCESS_PIN = "2026";

// Types
interface AppEvent {
  id: string;
  title: string;
  event_date: any;
}

interface RSVPData {
  id: string;
  name: string;
  email: string;
  status?: "pending" | "checked-in";
}

const ScannerPage = () => {
  const navigate = useNavigate();

  // Security State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Scanner Data State
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [scanStatus, setScanStatus] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [lastScanned, setLastScanned] = useState<string>("");

  // Manual Check-in State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState("");

  // 1. Fetch Events (Filtered: Today & Future)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "events"),
      where("event_date", ">=", today),
      orderBy("event_date", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setEvents(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AppEvent[]
      );
    });
    return unsub;
  }, []);

  // 2. Fetch RSVPs for Selected Event
  useEffect(() => {
    if (!selectedEvent) return;

    console.log(`📡 Fetching RSVPs for event: ${selectedEvent.title}`);

    const q = query(collection(db, "events", selectedEvent.id, "rsvps"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as RSVPData[];
      console.log("✅ Loaded RSVP List:", data);
      setRsvps(data);
    });
    return unsub;
  }, [selectedEvent]);

  // 3. Handle PIN Entry (Grants Badge)
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ACCESS_PIN) {
      setIsUnlocked(true);
      setErrorMsg("");

      // Grant "Volunteer Status"
      if (auth.currentUser) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            isVolunteer: true,
            role: "volunteer",
          });
          console.log("🏅 Volunteer Badge Granted!");
        } catch (error) {
          console.error("Could not save volunteer status", error);
        }
      }
    } else {
      setErrorMsg("Access Denied");
      setPinInput("");
    }
  };

  // 4. ✅ NEW: Handle End Shift (Removes Badge)
  const handleEndShift = async () => {
    if (!auth.currentUser) return;

    const confirmEnd = window.confirm(
      "Are you sure you want to end your shift? Your volunteer badge will be removed."
    );
    if (!confirmEnd) return;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      // Remove the badge and reset role
      await updateDoc(userRef, {
        isVolunteer: false,
        role: "member",
      });

      // Go back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error ending shift:", error);
    }
  };

  // 5. Handle QR Check-In
  const processCheckIn = async (rsvp: RSVPData) => {
    if (!selectedEvent) return;
    try {
      console.log(`🔄 Attempting to check in: ${rsvp.name}`);
      await updateDoc(doc(db, "events", selectedEvent.id, "rsvps", rsvp.id), {
        status: "checked-in",
      });
      setScanStatus({ msg: `Welcome, ${rsvp.name}!`, type: "success" });
      console.log("🎉 Check-in success!");

      setTimeout(() => setScanStatus(null), 3000);
    } catch (err) {
      console.error("❌ Permission Error:", err);
      setScanStatus({ msg: "Permission Error. Check Console.", type: "error" });
    }
  };

  // 6. Scan Handler
  const handleScan = (result: any[]) => {
    if (result && result.length > 0) {
      const rawValue = result[0].rawValue;
      const scannedEmail = rawValue ? rawValue.trim() : "";

      if (!scannedEmail) return;

      if (scannedEmail === lastScanned) return;
      setLastScanned(scannedEmail);
      setTimeout(() => setLastScanned(""), 3000);

      console.log("📷 Scanned QR Code:", scannedEmail);

      const matchedRSVP = rsvps.find(
        (r) => r.email.toLowerCase() === scannedEmail.toLowerCase()
      );

      if (matchedRSVP) {
        if (matchedRSVP.status === "checked-in") {
          setScanStatus({
            msg: `${matchedRSVP.name} is already checked in.`,
            type: "info",
          });
          setTimeout(() => setScanStatus(null), 3000);
        } else {
          processCheckIn(matchedRSVP);
        }
      } else {
        setScanStatus({ msg: "Invalid Ticket or Not RSVP'd", type: "error" });
        setTimeout(() => setScanStatus(null), 3000);
      }
    }
  };

  // 7. Handle Manual Walk-In
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !manualName.trim()) return;

    try {
      await addDoc(collection(db, "events", selectedEvent.id, "rsvps"), {
        name: manualName,
        email: "walkin@guest.com",
        status: "checked-in",
        role: "guest",
        created_at: serverTimestamp(),
      });

      setScanStatus({ msg: `Checked In: ${manualName}`, type: "success" });
      setManualName("");
      setShowManualModal(false);
      setTimeout(() => setScanStatus(null), 3000);
    } catch (error) {
      console.error("Error adding guest:", error);
      alert("Failed to add guest. Check permissions.");
    }
  };

  // --- VIEW 1: LOCK SCREEN ---
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradient Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-xs w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-brand-accent to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-accent/20">
            <svg
              className="w-10 h-10 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Volunteer Access
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Enter the security PIN to verify your identity.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div className="relative group">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-4 py-4 text-center text-white text-3xl tracking-[0.5em] font-mono focus:border-brand-accent focus:outline-none focus:shadow-[0_0_20px_rgba(204,255,0,0.15)] transition-all placeholder:text-gray-600"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold py-2 rounded-lg animate-pulse">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-brand-accent transition-all transform active:scale-95 shadow-lg"
            >
              Verify & Unlock
            </button>
          </form>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 text-xs text-gray-500 hover:text-white transition-colors"
          >
            ← Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: EVENT SELECTION (Filtered) ---
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-neutral-900 px-4 pt-28 pb-10">
        <div className="max-w-lg mx-auto">
          {/* ✅ UPDATED HEADER with End Shift */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                Select Event
              </h1>
              <p className="text-gray-400">
                Which event are you managing today?
              </p>
            </div>
            <button
              onClick={handleEndShift}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              End Shift
            </button>
          </div>

          <div className="space-y-4">
            {events.map((event, index) => {
              const dateObj = event.event_date?.toDate
                ? event.event_date.toDate()
                : null;

              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-accent/50 hover:bg-white/10 transition-all group relative overflow-hidden active:scale-[0.98]"
                >
                  <div className="flex items-center gap-5 relative z-10">
                    {/* Date Box */}
                    <div className="bg-black/40 w-16 h-16 rounded-2xl flex flex-col items-center justify-center border border-white/10 shrink-0 group-hover:border-brand-accent/50 transition-colors">
                      <span className="text-xs text-gray-400 uppercase font-bold">
                        {dateObj
                          ? dateObj.toLocaleString("default", {
                              month: "short",
                            })
                          : "TBD"}
                      </span>
                      <span className="text-xl font-bold text-white font-display">
                        {dateObj ? dateObj.getDate() : "--"}
                      </span>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate group-hover:text-brand-accent transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Ready to Scan
                        </p>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="text-gray-600 group-hover:text-white transition-colors pr-2">
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}

            {events.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No upcoming events found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: SCANNER ---
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Top Bar (Floating) */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-16 pb-12 px-6 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <div>
            <h2 className="text-white font-bold text-xl leading-tight drop-shadow-md">
              {selectedEvent.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <p className="text-gray-300 text-xs font-bold uppercase tracking-wider drop-shadow-md">
                Live Camera
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEvent(null)}
            className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-white hover:bg-white/20 transition-all"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Scanner Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-neutral-900">
        <Scanner
          onScan={handleScan}
          styles={{
            container: { width: "100%", height: "100%", objectFit: "cover" },
          }}
        />

        {/* Cinematic Scan Frame */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-72 h-72 relative">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-brand-accent rounded-tl-3xl shadow-[0_0_15px_rgba(204,255,0,0.5)]"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-brand-accent rounded-tr-3xl shadow-[0_0_15px_rgba(204,255,0,0.5)]"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-brand-accent rounded-bl-3xl shadow-[0_0_15px_rgba(204,255,0,0.5)]"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-brand-accent rounded-br-3xl shadow-[0_0_15px_rgba(204,255,0,0.5)]"></div>

            {/* Scanning Line Animation */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-accent/50 shadow-[0_0_20px_rgba(204,255,0,0.8)] animate-scan-line"></div>
          </div>
        </div>

        {/* Status Toast Notification */}
        {scanStatus && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full px-6">
            <div
              className={`p-6 rounded-3xl text-center backdrop-blur-xl border border-white/20 shadow-2xl transform transition-all animate-bounce-in ${
                scanStatus.type === "success"
                  ? "bg-green-500/80 text-white"
                  : scanStatus.type === "error"
                  ? "bg-red-500/80 text-white"
                  : "bg-blue-500/80 text-white"
              }`}
            >
              <div className="text-5xl mb-3">
                {scanStatus.type === "success"
                  ? "✅"
                  : scanStatus.type === "error"
                  ? "❌"
                  : "ℹ️"}
              </div>
              <h3 className="text-2xl font-bold leading-tight">
                {scanStatus.msg}
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-8 pb-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex justify-center pointer-events-none">
        <button
          onClick={() => setShowManualModal(true)}
          className="pointer-events-auto bg-brand-accent hover:bg-white text-brand-dark font-bold px-8 py-4 rounded-full shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all transform active:scale-95 flex items-center gap-3"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="uppercase tracking-wider text-sm">
            Manual Check-In
          </span>
        </button>
      </div>

      {/* Manual Check-In Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Guest Entry</h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-gray-500 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-brand-muted font-bold mb-2 ml-1">
                  Full Name
                </label>
                <input
                  autoFocus
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-brand-accent focus:outline-none transition-colors"
                  placeholder="e.g. John Doe"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-brand-accent transition-colors mt-2"
              >
                Confirm Check-In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
