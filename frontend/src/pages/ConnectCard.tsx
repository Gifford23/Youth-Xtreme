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

interface ConnectCard {
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
  const [submissions, setSubmissions] = useState<ConnectCard[]>([]);
  const [trackLoading, setTrackLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<ConnectCard | null>(
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
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as ConnectCard))
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
      <div className="max-w-6xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-white mb-4 uppercase tracking-tight">
            Connect <span className="text-brand-accent">Card</span>
          </h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Get connected and grow in your faith journey with our youth
            community.
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
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-2xl bg-brand-gray border border-white/10 p-1">
            {[
              { key: "form", label: "First-Timer Form" },
              { key: "track", label: "Growth Track" },
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

        {/* First-Timer Form Tab */}
        {activeTab === "form" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-brand-gray p-8 rounded-3xl border border-white/5 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">
                  Welcome! We're Glad You're Here
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:bg-brand-dark/70 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:bg-brand-dark/70 transition-all text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:bg-brand-dark/70 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-2">
                      Visit Date
                    </label>
                    <input
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) =>
                        setFormData({ ...formData, visit_date: e.target.value })
                      }
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:bg-brand-dark/70 transition-all text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-4">
                    I'm interested in...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? "bg-brand-accent text-brand-dark"
                            : "bg-brand-dark/50 text-brand-muted hover:text-white border border-white/10 hover:border-brand-accent"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={
                    formSubmitting ||
                    !formData.name.trim() ||
                    !formData.email.trim()
                  }
                  className="w-full rounded-2xl bg-brand-accent px-8 py-4 text-base font-bold text-brand-dark hover:bg-white transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {formSubmitting ? "Submitting..." : "Submit Connect Card"}
                </button>
                {formMessage && (
                  <div className="mt-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 w-full">
                    <p className="text-sm text-green-400 font-medium text-center">
                      {formMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Growth Track Tab */}
        {activeTab === "track" && (
          <div className="space-y-8">
            {/* Person Selector */}
            <div className="bg-brand-gray p-6 rounded-3xl border border-white/5 shadow-xl">
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-wide mb-4">
                Select Person
              </h3>
              {trackLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
                </div>
              ) : submissions.length === 0 ? (
                <p className="text-brand-muted text-center py-8">
                  No connect cards submitted yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {submissions.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelectedPerson(person)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        selectedPerson?.id === person.id
                          ? "bg-brand-accent text-brand-dark"
                          : "bg-brand-dark/50 text-brand-muted hover:text-white border border-white/10 hover:border-brand-accent"
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
              <div className="bg-brand-gray p-8 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">
                      Growth Journey
                    </h2>
                    <p className="text-brand-muted">{selectedPerson.name}</p>
                  </div>
                </div>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-white/10"></div>

                  <div className="space-y-8">
                    {growthSteps.map((step) => {
                      const isCompleted =
                        selectedPerson.steps_completed.includes(step.id);
                      return (
                        <div key={step.id} className="flex items-start gap-6">
                          {/* Step Circle */}
                          <div
                            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                              isCompleted
                                ? "bg-brand-accent shadow-lg shadow-brand-accent/30"
                                : "bg-brand-dark/50 border-2 border-white/20"
                            }`}
                          >
                            {step.id.charAt(0).toUpperCase()}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 bg-brand-dark/30 rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-white">
                                {step.title}
                              </h3>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStepToggle(selectedPerson.id, step.id)
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                  isCompleted
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    : "bg-white/10 text-brand-muted hover:text-white hover:bg-white/20"
                                }`}
                              >
                                {isCompleted ? "Completed" : "Mark Complete"}
                              </button>
                            </div>
                            <p className="text-brand-muted">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="mt-10 bg-brand-dark/30 rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-muted">Overall Progress</span>
                    <span className="text-2xl font-bold text-brand-accent">
                      {Math.round(
                        (selectedPerson.steps_completed.length /
                          growthSteps.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="mt-3 bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-accent to-brand-accent/70 transition-all duration-500"
                      style={{
                        width: `${
                          (selectedPerson.steps_completed.length /
                            growthSteps.length) *
                          100
                        }%`,
                      }}
                    ></div>
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
