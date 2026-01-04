import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import EventCard from "../components/events/EventCard";

interface AppEvent {
  id: string;
  title: string;
  event_date: any;
  location: string;
  category: string;
  image_url: string;
}

const Events = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "events"), orderBy("event_date", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as AppEvent[];
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
        <p className="mt-4 text-brand-muted">Loading Xtreme Events...</p>
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
        <h1 className="text-3xl font-display font-bold text-white mb-6 uppercase tracking-tight">
          Events
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

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-4xl font-display font-bold text-white mb-12 uppercase tracking-tight">
        Upcoming <span className="text-brand-accent">Events</span>
      </h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            title={event.title}
            // Logic to handle Firestore Timestamp to string conversion
            date={
              event.event_date?.toDate
                ? event.event_date.toDate().toLocaleDateString()
                : "Date TBD"
            }
            location={event.location}
            category={event.category}
            image={event.image_url}
          />
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-20 text-brand-muted">
          <p>No events found in the database.</p>
        </div>
      )}
    </div>
  );
};

export default Events;
