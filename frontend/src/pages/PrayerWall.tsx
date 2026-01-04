import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

interface PrayerRequest {
  id: string;
  request: string;
  created_at: any;
  commit_count: number;
}

interface PraiseReport {
  id: string;
  author: string;
  testimony: string;
  created_at: any;
}

const PrayerWall = () => {
  const [activeTab, setActiveTab] = useState<"requests" | "praise">("requests");

  // Prayer requests state
  const [requestForm, setRequestForm] = useState({ request: "" });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // Praise reports state
  const [praiseForm, setPraiseForm] = useState({ author: "", testimony: "" });
  const [praiseSubmitting, setPraiseSubmitting] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState("");
  const [praises, setPraises] = useState<PraiseReport[]>([]);
  const [praisesLoading, setPraisesLoading] = useState(true);

  // Fetch prayer requests
  useEffect(() => {
    if (!db || activeTab !== "requests") return;
    setRequestsLoading(true);
    const q = query(
      collection(db, "prayer_requests"),
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as PrayerRequest))
      );
      setRequestsLoading(false);
    });
    return unsub;
  }, [activeTab]);

  // Fetch praise reports
  useEffect(() => {
    if (!db || activeTab !== "praise") return;
    setPraisesLoading(true);
    const q = query(
      collection(db, "praise_reports"),
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPraises(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as PraiseReport))
      );
      setPraisesLoading(false);
    });
    return unsub;
  }, [activeTab]);

  const handleRequestSubmit = async () => {
    if (!db || !requestForm.request.trim()) return;
    setRequestSubmitting(true);
    setRequestMessage("");
    try {
      await addDoc(collection(db, "prayer_requests"), {
        request: requestForm.request.trim(),
        created_at: serverTimestamp(),
        commit_count: 0,
      });
      setRequestForm({ request: "" });
      setRequestMessage("Request posted successfully!");
    } catch (err) {
      setRequestMessage("Failed to post request. Please try again.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handlePraiseSubmit = async () => {
    if (!db || !praiseForm.testimony.trim()) return;
    setPraiseSubmitting(true);
    setPraiseMessage("");
    try {
      await addDoc(collection(db, "praise_reports"), {
        author: praiseForm.author.trim(),
        testimony: praiseForm.testimony.trim(),
        created_at: serverTimestamp(),
      });
      setPraiseForm({ author: "", testimony: "" });
      setPraiseMessage("Praise shared successfully!");
    } catch (err) {
      setPraiseMessage("Failed to share praise. Please try again.");
    } finally {
      setPraiseSubmitting(false);
    }
  };

  const handleCommitToPray = async (
    requestId: string,
    currentCount: number
  ) => {
    if (!db) return;
    await updateDoc(doc(db, "prayer_requests", requestId), {
      commit_count: (currentCount || 0) + 1,
    });
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-6xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            Prayer <span className="text-brand-accent">Wall</span>
          </h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Share your prayer requests and praise reports with our community.
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

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl bg-brand-gray border border-white/10 p-1">
            {[
              { key: "requests", label: "Prayer Requests" },
              { key: "praise", label: "Praise Reports" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === key
                    ? "bg-brand-accent text-brand-dark shadow-lg"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Prayer Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-10">
            {/* Post Request Form */}
            <div className="bg-brand-gray p-8 rounded-3xl border border-white/5 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">
                  Share a Prayer Request
                </h2>
              </div>
              <textarea
                value={requestForm.request}
                onChange={(e) => setRequestForm({ request: e.target.value })}
                placeholder="Share what you'd like us to pray for (anonymous)..."
                className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:bg-brand-dark/70 transition-all min-h-[140px] resize-none text-lg"
              />
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-brand-muted flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  Your request is anonymous
                </p>
                <button
                  type="button"
                  onClick={handleRequestSubmit}
                  disabled={requestSubmitting || !requestForm.request.trim()}
                  className="rounded-2xl bg-brand-accent px-8 py-4 text-base font-bold text-brand-dark hover:bg-white transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {requestSubmitting ? "Posting..." : "Post Request"}
                </button>
              </div>
              {requestMessage && (
                <div className="mt-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-400 font-medium">
                    {requestMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Requests List */}
            {requestsLoading ? (
              <div className="text-center py-24">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
                <p className="mt-5 text-brand-muted text-lg">
                  Loading requests...
                </p>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-brand-gray p-16 rounded-3xl border border-white/5 text-center">
                <h3 className="text-2xl font-display font-bold text-white uppercase mb-3">
                  No requests yet
                </h3>
                <p className="text-brand-muted text-lg">
                  Be the first to share a prayer request.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="bg-brand-gray p-7 rounded-3xl border border-white/5 shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    <p className="text-white text-lg mb-5 whitespace-pre-wrap leading-relaxed">
                      {r.request}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs text-brand-muted uppercase tracking-wide">
                        {r.created_at?.toDate?.()?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }) ?? ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCommitToPray(r.id, r.commit_count)}
                        className="flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10"
                      >
                        <span className="text-lg">
                          Commit to Pray ({r.commit_count || 0})
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Praise Reports Tab */}
        {activeTab === "praise" && (
          <div className="space-y-10">
            {/* Share Praise Form */}
            <div className="bg-brand-gray p-8 rounded-3xl border border-white/5 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">
                  Share a Praise Report
                </h2>
              </div>
              <input
                type="text"
                value={praiseForm.author}
                onChange={(e) =>
                  setPraiseForm({ ...praiseForm, author: e.target.value })
                }
                placeholder="Your name (optional)"
                className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:bg-brand-dark/70 transition-all mb-5 text-lg"
              />
              <textarea
                value={praiseForm.testimony}
                onChange={(e) =>
                  setPraiseForm({ ...praiseForm, testimony: e.target.value })
                }
                placeholder="Share how God has moved in your life..."
                className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:bg-brand-dark/70 transition-all min-h-[140px] resize-none text-lg"
              />
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handlePraiseSubmit}
                  disabled={praiseSubmitting || !praiseForm.testimony.trim()}
                  className="rounded-2xl bg-brand-accent px-8 py-4 text-base font-bold text-brand-dark hover:bg-white transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {praiseSubmitting ? "Sharing..." : "Share Praise"}
                </button>
              </div>
              {praiseMessage && (
                <div className="mt-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-400 font-medium">
                    {praiseMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Praise List */}
            {praisesLoading ? (
              <div className="text-center py-24">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
                <p className="mt-5 text-brand-muted text-lg">
                  Loading praise reports...
                </p>
              </div>
            ) : praises.length === 0 ? (
              <div className="bg-brand-gray p-16 rounded-3xl border border-white/5 text-center">
                <h3 className="text-2xl font-display font-bold text-white uppercase mb-3">
                  No praise reports yet
                </h3>
                <p className="text-brand-muted text-lg">
                  Be the first to share what God has done!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {praises.map((p) => (
                  <div
                    key={p.id}
                    className="bg-brand-gray p-8 rounded-3xl border border-white/5 shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-lg">
                          {p.author ? p.author.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">
                            {p.author || "Anonymous"}
                          </h3>
                          <span className="text-xs text-brand-muted uppercase tracking-wide">
                            {p.created_at
                              ?.toDate?.()
                              ?.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }) ?? ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-white text-lg whitespace-pre-wrap leading-relaxed">
                      {p.testimony}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerWall;
