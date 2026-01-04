import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
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

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const isSameDay = (a: Date, b: Date) => dateKey(a) === dateKey(b);

const Calendar = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "events"), orderBy("event_date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (docSnap: QueryDocumentSnapshot<DocumentData>) => ({
          id: docSnap.id,
          ...(docSnap.data() as DocumentData),
        })
      ) as AppEvent[];

      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const monthStart = useMemo(() => startOfMonth(cursor), [cursor]);
  const monthEnd = useMemo(() => endOfMonth(cursor), [cursor]);

  const days = useMemo(() => {
    const result: Date[] = [];
    const start = new Date(monthStart);
    const end = new Date(monthEnd);

    const startOffset = start.getDay();
    start.setDate(start.getDate() - startOffset);

    const endOffset = 6 - end.getDay();
    end.setDate(end.getDate() + endOffset);

    const iter = new Date(start);
    while (iter <= end) {
      result.push(new Date(iter));
      iter.setDate(iter.getDate() + 1);
    }

    return result;
  }, [monthStart, monthEnd]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AppEvent[]>();

    for (const ev of events) {
      const evDate: Date | null = ev.event_date?.toDate
        ? ev.event_date.toDate()
        : null;
      if (!evDate) continue;
      const key = dateKey(evDate);
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }

    return map;
  }, [events]);

  const selectedEvents = useMemo(() => {
    const key = dateKey(selected);
    return eventsByDay.get(key) ?? [];
  }, [eventsByDay, selected]);

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col gap-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight">
              Events <span className="text-brand-accent">Calendar</span>
            </h1>
            <p className="mt-3 text-brand-muted max-w-2xl">
              See upcoming youth services, camps, and hangouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
              }
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Prev
            </button>
            <div className="rounded-xl border border-white/10 bg-brand-gray px-4 py-2 text-sm font-semibold text-white">
              {monthLabel}
            </div>
            <button
              type="button"
              onClick={() =>
                setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
              }
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {!isFirebaseConfigured ? (
          <div className="bg-brand-gray p-6 rounded-2xl border border-white/5">
            <p className="text-brand-muted">
              Firebase is not configured. Add your <code>VITE_FIREBASE_*</code>{" "}
              values to
              <code>.env.local</code> and restart the dev server.
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
            <p className="mt-4 text-brand-muted">Loading calendar...</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
            <div className="rounded-3xl border border-white/10 bg-brand-gray overflow-hidden">
              <div className="grid grid-cols-7 border-b border-white/10 bg-brand-dark/40">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="px-3 py-3 text-xs uppercase tracking-wider text-brand-muted"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const inMonth = day.getMonth() === cursor.getMonth();
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selected);
                  const dayEvents = eventsByDay.get(dateKey(day)) ?? [];

                  return (
                    <button
                      key={dateKey(day)}
                      type="button"
                      onClick={() => setSelected(day)}
                      className={`relative min-h-[96px] border-b border-white/5 border-r border-white/5 p-3 text-left transition-colors ${
                        inMonth ? "bg-brand-gray" : "bg-brand-dark/20"
                      } ${
                        isSelected
                          ? "outline outline-2 outline-brand-accent/60"
                          : ""
                      } hover:bg-white/5`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-sm font-semibold ${
                            inMonth ? "text-white" : "text-brand-muted"
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        {isToday && (
                          <div className="h-2 w-2 rounded-full bg-brand-accent" />
                        )}
                      </div>

                      {dayEvents.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <span
                              key={ev.id}
                              className="inline-flex items-center rounded-full bg-brand-accent/15 px-2 py-0.5 text-[11px] font-semibold text-brand-accent border border-brand-accent/20"
                            >
                              {ev.category}
                            </span>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[11px] text-brand-muted">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-brand-gray p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-display font-bold text-white uppercase tracking-wide">
                  {selected.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <Link
                  to="/events"
                  className="text-sm font-semibold text-brand-accent hover:text-white transition-colors"
                >
                  View all →
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {selectedEvents.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-brand-dark p-5 text-brand-muted">
                    No events on this day.
                  </div>
                ) : (
                  selectedEvents.map((ev) => {
                    const evDateText = ev.event_date?.toDate
                      ? ev.event_date.toDate().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";

                    return (
                      <Link
                        key={ev.id}
                        to={`/events/${ev.id}`}
                        className="block rounded-2xl border border-white/10 bg-brand-dark p-5 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs text-brand-muted">
                              {evDateText} • {ev.location}
                            </div>
                            <div className="mt-1 text-white font-semibold">
                              {ev.title}
                            </div>
                          </div>
                          <div className="inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-bold text-brand-dark uppercase tracking-wider">
                            {ev.category}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-brand-dark p-5">
                <div className="text-xs uppercase tracking-wider text-brand-muted">
                  Tip
                </div>
                <p className="mt-2 text-sm text-brand-muted leading-relaxed">
                  Click an event to open details and RSVP.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
