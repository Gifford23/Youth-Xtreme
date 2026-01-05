import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebase"; // Removed isFirebaseConfigured check for cleaner UI (optional)
import EventCard from "../components/events/EventCard";
import { Link } from "react-router-dom";

interface AppEvent {
  id: string;
  title: string;
  event_date: any;
  location: string;
  category: string;
  image_url: string;
}

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  caption: string;
  event_name: string;
  date: string;
  featured: boolean;
  created_at: any;
}

const Home = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Fetch events
    const eventsQuery = query(
      collection(db, "events"),
      orderBy("event_date", "asc"),
      limit(3)
    );
    const eventsUnsubscribe = onSnapshot(eventsQuery, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as AppEvent[];
      setEvents(eventsData);
      setLoading(false);
    });

    // Fetch featured media
    const mediaQuery = query(
      collection(db, "media"),
      orderBy("created_at", "desc"),
      limit(1)
    );
    const mediaUnsubscribe = onSnapshot(mediaQuery, (snap) => {
      const mediaData = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as MediaItem)
      );
      const featured = mediaData.find((item) => item.featured) || mediaData[0];
      setFeaturedMedia(featured || null);
    });

    return () => {
      eventsUnsubscribe();
      mediaUnsubscribe();
    };
  }, []);

  return (
    <div className="relative isolate min-h-screen">
      {/* Modern Hero with Video Background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-accent/20 via-brand-accent/10 to-transparent opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          <source src="/videos/hero-background.webm" type="video/webm" />
          {/* Fallback gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand-accent/10 to-brand-dark/50"></div>
        </video>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-32 sm:py-48 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-7xl uppercase">
            Faith. Fun. <span className="text-brand-accent">Future.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-brand-muted max-w-2xl mx-auto">
            Welcome to Youth Xtreme. We are a community dedicated to empowering
            the next generation through faith, fellowship, and purpose.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={() => videoRef.current?.play()}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              Play Video
            </button>
            <Link
              to="/events"
              className="rounded-full bg-brand-accent px-8 py-3.5 text-sm font-bold text-brand-dark shadow-sm hover:bg-white transition-all"
            >
              Check Upcoming Events
            </Link>
            <Link
              to="/admin"
              className="text-sm font-semibold leading-6 text-white hover:text-brand-accent transition-colors"
            >
              Admin <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Weekly Highlight Section */}
      {featuredMedia && (
        <div className="bg-brand-gray py-24 sm:py-32 border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                WEEKLY <span className="text-brand-accent">HIGHLIGHT</span>
              </h2>
              <p className="mt-2 text-lg leading-8 text-brand-muted">
                Relive the best moments from our recent events.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group max-w-4xl mx-auto">
              {featuredMedia.type === "video" ? (
                <video
                  className="w-full h-96 object-cover"
                  poster={featuredMedia.thumbnail}
                  controls
                  playsInline
                >
                  <source src={featuredMedia.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={featuredMedia.url}
                  alt={featuredMedia.caption}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {featuredMedia.event_name}
                  </h3>
                  <p className="text-brand-muted text-lg mb-2">
                    {featuredMedia.caption}
                  </p>
                  <p className="text-brand-accent">{featuredMedia.date}</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link
                to="/media"
                className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-6 py-3 text-sm font-bold text-brand-dark shadow-sm hover:bg-white transition-all"
              >
                View More Moments
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Events Section */}
      <div className="bg-brand-dark py-24 sm:py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
              UPCOMING <span className="text-brand-accent">EVENTS</span>
            </h2>
            <p className="mt-2 text-lg leading-8 text-brand-muted">
              Don't miss out on what God is doing at Youth Xtreme.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
              <p className="mt-4 text-brand-muted">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-brand-muted">
              <p>No events found. Check back soon!</p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  // ✅ FIXED: Passing single 'event' object
                  event={{
                    id: event.id,
                    title: event.title,
                    date: event.event_date?.toDate
                      ? event.event_date.toDate().toLocaleDateString()
                      : "Date TBD",
                    location: event.location,
                    category: event.category,
                    imageUrl: event.image_url,
                  }}
                />
              ))}
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-white transition-colors"
              >
                View All Events
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
