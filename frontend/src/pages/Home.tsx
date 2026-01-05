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
import { db } from "../lib/firebase";
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

    // 1. Fetch Events
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

    // 2. Fetch Featured Media
    const mediaQuery = query(
      collection(db, "media"),
      orderBy("created_at", "desc"),
      limit(1)
    );
    const mediaUnsubscribe = onSnapshot(mediaQuery, (snap) => {
      const mediaData = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as MediaItem)
      );
      // ✅ Fixed TypeScript logic here
      const featured = mediaData[0];
      setFeaturedMedia(featured || null);
    });

    return () => {
      eventsUnsubscribe();
      mediaUnsubscribe();
    };
  }, []);

  return (
    <div className="relative isolate min-h-screen bg-brand-dark">
      {/* 🎬 DYNAMIC HIGHLIGHT VIDEO BACKGROUND */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden sm:-top-80 h-[100vh]">
        {/* The Video Layer */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="https://plus.unsplash.com/premium_photo-1661377118520-287ec60a32f3?w=600&auto=format&fit=crop&q=60" // Fallback image
        >
          {/* 🔴 IMPORTANT: Replace this file with your actual highlight video! */}
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-brand-dark/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-48 sm:py-64 lg:px-8 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="text-center animate-fade-in-up">
          {/* Small Tagline */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-1.5 text-sm font-bold text-brand-accent uppercase tracking-wider backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
            Happening Now at Youth Xtreme
          </div>

          <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-8xl uppercase drop-shadow-2xl">
            Faith. Fun. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">
              Future.
            </span>
          </h1>

          <p className="mt-8 text-xl leading-8 text-gray-200 max-w-2xl mx-auto font-light drop-shadow-md">
            We are a movement dedicated to empowering the next generation. Come
            experience the energy, the community, and the purpose.
          </p>

          <div className="mt-12 flex items-center justify-center gap-x-6">
            <Link
              to="/events"
              className="rounded-full bg-brand-accent px-10 py-4 text-base font-bold text-brand-dark shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:bg-white hover:scale-105 transition-all duration-300"
            >
              Check Upcoming Events
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Weekly Highlight Section (Existing) */}
      {featuredMedia && (
        <div className="bg-brand-gray py-24 sm:py-32 border-t border-white/5 relative z-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                WEEKLY <span className="text-brand-accent">HIGHLIGHT</span>
              </h2>
              <p className="mt-2 text-lg leading-8 text-brand-muted">
                Relive the best moments from our recent events.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group max-w-4xl mx-auto border border-white/10">
              {featuredMedia.type === "video" ? (
                <video
                  className="w-full h-96 object-cover"
                  poster={featuredMedia.thumbnail}
                  controls
                  playsInline
                >
                  <source src={featuredMedia.url} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={featuredMedia.url}
                  alt={featuredMedia.caption}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {featuredMedia.event_name}
                  </h3>
                  <p className="text-brand-muted text-lg mb-2">
                    {featuredMedia.caption}
                  </p>
                  <p className="text-brand-accent font-bold">
                    {featuredMedia.date}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
              <Link
                to="/media"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-bold text-white hover:bg-white/10 transition-all"
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

      {/* Events Section (Existing) */}
      <div className="bg-brand-dark py-24 sm:py-32 border-t border-white/5 relative z-10">
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
