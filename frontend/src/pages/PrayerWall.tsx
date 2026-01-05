import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

const PrayerWall = () => {
  const [activeTab, setActiveTab] = useState<"requests" | "praise">("requests");

  // Prayer Request Form
  const [requestForm, setRequestForm] = useState({ request: "" });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  // Praise Report Form
  const [praiseForm, setPraiseForm] = useState({ author: "", testimony: "" });
  const [praiseSubmitting, setPraiseSubmitting] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState("");

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
      setRequestMessage("Request sent to our prayer team! 🙏");
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
      setPraiseMessage("Praise report submitted! 🙌");
    } catch (err) {
      setPraiseMessage("Failed to share praise. Please try again.");
    } finally {
      setPraiseSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-white mb-6 uppercase tracking-tight">
            Prayer <span className="text-brand-accent">Center</span>
          </h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            "Do not be anxious about anything, but in every situation, by prayer
            and petition, with thanksgiving, present your requests to God."{" "}
            <br />{" "}
            <span className="text-sm font-bold mt-2 block">
              - Philippians 4:6
            </span>
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-10 bg-brand-gray p-6 rounded-3xl border border-white/5 shadow-xl">
            <p className="text-brand-muted text-center">
              Firebase is not configured.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-2xl bg-brand-gray border border-white/10 p-1.5 shadow-lg">
            {[
              { key: "requests", label: "Submit Prayer Request" },
              { key: "praise", label: "Share Praise Report" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as any)}
                className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === key
                    ? "bg-brand-accent text-brand-dark shadow-md"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* --- FORM SECTION ONLY --- */}
        <div className="max-w-2xl mx-auto animate-fade-in-up">
          {activeTab === "requests" ? (
            <div className="bg-brand-gray p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide mb-2">
                  How can we pray for you?
                </h2>
                <p className="text-brand-muted mb-6 text-sm">
                  Your request will be shared securely with our prayer leaders.
                </p>

                <textarea
                  value={requestForm.request}
                  onChange={(e) => setRequestForm({ request: e.target.value })}
                  placeholder="Type your prayer request here..."
                  className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all min-h-[160px] resize-none text-lg leading-relaxed"
                />

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleRequestSubmit}
                    disabled={requestSubmitting || !requestForm.request.trim()}
                    className="w-full rounded-xl bg-brand-accent px-8 py-4 text-lg font-bold text-brand-dark hover:bg-white transition-all shadow-lg hover:shadow-brand-accent/30 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {requestSubmitting ? "Sending..." : "Send Request"}
                  </button>
                </div>

                {requestMessage && (
                  <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-fade-in">
                    <p className="text-green-400 font-bold">{requestMessage}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-brand-gray p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide mb-2">
                  Share a Testimony
                </h2>
                <p className="text-brand-muted mb-6 text-sm">
                  Let us know what God has done in your life!
                </p>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={praiseForm.author}
                    onChange={(e) =>
                      setPraiseForm({ ...praiseForm, author: e.target.value })
                    }
                    placeholder="Your Name (Optional)"
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all text-lg"
                  />
                  <textarea
                    value={praiseForm.testimony}
                    onChange={(e) =>
                      setPraiseForm({
                        ...praiseForm,
                        testimony: e.target.value,
                      })
                    }
                    placeholder="Share your testimony here..."
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all min-h-[160px] resize-none text-lg leading-relaxed"
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handlePraiseSubmit}
                    disabled={praiseSubmitting || !praiseForm.testimony.trim()}
                    className="w-full rounded-xl bg-green-500 px-8 py-4 text-lg font-bold text-white hover:bg-green-400 transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                  >
                    {praiseSubmitting ? "Sharing..." : "Share Testimony"}
                  </button>
                </div>

                {praiseMessage && (
                  <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-fade-in">
                    <p className="text-green-400 font-bold">{praiseMessage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerWall;
