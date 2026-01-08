import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

// --- INTERFACE ---
interface Testimonial {
  id: string;
  name: string;
  campus: string;
  role: string;
  quote: string;
  image: string;
}

const Testimonials = () => {
  const [stories, setStories] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH REAL DATA FROM FIREBASE ---
  useEffect(() => {
    // ✅ FIX 1: Removed 'if (!db) return' since we fixed firebase.ts to guarantee db exists.

    const q = query(
      collection(db, "testimonials"),
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Testimonial)
      );
      setStories(data);
      setLoading(false);
    });

    // ✅ FIX 2: Added parenthesis () to actually CALL the unsubscribe function
    return () => unsub();
  }, []);

  // --- 2. AUTO-PLAY ---
  useEffect(() => {
    if (stories.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex, stories.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  // Loading or Empty State
  if (loading) return null;
  if (stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-brand-accent font-bold tracking-widest uppercase text-sm mb-2">
            Real Stories
          </h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white">
            Changed Lives
          </h3>
        </div>

        {/* --- SLIDER CONTAINER --- */}
        <div className="relative w-full min-h-[600px] md:h-[600px] bg-brand-gray/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStory.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className="absolute inset-0 grid md:grid-cols-2 h-full"
            >
              {/* LEFT SIDE: Text Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center relative z-10 order-2 md:order-1 bg-black/80 md:bg-gradient-to-r md:from-brand-dark md:via-brand-dark/90 md:to-transparent backdrop-blur-sm h-full overflow-y-auto scrollbar-hide">
                <div className="text-6xl text-brand-accent font-serif opacity-30 mb-2">
                  "
                </div>

                <p className="text-white md:text-lg lg:text-xl leading-relaxed mb-8 font-light italic">
                  {currentStory.quote}
                </p>

                {/* ORGANIZED LABELS */}
                <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3 pb-8">
                  <h4 className="text-3xl font-display font-bold text-white uppercase tracking-tight">
                    {currentStory.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Campus Badge */}
                    <span className="bg-brand-accent text-brand-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                      {currentStory.campus}
                    </span>

                    {/* Vertical Divider */}
                    <div className="h-4 w-px bg-white/30"></div>

                    {/* Role Label */}
                    <span className="text-gray-300 text-sm font-medium tracking-wide">
                      {currentStory.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Image */}
              <div className="relative h-64 md:h-full order-1 md:order-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-brand-dark via-transparent to-transparent z-10 opacity-80" />
                <img
                  src={currentStory.image}
                  alt={currentStory.name}
                  className="w-full h-full object-cover object-center transform scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop";
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* --- CONTROLS --- */}
          <div className="absolute bottom-6 right-6 md:right-12 z-20 flex gap-3">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-brand-accent hover:text-black hover:border-brand-accent transition-all active:scale-95"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-brand-accent hover:text-black hover:border-brand-accent transition-all active:scale-95"
            >
              →
            </button>
          </div>

          {/* Progress Dots */}
          <div className="absolute bottom-6 left-6 md:left-12 z-20 flex gap-2">
            {stories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex
                    ? "w-8 bg-brand-accent"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
