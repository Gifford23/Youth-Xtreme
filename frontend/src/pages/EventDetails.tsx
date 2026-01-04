import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

interface AppEvent {
  id: string;
  title: string;
  event_date: any;
  location: string;
  category: string;
  image_url: string;
}

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [rsvpData, setRsvpData] = useState({
    name: "",
    email: "",
    phone: "",
    attendees: 1,
    notes: "",
  });
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!db || !id) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "events", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }

        setEvent({ id: snap.id, ...(snap.data() as DocumentData) } as AppEvent);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (!isFirebaseConfigured) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
        <h1 className="text-3xl font-display font-bold text-white mb-6 uppercase tracking-tight">
          Event Details
        </h1>
        <div className="bg-brand-gray p-6 rounded-2xl border border-white/5">
          <p className="text-brand-muted">
            Firebase is not configured. Add your <code>VITE_FIREBASE_*</code>{" "}
            values to
            <code>.env.local</code> and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
        <p className="mt-4 text-brand-muted">Loading event details...</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
        <h1 className="text-3xl font-display font-bold text-white mb-6 uppercase tracking-tight">
          Event Not Found
        </h1>
        <p className="text-brand-muted mb-8">
          This event may have been removed or the link is incorrect.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors border border-white/10"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const dateText = event.event_date?.toDate
    ? event.event_date.toDate().toLocaleString()
    : "Date TBD";

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-white transition-colors"
          >
            <span aria-hidden="true">←</span> Back to Events
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-brand-gray shadow-2xl shadow-black/30">
          <div className="relative h-72 md:h-96">
            <img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-bold text-brand-dark uppercase tracking-wider">
                {event.category}
              </div>
              <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">
                {event.title}
              </h1>
              <p className="mt-3 text-brand-muted text-sm md:text-base">
                {dateText} • {event.location}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide">
                  About this event
                </h2>
                <p className="mt-3 text-brand-muted leading-relaxed">
                  More details coming soon. This page is ready for you to add a
                  full description, speaker info, dress code, and other
                  important notes.
                </p>

                <div className="mt-10 rounded-2xl border border-white/10 bg-brand-dark p-6">
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                      <h3 className="text-lg font-display font-bold text-white uppercase tracking-wide">
                        RSVP / Registration
                      </h3>
                      <p className="mt-2 text-sm text-brand-muted">
                        Reserve your spot for this event. We’ll use this for
                        planning.
                      </p>
                    </div>

                    <div className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-brand-muted border border-white/10">
                      Submissions saved
                    </div>
                  </div>

                  {rsvpMessage && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                      {rsvpMessage}
                    </div>
                  )}

                  <form
                    className="mt-6 grid gap-4 sm:grid-cols-2"
                    onSubmit={async (e) => {
                      e.preventDefault();

                      if (!db || !id) return;

                      if (!rsvpData.name.trim()) {
                        setRsvpMessage("Please enter your name.");
                        return;
                      }

                      if (!rsvpData.email.trim()) {
                        setRsvpMessage("Please enter your email.");
                        return;
                      }

                      setRsvpLoading(true);
                      setRsvpMessage("");
                      try {
                        await addDoc(collection(db, "events", id, "rsvps"), {
                          name: rsvpData.name.trim(),
                          email: rsvpData.email.trim(),
                          phone: rsvpData.phone.trim(),
                          attendees: Number(rsvpData.attendees) || 1,
                          notes: rsvpData.notes.trim(),
                          created_at: serverTimestamp(),
                        });

                        setRsvpMessage(
                          "Thanks! Your RSVP has been submitted. See you there."
                        );
                        setRsvpData({
                          name: "",
                          email: "",
                          phone: "",
                          attendees: 1,
                          notes: "",
                        });
                      } catch (err) {
                        console.error("RSVP error:", err);
                        setRsvpMessage(
                          "Sorry, we couldn't submit your RSVP. Please try again."
                        );
                      } finally {
                        setRsvpLoading(false);
                      }
                    }}
                  >
                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
                        Full Name
                      </label>
                      <input
                        value={rsvpData.name}
                        onChange={(e) =>
                          setRsvpData((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full bg-brand-gray border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={rsvpData.email}
                        onChange={(e) =>
                          setRsvpData((p) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full bg-brand-gray border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
                        placeholder="name@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
                        Phone (optional)
                      </label>
                      <input
                        value={rsvpData.phone}
                        onChange={(e) =>
                          setRsvpData((p) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full bg-brand-gray border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
                        placeholder="+63 ..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
                        Attendees
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={rsvpData.attendees}
                        onChange={(e) =>
                          setRsvpData((p) => ({
                            ...p,
                            attendees: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-brand-gray border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
                        Notes (optional)
                      </label>
                      <textarea
                        value={rsvpData.notes}
                        onChange={(e) =>
                          setRsvpData((p) => ({ ...p, notes: e.target.value }))
                        }
                        className="w-full bg-brand-gray border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors min-h-[110px]"
                        placeholder="Anything we should know?"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={rsvpLoading}
                        className="inline-flex items-center justify-center rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold text-brand-dark hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {rsvpLoading ? "Submitting..." : "Submit RSVP"}
                      </button>
                      <p className="text-xs text-brand-muted">
                        Your info is only used for event coordination.
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-brand-dark p-5">
                <div className="text-xs uppercase tracking-wider text-brand-muted">
                  Quick Info
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-xs text-brand-muted">Date</div>
                    <div className="text-sm font-semibold text-white">
                      {dateText}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-brand-muted">Location</div>
                    <div className="text-sm font-semibold text-white">
                      {event.location}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-brand-muted">Category</div>
                    <div className="text-sm font-semibold text-white">
                      {event.category}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to="/events"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-brand-accent px-4 py-3 text-sm font-bold text-brand-dark hover:bg-white transition-colors"
                  >
                    View all events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
