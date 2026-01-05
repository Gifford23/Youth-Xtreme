import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface UserData {
  id: string;
  name: string;
  email: string;
  photo_url: string;
  role: string;
  // Track 1
  steps?: {
    salvation: boolean;
    baptism: boolean;
    life_group: boolean;
    dream_team: boolean;
  };
  // Track 2 (Leadership)
  leadership_steps?: {
    orientation: boolean;
    shadowing: boolean;
    training: boolean;
    active_role: boolean;
  };
}

const Members = () => {
  const [members, setMembers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: View Toggle State
  const [viewMode, setViewMode] = useState<"foundation" | "leadership">(
    "foundation"
  );

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "youth"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[];
      setMembers(membersList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleStep = async (
    userId: string,
    stepKey: string,
    currentValue: boolean
  ) => {
    const userRef = doc(db, "users", userId);

    // ✅ Determine which object to update based on current view
    const fieldPath =
      viewMode === "foundation"
        ? `steps.${stepKey}`
        : `leadership_steps.${stepKey}`;

    await updateDoc(userRef, {
      [fieldPath]: !currentValue,
    });
  };

  const getProgress = (user: UserData) => {
    // ✅ Calculate based on current view
    const steps =
      viewMode === "foundation" ? user.steps : user.leadership_steps;
    if (!steps) return 0;
    const completed = Object.values(steps).filter(Boolean).length;
    return Math.round((completed / 4) * 100);
  };

  // ✅ Define Columns based on View
  const columns =
    viewMode === "foundation"
      ? [
          { key: "salvation", label: "Salvation" },
          { key: "baptism", label: "Baptism" },
          { key: "life_group", label: "Life Group" },
          { key: "dream_team", label: "Dream Team" },
        ]
      : [
          { key: "orientation", label: "Orientation" },
          { key: "shadowing", label: "Shadowing" },
          { key: "training", label: "Training" },
          { key: "active_role", label: "Active Role" },
        ];

  if (loading)
    return (
      <div className="p-8 text-brand-muted">Loading members directory...</div>
    );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Members Directory
          </h1>
          <p className="text-brand-muted">
            Manage spiritual growth and leadership development.
          </p>
        </div>

        {/* ✅ TOGGLE SWITCH */}
        <div className="bg-brand-dark border border-white/10 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setViewMode("foundation")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "foundation"
                ? "bg-brand-accent text-brand-dark shadow-lg"
                : "text-brand-muted hover:text-white"
            }`}
          >
            Foundation Track
          </button>
          <button
            onClick={() => setViewMode("leadership")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "leadership"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-brand-muted hover:text-white"
            }`}
          >
            Leadership Path
          </button>
        </div>
      </div>

      <div
        className={`rounded-2xl border overflow-hidden transition-colors duration-500 ${
          viewMode === "foundation"
            ? "bg-brand-gray/50 border-white/5"
            : "bg-blue-900/10 border-blue-500/20"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-brand-muted text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-white/10">
                  Member
                </th>
                <th className="p-4 font-bold border-b border-white/10">
                  {viewMode === "foundation"
                    ? "Foundation Progress"
                    : "Leadership Progress"}
                </th>
                {/* Dynamic Headers */}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="p-4 font-bold border-b border-white/10 text-center text-brand-text"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => {
                const currentSteps =
                  viewMode === "foundation"
                    ? member.steps
                    : member.leadership_steps;
                const progress = getProgress(member);
                const themeColor =
                  viewMode === "foundation" ? "bg-brand-accent" : "bg-blue-500";
                const checkColor =
                  viewMode === "foundation"
                    ? "text-brand-dark bg-brand-accent border-brand-accent"
                    : "text-white bg-blue-500 border-blue-500";

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* Member Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-brand-muted font-bold text-sm border border-white/10 overflow-hidden">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {member.name}
                          </div>
                          <div className="text-xs text-brand-muted">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Progress Bar */}
                    <td className="p-4 w-32">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            viewMode === "foundation"
                              ? "text-brand-accent"
                              : "text-blue-400"
                          }`}
                        >
                          {progress}%
                        </span>
                        <div className="flex-1 h-1.5 bg-brand-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${themeColor}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Checkboxes */}
                    {columns.map((col) => (
                      <td key={col.key} className="p-4 text-center">
                        <button
                          onClick={() =>
                            toggleStep(
                              member.id,
                              col.key,
                              currentSteps?.[
                                col.key as keyof typeof currentSteps
                              ] || false
                            )
                          }
                          className={`w-6 h-6 rounded border flex items-center justify-center transition-all mx-auto ${
                            currentSteps?.[col.key as keyof typeof currentSteps]
                              ? checkColor
                              : "border-brand-muted/30 text-transparent hover:border-white"
                          }`}
                        >
                          ✓
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}

              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-brand-muted">
                    No youth members found yet.
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

export default Members;
