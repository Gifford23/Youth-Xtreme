import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, type DocumentData } from "firebase/firestore";
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
}

const ResourceDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!db || !id) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "resources", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }

        setItem({
          id: snap.id,
          ...(snap.data() as DocumentData),
        } as ResourceItem);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (!isFirebaseConfigured) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
        <h1 className="text-3xl font-display font-bold text-white mb-6 uppercase tracking-tight">
          Resources
        </h1>
        <div className="bg-brand-gray p-6 rounded-2xl border border-white/5">
          <p className="text-brand-muted">
            Firebase is not configured. Add your <code>VITE_FIREBASE_*</code>{" "}
            values to
            <code>.env.local</code> and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
        <p className="mt-4 text-brand-muted">Loading resource...</p>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto min-h-screen">
        <h1 className="text-3xl font-display font-bold text-white mb-6 uppercase tracking-tight">
          Not Found
        </h1>
        <p className="text-brand-muted mb-8">
          This resource may have been removed or the link is incorrect.
        </p>
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors border border-white/10"
        >
          Back to Resources
        </Link>
      </div>
    );
  }

  const createdText = item.created_at?.toDate
    ? item.created_at.toDate().toLocaleDateString()
    : undefined;

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-white transition-colors"
          >
            <span aria-hidden="true">←</span> Back to Resources
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-brand-gray shadow-2xl shadow-black/30 overflow-hidden">
          <div className="p-6 md:p-10 border-b border-white/5">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-brand-muted border border-white/10">
                  {item.type ?? "Other"}
                </div>
                <h1 className="mt-4 font-display text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
                  {item.title}
                </h1>
                {item.verse && (
                  <p className="mt-3 text-brand-accent font-semibold">
                    {item.verse}
                  </p>
                )}
              </div>

              {createdText && (
                <div className="rounded-2xl bg-brand-dark border border-white/10 px-4 py-3 text-sm text-brand-muted">
                  <div className="text-[11px] uppercase tracking-wider">
                    Published
                  </div>
                  <div className="mt-1 text-white font-semibold">
                    {createdText}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 md:p-10">
            {item.excerpt && (
              <div className="rounded-2xl border border-white/10 bg-brand-dark p-5 text-brand-muted">
                <div className="text-[11px] uppercase tracking-wider text-brand-muted">
                  Summary
                </div>
                <p className="mt-2 leading-relaxed">{item.excerpt}</p>
              </div>
            )}

            <div className="mt-8">
              <div className="text-[11px] uppercase tracking-wider text-brand-muted">
                Content
              </div>
              <div className="mt-3 text-brand-text leading-relaxed whitespace-pre-line">
                {item.content ?? "No content yet."}
              </div>
            </div>

            <div className="mt-10">
              <Link
                to="/resources"
                className="inline-flex items-center justify-center rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold text-brand-dark hover:bg-white transition-colors"
              >
                Explore more resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
