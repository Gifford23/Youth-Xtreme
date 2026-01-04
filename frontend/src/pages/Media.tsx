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
      <div className="max-w-7xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            Xtreme <span className="text-brand-accent">Moments</span>
          </h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
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
          <div className="mb-12">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide mb-6 text-center">
              Weekly Highlight
            </h2>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              {featuredItem.type === "video" ? (
                <video
                  className="w-full h-96 object-cover"
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
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {featuredItem.event_name}
                  </h3>
                  <p className="text-brand-muted text-lg">
                    {featuredItem.caption}
                  </p>
                  <p className="text-brand-accent mt-2">{featuredItem.date}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl bg-brand-gray border border-white/10 p-1">
            {[
              { key: "all", label: "All Media" },
              { key: "photos", label: "Photos" },
              { key: "videos", label: "Videos" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                  filter === key
                    ? "bg-brand-accent text-brand-dark shadow-lg"
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
            <p className="mt-5 text-brand-muted text-lg">Loading gallery...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-brand-gray p-16 rounded-3xl border border-white/5 text-center">
            <h3 className="text-2xl font-display font-bold text-white uppercase mb-3">
              No media yet
            </h3>
            <p className="text-brand-muted text-lg">
              Add photos and videos to the{" "}
              <code className="bg-brand-dark/40 px-2 py-1 rounded">media</code>{" "}
              collection in Firestore.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-brand-gray border border-white/5 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="aspect-square">
                  {item.type === "video" ? (
                    <div className="relative w-full h-full">
                      <img
                        src={item.thumbnail || ""}
                        alt={item.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-brand-accent/90 flex items-center justify-center text-white">
                          <svg
                            className="w-8 h-8 ml-1"
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="font-bold text-white text-sm mb-1">
                      {item.event_name}
                    </h4>
                    <p className="text-brand-muted text-xs line-clamp-2">
                      {item.caption}
                    </p>
                    <p className="text-brand-accent text-xs mt-1">
                      {item.date}
                    </p>
                  </div>
                </div>
                {item.featured && (
                  <div className="absolute top-3 right-3 bg-brand-accent text-brand-dark px-2 py-1 rounded-full text-xs font-bold">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-brand-gray rounded-3xl border border-white/5 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
              <div className="max-h-[80vh] overflow-auto">
                {selectedItem.type === "video" ? (
                  <video
                    className="w-full"
                    poster={selectedItem.thumbnail}
                    controls
                    playsInline
                  >
                    <source src={selectedItem.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.caption}
                    className="w-full"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedItem.event_name}
                  </h3>
                  <p className="text-brand-muted mb-4">
                    {selectedItem.caption}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-brand-accent">
                    <span>{selectedItem.date}</span>
                    <span className="capitalize">{selectedItem.type}</span>
                    {selectedItem.featured && <span>Featured</span>}
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
