import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";

// ✅ CONFIGURATION: Campus Identities with LOGOS
const CAMPUSES = [
  {
    id: "Liceo",
    name: "Liceo U",
    color: "from-red-900 to-red-600",
    logo: "/logos/liceo.png",
  },
  {
    id: "USTP",
    name: "USTP",
    color: "from-blue-900 to-yellow-600",
    logo: "/logos/ustp.png",
  },
  {
    id: "COC",
    name: "Phinma COC",
    color: "from-green-900 to-green-600",
    logo: "/logos/coc.png",
  },
  {
    id: "CU",
    name: "CU",
    color: "from-blue-800 to-blue-500",
    logo: "/logos/cu.png",
  },
  {
    id: "STI",
    name: "STI",
    color: "from-yellow-600 to-blue-600",
    logo: "/logos/sti.png",
  },
  {
    id: "SPC",
    name: "SPC",
    color: "from-purple-900 to-purple-600",
    logo: "/logos/spc.png",
  },
];

// --- TYPES ---
interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  caption: string;
  event_name: string;
  date: string;
  school?: string;
  created_at: any;
}

// --- SUB-COMPONENT: MOMENTS (Stories Bar) ---
const MomentsBar = ({
  items,
  onSelect,
}: {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}) => {
  if (items.length === 0) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar mb-6">
      {items.slice(0, 15).map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]"
        >
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-brand-accent to-blue-500">
            <div className="w-full h-full rounded-full border-2 border-brand-dark overflow-hidden relative">
              {item.type === "video" ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={item.url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              )}
            </div>
          </div>
          <span className="text-[10px] text-white truncate w-16 text-center font-bold">
            {item.event_name.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- SUB-COMPONENT: MASONRY GALLERY (Grid Pictures) ---
const CampusGallery = ({
  items,
  onSelect,
}: {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}) => {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer bg-brand-gray/20 border border-white/5"
        >
          {item.type === "video" ? (
            <div className="relative">
              <video
                src={item.url}
                className="w-full h-auto object-cover opacity-90"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm border border-white/20">
                  ▶️
                </div>
              </div>
            </div>
          ) : (
            <img
              src={item.url}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p className="text-white text-xs font-bold line-clamp-2">
              {item.event_name}
            </p>
            <p className="text-[10px] text-brand-accent">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- SUB-COMPONENT: UPDATES (Sidebar News) ---
const CampusUpdates = ({ items }: { items: MediaItem[] }) => {
  const newsItems = items
    .filter((i) => i.caption && i.caption.length > 5)
    .slice(0, 4);

  return (
    <div className="bg-brand-gray/30 rounded-2xl p-5 border border-white/5 h-fit sticky top-24">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        📢 Campus Updates
      </h3>
      <div className="space-y-4">
        {newsItems.length === 0 ? (
          <p className="text-brand-muted text-sm">No recent updates.</p>
        ) : (
          newsItems.map((item) => (
            <div
              key={item.id}
              className="border-l-2 border-brand-accent pl-4 py-1 group"
            >
              <h4 className="text-white text-sm font-bold leading-tight mb-1 group-hover:text-brand-accent transition-colors">
                {item.event_name}
              </h4>
              <p className="text-brand-muted text-xs line-clamp-2 mb-1">
                {item.caption}
              </p>
              <span className="text-[10px] text-white/40">{item.date}</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold text-white uppercase mb-2">
          Upcoming Events
        </h4>
        <p className="text-xs text-brand-muted">
          Check back soon for the official calendar.
        </p>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const Media = () => {
  const [activeSchool, setActiveSchool] = useState<string | null>(null); // Null = Hub View
  // ✅ NEW: Tab State for "Montage Moments"
  const [activeTab, setActiveTab] = useState<"overview" | "montage">(
    "overview"
  );

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    const q = query(collection(db, "media"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMedia(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MediaItem)));
      setLoading(false);
    });
    return () => unsub;
  }, []);

  // 2. Check Admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        setIsAdmin(userSnap.exists() && userSnap.data().role === "admin");
      }
    });
    return () => unsub;
  }, []);

  // 3. Filter Logic
  const filteredMedia = useMemo(() => {
    if (!activeSchool) return media;
    return media.filter((m) => m.school === activeSchool);
  }, [media, activeSchool]);

  // ✅ Filter specifically for videos
  const videoMedia = useMemo(() => {
    return filteredMedia.filter((m) => m.type === "video");
  }, [filteredMedia]);

  const schoolConfig = CAMPUSES.find((c) => c.id === activeSchool);

  return (
    // ✅ FIXED: Increased top padding to pt-32 to clear the fixed navbar properly
    <div className="min-h-screen bg-brand-dark pb-20 pt-32">
      {/* --- VIEW 1: THE HUB (Global Navigation) --- */}
      {!activeSchool ? (
        <div className="max-w-7xl mx-auto px-4 animate-fade-in">
          {/* ✅ FIXED: Header Spacing & Visibility */}
          <div className="text-center mb-16 relative z-10">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg">
              Campus <span className="text-brand-accent">Hub</span>
            </h1>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto leading-relaxed">
              Select a campus to explore moments, highlights, and updates.
            </p>
          </div>

          {/* School Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {CAMPUSES.map((campus) => (
              <button
                key={campus.id}
                onClick={() => {
                  setActiveSchool(campus.id);
                  setActiveTab("overview"); // Reset tab on switch
                }}
                className={`group relative overflow-hidden rounded-2xl aspect-[3/4] flex flex-col items-center justify-end p-4 border border-white/5 hover:border-brand-accent/50 transition-all bg-gradient-to-b ${campus.color}`}
              >
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />

                <div className="relative z-10 text-center flex flex-col items-center transform group-hover:-translate-y-2 transition-transform">
                  <div className="w-24 h-24 mb-4 filter drop-shadow-2xl transition-transform group-hover:scale-110">
                    <img
                      src={campus.logo}
                      alt={campus.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = "🎓";
                      }}
                    />
                  </div>
                  <h3 className="text-white font-bold text-lg uppercase tracking-wider">
                    {campus.name}
                  </h3>
                  <span className="text-[10px] text-white/70 uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    Enter Portal →
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Global Trending Feed */}
          <div className="border-t border-white/10 pt-10">
            <h2 className="text-2xl font-bold text-white mb-6">
              🔥 Recent Highlights
            </h2>
            {loading ? (
              <div className="h-64 bg-white/5 animate-pulse rounded-xl"></div>
            ) : (
              <CampusGallery
                items={media.slice(0, 8)}
                onSelect={setSelectedItem}
              />
            )}
          </div>
        </div>
      ) : (
        /* --- VIEW 2: CAMPUS PORTAL --- */
        <div className="animate-slide-up">
          {/* Sticky Campus Header */}
          <div
            className={`sticky top-0 z-40 bg-brand-dark/90 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all`}
            style={{ top: "0px" }} // Ensure it sticks at very top
          >
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <button
                onClick={() => setActiveSchool(null)}
                className="flex items-center gap-2 text-brand-muted hover:text-white transition-colors text-sm font-bold uppercase"
              >
                ← Back to Hub
              </button>
              <div className="flex items-center gap-3">
                <img
                  src={schoolConfig?.logo}
                  alt="logo"
                  className="w-8 h-8 object-contain drop-shadow-md"
                />
                <h2 className="text-lg font-bold text-white uppercase tracking-widest hidden sm:block">
                  {schoolConfig?.name}
                </h2>
              </div>
              <div className="w-20" /> {/* Spacer */}
            </div>
          </div>

          {/* Hero Banner */}
          <div
            className={`relative h-64 w-full bg-gradient-to-r ${schoolConfig?.color} flex items-center justify-center mb-0`}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <img
                src={schoolConfig?.logo}
                alt={schoolConfig?.name}
                className="w-24 h-24 mb-4 object-contain drop-shadow-2xl animate-fade-in-up"
              />
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white drop-shadow-2xl">
                {schoolConfig?.id}
              </h1>
              <p className="text-white/90 font-bold uppercase tracking-[0.3em] text-sm mt-2">
                Official Campus Portal
              </p>
            </div>
          </div>

          {/* ✅ NEW: Tab Navigation Bar */}
          <div className="border-b border-white/10 bg-black/20 mb-8">
            <div className="max-w-7xl mx-auto px-4 flex gap-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "overview"
                    ? "border-brand-accent text-white"
                    : "border-transparent text-brand-muted hover:text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("montage")}
                className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === "montage"
                    ? "border-brand-accent text-white"
                    : "border-transparent text-brand-muted hover:text-white"
                }`}
              >
                Montage Moments 🎥
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4">
            {/* --- TAB CONTENT: OVERVIEW --- */}
            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-[1fr,350px] gap-8 animate-fade-in">
                {/* Left Column: Feed Content */}
                <div>
                  {/* Section: Moments */}
                  <div className="mb-8">
                    <h3 className="text-brand-muted text-xs font-bold uppercase mb-4 tracking-widest">
                      ✨ Moments
                    </h3>
                    {filteredMedia.length > 0 ? (
                      <MomentsBar
                        items={filteredMedia}
                        onSelect={setSelectedItem}
                      />
                    ) : (
                      <p className="text-sm text-brand-muted italic">
                        No moments shared yet.
                      </p>
                    )}
                  </div>

                  {/* Section: Gallery */}
                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-bold text-white">
                        Media Gallery
                      </h3>
                      <span className="text-xs font-bold text-brand-accent px-3 py-1 bg-brand-accent/10 rounded-full">
                        {filteredMedia.length} Posts
                      </span>
                    </div>

                    {filteredMedia.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
                        <p className="text-brand-muted">
                          No media uploaded for {schoolConfig?.name} yet.
                        </p>
                      </div>
                    ) : (
                      <CampusGallery
                        items={filteredMedia}
                        onSelect={setSelectedItem}
                      />
                    )}
                  </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                  <CampusUpdates items={filteredMedia} />

                  {/* Quick Links */}
                  <div className="bg-brand-gray/30 rounded-2xl p-5 border border-white/5">
                    <h3 className="text-white font-bold text-sm uppercase mb-3">
                      Quick Links
                    </h3>
                    <ul className="space-y-2 text-sm text-brand-muted">
                      <li className="hover:text-brand-accent cursor-pointer transition-colors flex justify-between">
                        <span>Student Council</span> <span>↗</span>
                      </li>
                      <li className="hover:text-brand-accent cursor-pointer transition-colors flex justify-between">
                        <span>Campus Ministry</span> <span>↗</span>
                      </li>
                      <li className="hover:text-brand-accent cursor-pointer transition-colors flex justify-between">
                        <span>Join Volunteers</span> <span>↗</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB CONTENT: MONTAGE MOMENTS --- */}
            {activeTab === "montage" && (
              <div className="animate-fade-in pb-20">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">
                    Youth Moments
                  </h2>
                  <p className="text-brand-muted">
                    Watch exclusive video highlights from {schoolConfig?.name}
                  </p>
                </div>

                {videoMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-2xl bg-brand-gray/20">
                    <span className="text-4xl mb-4">🎬</span>
                    <h3 className="text-white font-bold text-lg">
                      No Montages Yet
                    </h3>
                    <p className="text-brand-muted text-sm mt-2">
                      Videos will appear here once uploaded.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoMedia.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => setSelectedItem(video)}
                        className="group relative aspect-video bg-black rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-brand-accent/50 transition-all"
                      >
                        <video
                          src={video.url}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 bg-brand-accent rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="ml-1 text-black font-bold">▶</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent">
                          <h3 className="text-white font-bold truncate">
                            {video.event_name}
                          </h3>
                          <p className="text-xs text-gray-300 mt-1">
                            {video.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-4 flex items-center justify-center animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row bg-brand-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[50vh]">
              {selectedItem.type === "video" ? (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh]"
                />
              ) : (
                <img
                  src={selectedItem.url}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              )}
            </div>

            {/* Info Sidebar */}
            <div className="w-full md:w-80 bg-brand-gray/50 p-6 flex flex-col border-l border-white/5">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-brand-accent text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {selectedItem.school || "General"}
                  </span>
                  <span className="text-brand-muted text-xs">
                    {selectedItem.date}
                  </span>
                </div>
                <h2 className="text-white font-bold text-lg leading-tight">
                  {selectedItem.event_name}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedItem.caption || "No caption provided."}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
