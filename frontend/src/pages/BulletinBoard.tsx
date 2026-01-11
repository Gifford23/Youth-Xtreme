import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

// --- TYPES ---
interface Notice {
  id: string;
  type:
    | "urgent"
    | "event"
    | "shoutout"
    | "volunteer"
    | "general"
    | "devotional";
  title: string;
  content: string;
  date: any;
  author: string;
  isPinned?: boolean;
}

// --- SAMPLE DATA ---
const SAMPLE_NOTICES: Notice[] = [
  {
    id: "1",
    type: "urgent",
    title: "⚠️ Time Change for Friday!",
    content:
      "Heads up fam! Youth Service starts at 6:30 PM this week due to the school event. Spread the word!",
    date: "Today, 10:00 AM",
    author: "Pastor Josh",
    isPinned: true,
  },
  {
    id: "3",
    type: "shoutout",
    title: "🎉 Congrats Angelo!",
    content:
      "Big shoutout to Angelo for passing his board exams! We are so proud of you bro. God is good!",
    date: "2 days ago",
    author: "Youth Xtreme",
    isPinned: false,
  },
  {
    id: "2",
    type: "event",
    title: "🏕️ Camp Deposits Due",
    content:
      "If you're going to Summer Xtreme Camp, we need your 500 PHP deposit by this Sunday. Don't lose your spot!",
    date: "Yesterday",
    author: "Admin Team",
  },
  {
    id: "4",
    type: "volunteer",
    title: "🎸 Bassist Needed",
    content:
      "Worship team is looking for a bass player for next month's rotation. If you can play (even a little), DM us!",
    date: "3 days ago",
    author: "Worship Team",
  },
  {
    id: "5",
    type: "devotional",
    title: "Verse of the Week",
    content:
      "'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' - Joshua 1:9",
    date: "Monday",
    author: "Daily Bread",
  },
];

const BulletinBoard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // ✅ FETCH FROM FIREBASE
  useEffect(() => {
    if (!db) {
      setNotices(SAMPLE_NOTICES);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "bulletin_board"),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().created_at?.toDate
            ? doc
                .data()
                .created_at.toDate()
                .toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "Just now",
        })) as Notice[];
        const sortedData = fetchedData.sort(
          (a, b) => Number(b.isPinned) - Number(a.isPinned)
        );
        setNotices(sortedData);
      } else {
        setNotices(SAMPLE_NOTICES);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredNotices = notices.filter(
    (n) => filter === "all" || n.type === filter
  );

  // --- PAPER THEME STYLES ---
  const getPaperStyle = (type: string, index: number) => {
    // Generate a pseudo-random rotation between -2deg and 2deg based on index
    const rotation = index % 2 === 0 ? "rotate-1" : "-rotate-1";

    switch (type) {
      case "urgent":
        return {
          container: `bg-[#fee2e2] text-red-900 shadow-xl border-l-4 border-red-500 ${rotation}`, // Redish paper
          badge: "bg-red-100 text-red-800 border border-red-200",
          icon: "🚨",
          decoration: "pin",
        };
      case "shoutout":
        return {
          container: `bg-[#fef3c7] text-yellow-900 shadow-lg ${rotation}`, // Yellow Post-it
          badge: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          icon: "🎉",
          decoration: "tape",
        };
      case "event":
        return {
          container: `bg-white text-slate-800 shadow-xl border border-slate-200 ${rotation}`, // Clean White Flyer
          badge: "bg-blue-50 text-blue-700 border border-blue-100",
          icon: "📅",
          decoration: "pin",
        };
      case "volunteer":
        return {
          container: `bg-[#f3e8ff] text-purple-900 shadow-lg border-dashed border-2 border-purple-300 ${rotation}`, // Purple Note
          badge: "bg-purple-100 text-purple-800",
          icon: "🤝",
          decoration: "tape",
        };
      case "devotional":
        return {
          container: `bg-[#ecfdf5] text-emerald-900 shadow-md border-t-4 border-emerald-500 ${rotation}`, // Green Journal
          badge: "bg-emerald-100 text-emerald-800",
          icon: "📖",
          decoration: "none",
        };
      default:
        return {
          container: `bg-white text-gray-800 shadow-lg ${rotation}`,
          badge: "bg-gray-100 text-gray-600",
          icon: "📌",
          decoration: "pin",
        };
    }
  };

  const categories = [
    { id: "all", label: "All Posts" },
    { id: "urgent", label: "Urgent" },
    { id: "event", label: "Events" },
    { id: "shoutout", label: "Shoutouts" },
    { id: "volunteer", label: "Needs" },
    { id: "devotional", label: "Devo" },
  ];

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Texture (Corkboard vibe or Dark Wall) */}
      <div className="absolute inset-0 bg-[#1a1a1a] opacity-100 pointer-events-none">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="text-center mb-16 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight drop-shadow-2xl"
          >
            The <span className="text-brand-accent">Bulletin</span> Board
          </motion.h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Check out what's happening on the wall this week.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                filter === cat.id
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* MASONRY GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-brand-accent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            layout
            className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 px-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotices.map((note, idx) => {
                const style = getPaperStyle(note.type, idx);

                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02, rotate: 0, zIndex: 10 }}
                    className={`break-inside-avoid relative p-6 md:p-8 rounded-sm ${style.container} transition-all duration-300`}
                  >
                    {/* --- DECORATION: PIN or TAPE --- */}
                    {style.decoration === "pin" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-md border border-gray-400 z-20"></div>
                    )}
                    {style.decoration === "tape" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/30 backdrop-blur-sm rotate-2 shadow-sm border-l border-r border-white/40 z-20"></div>
                    )}
                    {note.isPinned && (
                      <div className="absolute -top-4 -right-2 z-30 transform rotate-12">
                        <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 shadow-md uppercase tracking-wider">
                          Pinned
                        </span>
                      </div>
                    )}

                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl filter drop-shadow-sm">
                        {style.icon}
                      </span>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${style.badge}`}
                        >
                          {note.type}
                        </span>
                        <p className="text-[10px] font-mono opacity-60 mt-1 uppercase">
                          {typeof note.date === "string" ? note.date : "Recent"}
                        </p>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <h3 className="text-xl font-bold mb-3 leading-tight font-display">
                      {note.title}
                    </h3>
                    <p className="text-sm opacity-90 leading-relaxed mb-6 font-medium">
                      {note.content}
                    </p>

                    {/* FOOTER */}
                    <div className="flex items-center gap-3 pt-4 border-t border-black/10">
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold">
                        {note.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold opacity-80">
                          Posted by
                        </p>
                        <p className="text-xs font-bold">{note.author}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredNotices.length === 0 && (
          <div className="text-center py-32">
            <div className="text-6xl mb-4 opacity-30">📌</div>
            <p className="text-brand-muted">The board is clear.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletinBoard;
