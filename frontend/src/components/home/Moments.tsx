import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface Moment {
  id: string;
  url: string;
  caption: string;
}

const Moments = () => {
  const [moments, setMoments] = useState<Moment[]>([]);

  // 1. Fetch Moments
  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "moments"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMoments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Moment[];
      setMoments(fetchedMoments);
    });

    return () => unsubscribe();
  }, []);

  // 2. Prepare Infinite List
  // We duplicate the list to create a seamless "infinite" loop effect
  const displayMoments =
    moments.length > 0 ? [...moments, ...moments, ...moments] : [];

  if (moments.length === 0) return null;

  return (
    <div className="py-24 bg-brand-dark overflow-hidden border-t border-white/5 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-accent/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-brand-accent font-bold uppercase tracking-widest text-xs">
              Moments Captured
            </span>
          </div>
          <h2 className="text-3xl font-sans font-bold text-white uppercase tracking-widest">
            Relive the{" "}
            <span className="italic font-medium opacity-90 pr-2">
              Experience
            </span>
          </h2>
        </div>

        <a
          href="https://www.instagram.com/youthxtremecdeo/"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 text-white border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-brand-dark transition-all font-bold text-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Follow @youthxtremecdeo
        </a>
      </div>

      {/* --- SMOOTH SCROLLING MARQUEE --- */}
      <div className="relative w-full overflow-hidden marquee-container">
        {/* Using standard div with CSS animation for perfect pause/resume behavior */}
        <div className="flex gap-6 px-6 lg:px-8 w-max marquee-content">
          {displayMoments.map((moment, index) => (
            <div
              // Use index in key because IDs are duplicated
              key={`${moment.id}-${index}`}
              className="relative group w-72 h-96 rounded-2xl overflow-hidden cursor-pointer bg-neutral-900 shrink-0"
            >
              {/* Image */}
              <img
                src={moment.url}
                alt={moment.caption}
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

              {/* Caption */}
              <div className="absolute bottom-4 left-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <span className="text-brand-accent text-xs font-bold uppercase tracking-wider mb-1 block">
                  #YouthXtreme Cdo
                </span>
                <p className="text-white font-bold text-lg">{moment.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="absolute bottom-4 right-8 md:hidden text-white/50 text-xs font-bold animate-pulse pointer-events-none">
          ← Swipe to see more
        </div>
      </div>

      {/* ✅ CSS STYLES FOR SMOOTH MARQUEE */}
      <style>{`
        .marquee-content {
          animation: scroll 40s linear infinite;
        }
        
        /* Pause on hover without resetting position */
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Move by 1/3rd because we tripled the list */
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
};

export default Moments;
