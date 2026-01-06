import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
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
  // Track 2 (Booklet)
  booklet?: {
    crossroads: boolean;
    crossover: boolean;
    crossways: boolean;
  };
  // Track 3 (Leadership)
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
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"foundation" | "booklet" | "leadership">(
    "foundation"
  );

  useEffect(() => {
    // Fetch only 'youth' role members
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

  // Filter members based on search
  const filteredMembers = members.filter((member) =>
    (member.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (member.email || "").toLowerCase().includes(search.toLowerCase())
  );

  // Delete Member
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently remove this member?")) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (error) {
        console.error("Error deleting member:", error);
        alert("Failed to delete member.");
      }
    }
  };

  const toggleStep = async (
    userId: string,
    stepKey: string,
    currentValue: boolean
  ) => {
    const userRef = doc(db, "users", userId);

    let fieldPath = "";
    if (viewMode === "foundation") fieldPath = `steps.${stepKey}`;
    else if (viewMode === "booklet") fieldPath = `booklet.${stepKey}`;
    else fieldPath = `leadership_steps.${stepKey}`;

    await updateDoc(userRef, {
      [fieldPath]: !currentValue,
    });
  };

  const getProgress = (user: UserData) => {
    let steps: any;
    let total = 4;

    if (viewMode === "foundation") {
      steps = user.steps;
    } else if (viewMode === "booklet") {
      steps = user.booklet;
      total = 3;
    } else {
      steps = user.leadership_steps;
    }

    if (!steps) return 0;
    const completed = Object.values(steps).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  let columns: { key: string; label: string }[] = [];

  if (viewMode === "foundation") {
    columns = [
      { key: "salvation", label: "Salvation" },
      { key: "baptism", label: "Baptism" },
      { key: "life_group", label: "Life Group" },
      { key: "dream_team", label: "Dream Team" },
    ];
  } else if (viewMode === "booklet") {
    columns = [
      { key: "crossroads", label: "Crossroads" },
      { key: "crossover", label: "Crossover" },
      { key: "crossways", label: "Crossways" },
    ];
  } else {
    columns = [
      { key: "orientation", label: "Orientation" },
      { key: "shadowing", label: "Shadowing" },
      { key: "training", label: "Training" },
      { key: "active_role", label: "Active Role" },
    ];
  }

  const getThemeColor = () => {
    if (viewMode === "foundation") return "bg-brand-accent";
    if (viewMode === "booklet") return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getCheckColor = () => {
    if (viewMode === "foundation") return "text-brand-dark bg-brand-accent border-brand-accent";
    if (viewMode === "booklet") return "text-black bg-yellow-500 border-yellow-500";
    return "text-white bg-blue-500 border-blue-500";
  };

  if (loading)
    return (
      <div className="p-8 text-brand-muted">Loading members directory...</div>
    );

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Members Directory
          </h1>
          <p className="text-brand-muted">
            Manage spiritual growth and leadership development.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* SEARCH INPUT */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search members..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 pl-10 text-white focus:outline-none focus:border-brand-accent w-full sm:w-64"
            />
            <svg className="w-4 h-4 text-brand-muted absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* VIEW TOGGLE */}
          <div className="bg-brand-dark border border-white/10 p-1 rounded-xl inline-flex flex-wrap gap-1">
            <button
              onClick={() => setViewMode("foundation")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === "foundation"
                  ? "bg-brand-accent text-brand-dark shadow-lg"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Foundation
            </button>
            <button
              onClick={() => setViewMode("booklet")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === "booklet"
                  ? "bg-yellow-500 text-black shadow-lg"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Booklet
            </button>
            <button
              onClick={() => setViewMode("leadership")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === "leadership"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Leadership
            </button>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl border overflow-hidden transition-colors duration-500 ${
          viewMode === "foundation"
            ? "bg-brand-gray/50 border-white/5"
            : viewMode === "booklet" 
            ? "bg-yellow-900/10 border-yellow-500/20"
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
                    : viewMode === "booklet"
                    ? "Booklet Progress"
                    : "Leadership Progress"}
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="p-4 font-bold border-b border-white/10 text-center text-brand-text"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="p-4 font-bold border-b border-white/10 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map((member) => {
                let currentSteps: any;
                if (viewMode === "foundation") currentSteps = member.steps;
                else if (viewMode === "booklet") currentSteps = member.booklet;
                else currentSteps = member.leadership_steps;

                const progress = getProgress(member);
                const themeColor = getThemeColor();
                const checkColor = getCheckColor();

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
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

                    <td className="p-4 w-32">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            viewMode === "foundation"
                              ? "text-brand-accent"
                              : viewMode === "booklet" 
                              ? "text-yellow-500"
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

                    {columns.map((col) => (
                      <td key={col.key} className="p-4 text-center">
                        <button
                          onClick={() =>
                            toggleStep(
                              member.id,
                              col.key,
                              currentSteps?.[col.key] || false
                            )
                          }
                          className={`w-6 h-6 rounded border flex items-center justify-center transition-all mx-auto ${
                            currentSteps?.[col.key]
                              ? checkColor
                              : "border-brand-muted/30 text-transparent hover:border-white"
                          }`}
                        >
                          ✓
                        </button>
                      </td>
                    ))}

                    {/* DELETE BUTTON */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(member.id)}
                        className="text-brand-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete Member"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 3} className="p-8 text-center text-brand-muted">
                    No members found.
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