import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface ConnectCardData {
  id: string;
  name: string;
  email: string;
  phone: string;
  visit_date: string;
  interests: string[];
  steps_completed: string[]; // IDs of steps: 'welcome', 'baptism', etc.
  created_at: any;
}

const ConnectCards = () => {
  const [submissions, setSubmissions] = useState<ConnectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "growth">("list");

  // Growth Steps Definition (Must match public page)
  const growthSteps = [
    { id: "welcome", label: "Welcome" },
    { id: "baptism", label: "Baptism" },
    { id: "small_group", label: "Small Group" },
    { id: "serve", label: "Serving" },
    { id: "leadership", label: "Leadership" },
  ];

  useEffect(() => {
    const q = query(
      collection(db, "connect_cards"),
      orderBy("created_at", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ConnectCardData[];
      setSubmissions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this card?")) {
      await deleteDoc(doc(db, "connect_cards", id));
    }
  };

  const toggleGrowthStep = async (
    personId: string,
    stepId: string,
    currentSteps: string[]
  ) => {
    const newSteps = currentSteps.includes(stepId)
      ? currentSteps.filter((s) => s !== stepId)
      : [...currentSteps, stepId];

    await updateDoc(doc(db, "connect_cards", personId), {
      steps_completed: newSteps,
      updated_at: serverTimestamp(),
    });
  };

  if (loading)
    return <div className="p-8 text-brand-muted">Loading submissions...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Connect Cards
          </h1>
          <p className="text-brand-muted">
            Manage visitors and track spiritual growth.
          </p>
        </div>

        {/* View Toggle */}
        <div className="bg-brand-dark border border-white/10 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setViewMode("list")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "list"
                ? "bg-brand-accent text-brand-dark shadow-lg"
                : "text-brand-muted hover:text-white"
            }`}
          >
            Visitor List
          </button>
          <button
            onClick={() => setViewMode("growth")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "growth"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-brand-muted hover:text-white"
            }`}
          >
            Growth Tracker
          </button>
        </div>
      </div>

      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-brand-muted text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-white/10">Name</th>
                {viewMode === "list" ? (
                  <>
                    <th className="p-4 font-bold border-b border-white/10">
                      Contact Info
                    </th>
                    <th className="p-4 font-bold border-b border-white/10">
                      Visit Date
                    </th>
                    <th className="p-4 font-bold border-b border-white/10">
                      Interests
                    </th>
                  </>
                ) : (
                  <>
                    {growthSteps.map((step) => (
                      <th
                        key={step.id}
                        className="p-4 font-bold border-b border-white/10 text-center"
                      >
                        {step.label}
                      </th>
                    ))}
                    <th className="p-4 font-bold border-b border-white/10 text-center">
                      Progress
                    </th>
                  </>
                )}
                <th className="p-4 font-bold border-b border-white/10 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {submissions.map((person) => {
                const progress = Math.round(
                  ((person.steps_completed?.length || 0) / growthSteps.length) *
                    100
                );

                return (
                  <tr
                    key={person.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-bold text-white">{person.name}</div>
                      {viewMode === "growth" && (
                        <div className="text-xs text-brand-muted">
                          {person.email}
                        </div>
                      )}
                    </td>

                    {viewMode === "list" ? (
                      <>
                        <td className="p-4 text-sm">
                          <div className="text-white">{person.email}</div>
                          <div className="text-brand-muted">{person.phone}</div>
                        </td>
                        <td className="p-4 text-sm text-white">
                          {person.visit_date}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {person.interests?.map((interest, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-brand-muted border border-white/5"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {growthSteps.map((step) => {
                          const isComplete = person.steps_completed?.includes(
                            step.id
                          );
                          return (
                            <td key={step.id} className="p-4 text-center">
                              <button
                                onClick={() =>
                                  toggleGrowthStep(
                                    person.id,
                                    step.id,
                                    person.steps_completed || []
                                  )
                                }
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto border ${
                                  isComplete
                                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50"
                                    : "bg-black/20 border-white/10 text-transparent hover:border-white/30"
                                }`}
                              >
                                ✓
                              </button>
                            </td>
                          );
                        })}
                        <td className="p-4 w-24">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-purple-400">
                              {progress}%
                            </span>
                            <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </>
                    )}

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(person.id)}
                        className="text-brand-muted hover:text-red-400 transition-colors p-2"
                        title="Delete Card"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {submissions.length === 0 && (
                <tr>
                  <td
                    colSpan={viewMode === "list" ? 5 : 8}
                    className="p-12 text-center text-brand-muted"
                  >
                    No connect cards found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConnectCards;
