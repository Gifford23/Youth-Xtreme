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

interface ConnectCardData {
  id: string;
  name: string;
  email: string;
  phone: string;
  visit_date: string;
  interests: string[];
  steps_completed: string[];
  created_at: any;
}

const ConnectCard = () => {
  const [activeTab, setActiveTab] = useState<"form" | "track">("form");

  // First-Timer Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    visit_date: "",
    interests: [] as string[],
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  // Growth Track state
  const [submissions, setSubmissions] = useState<ConnectCardData[]>([]);
  const [trackLoading, setTrackLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<ConnectCardData | null>(
    null
  );

  const interestOptions = [
    "Youth Services",
    "Small Groups",
    "Events",
    "Volunteering",
    "Leadership",
    "Worship Team",
    "Media Team",
    "Outreach",
  ];

  const growthSteps = [
    {
      id: "welcome",
      title: "Welcome Call",
      description: "Personal welcome from our team",
    },
    {
      id: "baptism",
      title: "Baptism",
      description: "Take the next step in faith",
    },
    {
      id: "small_group",
      title: "Join Small Group",
      description: "Connect with peers",
    },
    {
      id: "serve",
      title: "Start Serving",
      description: "Use your gifts",
    },
    {
      id: "leadership",
      title: "Leadership Training",
      description: "Develop as a leader",
    },
  ];

  // Fetch submissions for Growth Track
  useEffect(() => {
    if (!db || activeTab !== "track") return;
    setTrackLoading(true);
    const q = query(
      collection(db, "connect_cards"),
      orderBy("created_at", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSubmissions(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as ConnectCardData))
      );
      setTrackLoading(false);
    });
    return unsub;
  }, [activeTab]);

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleFormSubmit = async () => {
    if (!db || !formData.name.trim() || !formData.email.trim()) return;
    setFormSubmitting(true);
    setFormMessage("");
    try {
      await addDoc(collection(db, "connect_cards"), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        visit_date:
          formData.visit_date || new Date().toISOString().split("T")[0],
        interests: formData.interests,
        steps_completed: [],
        created_at: serverTimestamp(),
      });
      setFormMessage("Thank you! We'll be in touch soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        visit_date: "",
        interests: [],
      });
    } catch (err) {
      setFormMessage("Failed to submit. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStepToggle = async (personId: string, stepId: string) => {
    if (!db) return;
    const person = submissions.find((p) => p.id === personId);
    if (!person) return;
    const newSteps = person.steps_completed.includes(stepId)
      ? person.steps_completed.filter((s) => s !== stepId)
      : [...person.steps_completed, stepId];
    await updateDoc(doc(db, "connect_cards", personId), {
      steps_completed: newSteps,
      updated_at: serverTimestamp(),
    });
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* ✅ FIXED: Changed 'py-14' to 'pt-32 pb-20' 
         This pushes content down so it's not hidden behind the Navbar 
      */}
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-display font-bold text-white mb-6 uppercase tracking-tight">
            Connect <span className="text-brand-accent">Card</span>
          </h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            New to Youth Xtreme? We’d love to get to know you! Fill out the form
            below to get connected, or track your spiritual growth journey.
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-10 bg-brand-gray p-6 rounded-3xl border border-white/5 shadow-xl">
            <p className="text-brand-muted text-center">
              Firebase is not configured. Check your <code>.env.local</code>{" "}
              file.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-2xl bg-brand-gray border border-white/10 p-1.5 shadow-lg">
            {[
              { key: "form", label: "I'm New Here" },
              { key: "track", label: "My Growth Track" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === key
                    ? "bg-brand-accent text-brand-dark shadow-md scale-105"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* First-Timer Form Tab */}
        {activeTab === "form" && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="bg-brand-gray p-8 sm:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-brand-muted mb-2 ml-1">
                      Full Name <span className="text-brand-accent">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Jane Doe"
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-muted mb-2 ml-1">
                      Email <span className="text-brand-accent">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="jane@example.com"
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-brand-muted mb-2 ml-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="(0917) 123-4567"
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-muted mb-2 ml-1">
                      Visit Date
                    </label>
                    <input
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) =>
                        setFormData({ ...formData, visit_date: e.target.value })
                      }
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-muted mb-4 ml-1">
                    I'm interested in...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                          formData.interests.includes(interest)
                            ? "bg-brand-accent text-brand-dark border-brand-accent shadow-lg shadow-brand-accent/20"
                            : "bg-brand-dark/30 text-brand-muted border-white/5 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={
                    formSubmitting ||
                    !formData.name.trim() ||
                    !formData.email.trim()
                  }
                  className="w-full rounded-xl bg-brand-accent px-8 py-4 text-base font-bold text-brand-dark hover:bg-white hover:scale-[1.02] transition-all shadow-lg hover:shadow-brand-accent/30 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {formSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : (
                    "Submit Connect Card"
                  )}
                </button>
                {formMessage && (
                  <div
                    className={`mt-4 p-4 rounded-xl text-center font-medium ${
                      formMessage.includes("Failed")
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                    }`}
                  >
                    {formMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Growth Track Tab */}
        {activeTab === "track" && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Person Selector */}
            <div className="bg-brand-gray p-8 rounded-3xl border border-white/5 shadow-xl">
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-wide mb-6 border-b border-white/10 pb-4">
                Select Your Profile
              </h3>
              {trackLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-brand-muted">
                    No profiles found. Submit a Connect Card first!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {submissions.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelectedPerson(person)}
                      className={`p-4 rounded-xl text-sm font-bold transition-all border ${
                        selectedPerson?.id === person.id
                          ? "bg-brand-accent text-brand-dark border-brand-accent shadow-lg scale-105"
                          : "bg-brand-dark/40 text-brand-muted border-white/5 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {person.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Growth Track Map */}
            {selectedPerson && (
              <div className="bg-brand-gray p-8 sm:p-10 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-white/10 pb-6">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wide">
                      Growth Journey
                    </h2>
                    <p className="text-brand-muted mt-1">
                      Tracking progress for{" "}
                      <span className="text-white font-bold">
                        {selectedPerson.name}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-brand-dark/50 px-4 py-2 rounded-lg border border-white/5">
                    <span className="text-brand-muted text-sm uppercase tracking-wider font-bold">
                      Total Progress:
                    </span>
                    <span className="text-2xl font-bold text-brand-accent">
                      {Math.round(
                        (selectedPerson.steps_completed.length /
                          growthSteps.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-white/10 hidden sm:block"></div>

                  <div className="space-y-8">
                    {growthSteps.map((step) => {
                      const isCompleted =
                        selectedPerson.steps_completed.includes(step.id);
                      return (
                        <div
                          key={step.id}
                          className="flex flex-col sm:flex-row items-start gap-6 group"
                        >
                          {/* Step Circle */}
                          <div
                            className={`relative z-10 w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-2xl font-display font-bold transition-all duration-500 ${
                              isCompleted
                                ? "bg-brand-accent text-brand-dark shadow-[0_0_20px_rgba(204,255,0,0.4)] scale-110"
                                : "bg-brand-dark border-2 border-white/10 text-white/30 group-hover:border-white/30"
                            }`}
                          >
                            {step.id.charAt(0).toUpperCase()}
                          </div>

                          {/* Step Content */}
                          <div
                            className={`flex-1 w-full rounded-2xl p-6 border transition-all duration-300 ${
                              isCompleted
                                ? "bg-brand-dark/60 border-brand-accent/30 shadow-lg"
                                : "bg-brand-dark/30 border-white/5 hover:bg-brand-dark/50"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                              <h3
                                className={`text-xl font-bold ${
                                  isCompleted
                                    ? "text-white"
                                    : "text-brand-muted"
                                }`}
                              >
                                {step.title}
                              </h3>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStepToggle(selectedPerson.id, step.id)
                                }
                                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                  isCompleted
                                    ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                    : "bg-white/5 text-brand-muted border-white/10 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {isCompleted ? "✓ Completed" : "Mark Complete"}
                              </button>
                            </div>
                            <p className="text-brand-muted text-sm leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectCard;
