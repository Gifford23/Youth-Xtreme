import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion } from "framer-motion";

// Types
interface Reel {
  id: string;
  video: string;
  caption?: string;
  createdAt?: any; // ✅ Add createdAt field
}

const FeaturedHighlight = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. FETCH REELS FROM FIREBASE
  useEffect(() => {
    if (!db) return;

    // Query ordered by creation time (newest first)
    const q = query(collection(db, "reels"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reelsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reel[];
      setReels(reelsData);
    });

    return () => unsubscribe();
  }, []);

  // Scroll Handler
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 340;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // ✅ Helper: Format Date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // If no reels exist yet, hide the section
  if (reels.length === 0) return null;

  return (
    <section className="relative py-24 bg-brand-dark overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-brand-accent"></span>
              <span className="text-brand-accent font-bold tracking-widest uppercase text-xs">
                Stay Connected
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white uppercase leading-none">
              Weekly Highlights
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-3 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
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
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-3 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
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
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <a
              href="https://www.facebook.com/yxcdo"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-brand-dark bg-white px-6 py-3 rounded-full hover:bg-brand-accent transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Follow
            </a>
          </div>
        </div>

        {/* SLIDER */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide px-2"
        >
          {reels.map((reel, index) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative min-w-[280px] w-[280px] md:w-[320px] aspect-[9/16] snap-center flex-shrink-0"
            >
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl relative group hover:border-brand-accent/30 transition-colors duration-500">
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <iframe
                    src={reel.video}
                    width="100%"
                    height="100%"
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    className="w-full h-full scale-[1.02]"
                  ></iframe>
                </div>

                {/* Gradient Overlay for Text Visibility */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/80 rounded-[2rem]"></div>

                {/* ✅ DATE BADGE */}
                {reel.createdAt && (
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                      <svg
                        className="w-3 h-3 text-brand-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {formatDate(reel.createdAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
};

export default FeaturedHighlight;
