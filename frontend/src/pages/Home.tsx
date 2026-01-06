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
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

// Components
import EventCard from "../components/events/EventCard";
import Mission from "../components/home/Mission";
import Testimonials from "../components/home/Testimonials";
import CallToAction from "../components/home/CallToAction";
import VerseOfTheDay from "../components/home/VerseOfTheDay";

// --- TYPES ---
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

// --- HELPER: YouTube ID Extractor ---
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// --- COMPONENT: Scroll Reveal Wrapper ---
const ScrollReveal = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// --- COMPONENT: ENHANCED INFINITE MARQUEE ---
const InfiniteMarquee = () => (
  <div className="relative w-full overflow-hidden border-y border-white/10 bg-brand-dark/50 backdrop-blur-md py-4 z-20">
    <div className="absolute inset-0 bg-brand-accent/5"></div>
    <motion.div
      className="flex gap-12 whitespace-nowrap"
      animate={{ x: [0, -1000] }}
      transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
    >
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-12">
          <span className="text-2xl font-display font-bold uppercase tracking-widest text-transparent stroke-text">
            Youth Xtreme
          </span>
          <span className="text-2xl font-display font-bold uppercase tracking-widest text-brand-accent">
            Faith • Fun • Future
          </span>
          <span className="text-2xl font-display font-bold uppercase tracking-widest text-white">
            Bring His Life to the Next Generation
          </span>
        </div>
      ))}
    </motion.div>

    {/* CSS for Outline Text effect */}
    <style>{`
      .stroke-text {
        -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
      }
    `}</style>
  </div>
);

const Home = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Fetch Events
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

    // Fetch Media
    const mediaQuery = query(
      collection(db, "media"),
      orderBy("created_at", "desc"),
      limit(1)
    );
    const mediaUnsubscribe = onSnapshot(mediaQuery, (snap) => {
      const mediaData = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as MediaItem)
      );
      setFeaturedMedia(mediaData[0] || null);
    });

    return () => {
      eventsUnsubscribe();
      mediaUnsubscribe();
    };
  }, []);

  const youtubeId =
    featuredMedia?.type === "video" ? getYouTubeId(featuredMedia.url) : null;

  return (
    <div className="relative isolate min-h-screen bg-brand-dark overflow-x-hidden">
      {/* 🎬 ORIGINAL HERO SECTION (RESTORED) */}
      <div className="relative min-h-screen w-full overflow-hidden flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/481313715_944325814444668_9017226806731183851_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Kbd4mz1JAjEQ7kNvwFfK7qI&_nc_oc=AdkolRWa3yazhVAupXSxmkrDAOXeKc1tmi41iinqYkWXEOY0Xjj0Iv8XZE7mrFYmbWk&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=aO60RdZ9b3V3B64T-WcmBA&oh=00_AfqLybzV6NzDwK7WYHlEbXJBR5tvRDefUe_L0-qlt6hqXQ&oe=69626C1F"
            alt="Youth Xtreme Hero"
            className="h-full w-full object-cover"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-brand-dark/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/40 to-transparent"></div>
        </div>

        {/* Content Container (Grid) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT: Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-black/40 px-4 py-1.5 text-sm font-bold text-brand-accent uppercase tracking-wider backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                Youth Xtreme
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white uppercase drop-shadow-2xl mb-6 leading-tight">
                Faith. Fun. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">
                  Future.
                </span>
              </h1>

              <p className="mt-4 text-lg md:text-xl leading-8 text-gray-200 font-light drop-shadow-md max-w-lg mx-auto lg:mx-0">
                A movement empowering the next generation to live with purpose
                and passion.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/events"
                  className="w-full sm:w-auto rounded-full bg-brand-accent px-8 py-4 text-base font-bold text-brand-dark shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:bg-white hover:scale-105 transition-all duration-300 text-center uppercase tracking-wide"
                >
                  Join the Movement
                </Link>
                <Link
                  to="/connect"
                  className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-all text-center backdrop-blur-sm uppercase tracking-wide"
                >
                  I'm New Here
                </Link>
              </div>
            </motion.div>

            {/* RIGHT: Verse Card (Restored) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <VerseOfTheDay className="lg:mx-0" />
            </motion.div>
          </div>
        </div>

        {/* Scroll Arrow */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block text-brand-muted">
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* ⚡ NEW ENHANCED MARQUEE (Sticky & Modern) */}
      <InfiniteMarquee />

      {/* 🔥 MISSION SECTION */}
      <ScrollReveal>
        <Mission />
      </ScrollReveal>

      {/* 📅 EVENTS SECTION */}
      <div className="bg-brand-dark py-24 relative z-10">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-gray/30 to-transparent pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-1 bg-brand-accent"></span>
                  <span className="text-brand-accent font-bold uppercase tracking-widest text-sm">
                    Don't Miss Out
                  </span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl font-display uppercase">
                  Upcoming{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                    Events
                  </span>
                </h2>
              </div>
              <Link
                to="/events"
                className="hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 hover:border-brand-accent text-sm font-bold text-white hover:text-brand-accent transition-all hover:bg-white/5"
              >
                View Full Calendar <span aria-hidden="true">→</span>
              </Link>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-brand-muted bg-brand-gray/30 rounded-3xl border border-white/5">
              <p>No events found. Check back soon!</p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {events.map((event, index) => (
                <ScrollReveal key={event.id} delay={index * 0.1}>
                  <EventCard
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
                </ScrollReveal>
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-white transition-colors"
            >
              View Full Calendar →
            </Link>
          </div>
        </div>
      </div>

      {/* 🎥 WEEKLY HIGHLIGHT (Immersive) */}
      {featuredMedia && (
        <div className="relative py-32 bg-black overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600 rounded-full blur-[128px]"></div>
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-brand-accent rounded-full blur-[128px]"></div>
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <span className="text-brand-accent font-bold tracking-widest uppercase text-sm mb-2 block">
                  Watch This
                </span>
                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl font-display uppercase mb-6">
                  Latest{" "}
                  <span className="text-stroke-white text-transparent">
                    Highlight
                  </span>
                </h2>
                <p className="text-lg leading-8 text-brand-muted mb-8">
                  {featuredMedia.caption ||
                    "Relive the best moments from our recent gathering. God is moving in this place!"}
                </p>
                <Link
                  to="/media"
                  className="inline-flex items-center gap-3 text-white font-bold hover:text-brand-accent transition-colors text-lg group"
                >
                  <span className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:border-brand-accent group-hover:bg-brand-accent group-hover:text-black transition-all">
                    ▶
                  </span>
                  Watch More Moments
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-brand-gray group">
                {featuredMedia.type === "video" ? (
                  youtubeId ? (
                    <iframe
                      className="w-full h-64 md:h-96"
                      src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                      title="YouTube video player"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      className="w-full h-64 md:h-96 object-cover"
                      poster={featuredMedia.thumbnail}
                      controls
                      playsInline
                    >
                      <source src={featuredMedia.url} type="video/mp4" />
                    </video>
                  )
                ) : (
                  <img
                    src={featuredMedia.url}
                    alt={featuredMedia.caption}
                    className="w-full h-64 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 pointer-events-none border-4 border-white/5 rounded-3xl"></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* 💬 TESTIMONIALS */}
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>

      {/* 🚀 CALL TO ACTION */}
      <CallToAction />
    </div>
  );
};

export default Home;
