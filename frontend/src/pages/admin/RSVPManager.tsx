import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  created_at: any;
}

const RSVPManager = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRsvps, setLoadingRsvps] = useState(false);

  // 1. Fetch Events
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("event_date", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AppEvent[];
      setEvents(data);
      setLoadingEvents(false);

      // Auto-select first event if none selected
      if (!selectedEvent && data.length > 0) {
        setSelectedEvent(data[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch RSVPs when an event is selected
  useEffect(() => {
    if (!selectedEvent) return;

    setLoadingRsvps(true);
    const rsvpRef = collection(db, "events", selectedEvent.id, "rsvps");
    const q = query(rsvpRef, orderBy("created_at", "desc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as RSVPData[];
      setRsvps(data);
      setLoadingRsvps(false);
    });
    return () => unsubscribe();
  }, [selectedEvent]);

  // 3. Delete RSVP
  const handleDeleteRSVP = async (rsvpId: string) => {
    if (!selectedEvent) return;
    if (confirm("Remove this registration?")) {
      await deleteDoc(doc(db, "events", selectedEvent.id, "rsvps", rsvpId));
    }
  };

  // Calculate Total Headcount
  const totalHeadcount = rsvps.reduce(
    (sum, r) => sum + (Number(r.attendees) || 1),
    0
  );

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
          {events.map((event) => {
            const dateStr = event.event_date?.toDate
              ? event.event_date.toDate().toLocaleDateString()
              : "TBD";

            return (
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
                <div
                  className={`text-xs mt-1 ${
                    selectedEvent?.id === event.id
                      ? "text-black/60"
                      : "text-brand-muted/60"
                  }`}
                >
                  {dateStr}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: RSVP Table */}
      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
        {selectedEvent ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20">
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  {selectedEvent.title}
                </h1>
                <p className="text-brand-muted text-sm">
                  Manage registrations and check-ins.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="bg-brand-dark px-4 py-2 rounded-xl border border-white/10 text-center">
                  <div className="text-xs text-brand-muted uppercase font-bold">
                    Registrations
                  </div>
                  <div className="text-xl font-bold text-white">
                    {rsvps.length}
                  </div>
                </div>
                <div className="bg-brand-dark px-4 py-2 rounded-xl border border-white/10 text-center">
                  <div className="text-xs text-brand-muted uppercase font-bold">
                    Total Heads
                  </div>
                  <div className="text-xl font-bold text-brand-accent">
                    {totalHeadcount}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {loadingRsvps ? (
                <div className="p-8 text-center text-brand-muted">
                  Loading attendees...
                </div>
              ) : rsvps.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-white/5 m-8 rounded-2xl">
                  <p className="text-brand-muted">
                    No RSVPs yet for this event.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-brand-gray z-10 shadow-sm">
                    <tr className="text-brand-muted text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-white/10">
                        Name
                      </th>
                      <th className="p-4 font-bold border-b border-white/10">
                        Contact
                      </th>
                      <th className="p-4 font-bold border-b border-white/10 text-center">
                        Heads
                      </th>
                      <th className="p-4 font-bold border-b border-white/10">
                        Notes
                      </th>
                      <th className="p-4 font-bold border-b border-white/10 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rsvps.map((rsvp) => (
                      <tr
                        key={rsvp.id}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="font-bold text-white">
                            {rsvp.name}
                          </div>
                          <div className="text-xs text-brand-muted">
                            {rsvp.created_at?.toDate().toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="text-white">{rsvp.email}</div>
                          <div className="text-brand-muted">{rsvp.phone}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent font-bold border border-brand-accent/20">
                            {rsvp.attendees}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-brand-muted max-w-xs truncate">
                          {rsvp.notes || "-"}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteRSVP(rsvp.id)}
                            className="text-brand-muted hover:text-red-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
                            title="Remove RSVP"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-brand-muted">
            Select an event to view registrations.
          </div>
        )}
      </div>
    </div>
  );
};

export default RSVPManager;
