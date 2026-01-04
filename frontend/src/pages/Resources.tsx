import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

type ResourceType = "Devotional" | "Sermon Notes" | "Small Group" | "Other";

interface ResourceItem {
  id: string;
  title: string;
  type?: ResourceType;
  verse?: string;
  excerpt?: string;
  content?: string;
  created_at?: any;
  updated_at?: any;
}

const Resources = () => {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<ResourceType | "All">("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "resources"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (docSnap: QueryDocumentSnapshot<DocumentData>) => ({
          id: docSnap.id,
          ...(docSnap.data() as DocumentData),
        })
      ) as ResourceItem[];

      setItems(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return items.filter((item) => {
      if (activeType !== "All" && item.type !== activeType) return false;

      if (!s) return true;

      const haystack = `${item.title ?? ""} ${item.verse ?? ""} ${
        item.excerpt ?? ""
      }`.toLowerCase();
      return haystack.includes(s);
    });
  }, [items, activeType, search]);

  const types: Array<ResourceType | "All"> = [
    "All",
    "Devotional",
    "Sermon Notes",
    "Small Group",
    "Other",
  ];

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-brand-muted border border-white/10 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
            Weekly Devotionals & Resources
          </div>

          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight">
                Resources <span className="text-brand-accent">&</span>{" "}
                Devotionals
              </h1>
              <p className="mt-3 text-brand-muted max-w-2xl">
                A weekly feed of verses, sermon notes, and small group
                materials.
              </p>
            </div>

            <div className="w-full sm:w-80">
              <label className="block text-xs uppercase tracking-wider text-brand-muted mb-2">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or verse..."
                className="w-full bg-brand-gray border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
                  activeType === t
                    ? "bg-brand-accent text-brand-dark border-brand-accent"
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {!isFirebaseConfigured ? (
          <div className="bg-brand-gray p-6 rounded-2xl border border-white/5">
            <p className="text-brand-muted">
              Firebase is not configured. Add your <code>VITE_FIREBASE_*</code>{" "}
              values to
              <code>.env.local</code> and restart the dev server.
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
            <p className="mt-4 text-brand-muted">Loading resources...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-brand-gray p-10 rounded-3xl border border-white/5 text-center">
            <h2 className="text-xl font-display font-bold text-white uppercase">
              No posts yet
            </h2>
            <p className="mt-3 text-brand-muted">
              Add documents to the <code>resources</code> collection in
              Firestore to publish weekly devotionals.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                to={`/resources/${item.id}`}
                className="group overflow-hidden rounded-2xl bg-brand-gray border border-white/5 hover:border-brand-accent/40 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand-accent/10"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-brand-muted border border-white/10">
                      {item.type ?? "Other"}
                    </div>
                    <span className="text-xs text-brand-muted group-hover:text-white transition-colors">
                      Read →
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-display font-bold text-white uppercase tracking-wide group-hover:text-brand-accent transition-colors">
                    {item.title ?? "Untitled"}
                  </h3>

                  {item.verse && (
                    <p className="mt-3 text-sm font-semibold text-brand-accent">
                      {item.verse}
                    </p>
                  )}

                  <p className="mt-3 text-sm text-brand-muted leading-relaxed line-clamp-3">
                    {item.excerpt ?? item.content ?? "Open to view details."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
