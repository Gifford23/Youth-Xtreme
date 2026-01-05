import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

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

const Media = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "photos" | "videos">("all");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    const q = query(collection(db, "media"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMedia(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MediaItem)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredMedia = media.filter((item) => {
    if (filter === "all") return true;
    return filter === "photos" ? item.type === "photo" : item.type === "video";
  });

  const featuredItem = media.find((item) => item.featured);

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* ✅ FIXED: Changed 'py-14' to 'pt-32 pb-20' to clear the Navbar */}
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold text-white mb-6 uppercase tracking-tight">
            Xtreme <span className="text-brand-accent">Moments</span>
          </h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Relive the energy and excitement of Friday night services, Fun Runs,
            and youth events.
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-10 bg-brand-gray p-6 rounded-3xl border border-white/5 shadow-xl">
            <p className="text-brand-muted text-center">
              Firebase is not configured. Add your{" "}
              <code className="bg-brand-dark/40 px-2 py-1 rounded">
                VITE_FIREBASE_*
              </code>{" "}
              values to
              <code className="bg-brand-dark/40 px-2 py-1 rounded">
                .env.local
              </code>{" "}
              and restart the dev server.
            </p>
          </div>
        )}

        {/* Weekly Highlight */}
        {featuredItem && (
          <div className="mb-20 animate-fade-in-up">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide mb-8 text-center">
              Weekly Highlight
            </h2>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group max-w-5xl mx-auto border border-white/10">
              {featuredItem.type === "video" ? (
                <video
                  className="w-full h-[500px] object-cover"
                  poster={featuredItem.thumbnail}
                  controls
                  playsInline
                >
                  <source src={featuredItem.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={featuredItem.url}
                  alt={featuredItem.caption}
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                  <h3 className="text-4xl font-display font-bold text-white mb-3 uppercase tracking-tight">
                    {featuredItem.event_name}
                  </h3>
                  <p className="text-brand-muted text-xl mb-3 font-medium">
                    {featuredItem.caption}
                  </p>
                  <p className="text-brand-accent font-bold tracking-wide uppercase text-sm bg-brand-accent/10 inline-block px-3 py-1 rounded-full border border-brand-accent/20">
                    {featuredItem.date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-2xl bg-brand-gray border border-white/10 p-1.5 shadow-lg">
            {[
              { key: "all", label: "All Media" },
              { key: "photos", label: "Photos" },
              { key: "videos", label: "Videos" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-2 px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  filter === key
                    ? "bg-brand-accent text-brand-dark shadow-md scale-105"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
            <p className="mt-5 text-brand-muted text-lg animate-pulse">
              Loading gallery...
            </p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-brand-gray p-16 rounded-3xl border border-white/5 text-center border-dashed">
            <h3 className="text-2xl font-display font-bold text-white uppercase mb-3">
              No media yet
            </h3>
            <p className="text-brand-muted text-lg">
              Add photos and videos to the{" "}
              <code className="bg-brand-dark/40 px-2 py-1 rounded text-white">
                media
              </code>{" "}
              collection in Firestore.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in-up">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative rounded-3xl overflow-hidden bg-brand-gray border border-white/5 shadow-xl hover:shadow-2xl hover:border-brand-accent/30 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <div className="aspect-square relative overflow-hidden">
                  {item.type === "video" ? (
                    <div className="relative w-full h-full bg-brand-dark">
                      <img
                        src={item.thumbnail || ""}
                        alt={item.caption}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-brand-accent/90 flex items-center justify-center text-brand-dark shadow-lg group-hover:scale-110 transition-transform">
                          <svg
                            className="w-6 h-6 ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="font-bold text-white text-lg mb-1 leading-tight">
                        {item.event_name}
                      </h4>
                      <p className="text-brand-muted text-sm line-clamp-2 mb-2">
                        {item.caption}
                      </p>
                      <p className="text-brand-accent text-xs font-bold uppercase tracking-wider">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </div>

                {item.featured && (
                  <div className="absolute top-4 right-4 bg-brand-accent text-brand-dark px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="relative max-w-5xl w-full bg-brand-gray rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-accent hover:text-brand-dark transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex-1 overflow-auto bg-black flex items-center justify-center">
                {selectedItem.type === "video" ? (
                  <video
                    className="max-h-[70vh] w-full object-contain"
                    poster={selectedItem.thumbnail}
                    controls
                    autoPlay
                    playsInline
                  >
                    <source src={selectedItem.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.caption}
                    className="max-h-[70vh] w-full object-contain"
                  />
                )}
              </div>

              <div className="p-8 bg-brand-gray border-t border-white/5">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-wide">
                      {selectedItem.event_name}
                    </h3>
                    <p className="text-brand-muted text-lg">
                      {selectedItem.caption}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right shrink-0">
                    <span className="text-brand-accent font-bold text-lg">
                      {selectedItem.date}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-white/70">
                      {selectedItem.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;
