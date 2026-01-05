import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Confetti from "react-confetti";

interface UserData {
  name: string;
  photo_url: string;
  // Leadership Steps (Different from Foundation)
  leadership_steps?: {
    orientation: boolean; // Leadership 101
    shadowing: boolean; // Shadow a leader
    training: boolean; // Complete training module
    active_role: boolean; // Officially leading
  };
}

const LeadershipPath = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Confetti Control
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleResize = () =>
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Auth Check
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate("/login");
      else setUser(currentUser);
    });
    return () => unsubAuth();
  }, [navigate]);

  // 2. Fetch Data
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubDoc = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;

        // Initialize Leadership steps if missing
        if (!data.leadership_steps) {
          updateDoc(userRef, {
            leadership_steps: {
              orientation: false,
              shadowing: false,
              training: false,
              active_role: false,
            },
          });
        }
        setUserData(data);
      }
      setLoading(false);
    });
    return () => unsubDoc();
  }, [user]);

  // 3. Toggle Logic
  const toggleStep = async (stepKey: string, currentValue: boolean) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      [`leadership_steps.${stepKey}`]: !currentValue,
    });
  };

  // Calculate Progress
  const calculateProgress = () => {
    if (!userData?.leadership_steps) return 0;
    const steps = Object.values(userData.leadership_steps);
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  const progress = calculateProgress();
  const isComplete = progress === 100;

  // Confetti Timer
  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 7000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  if (loading)
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-blue-500">
        Loading Leadership Data...
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-20 px-4 relative overflow-x-hidden">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={true}
            numberOfPieces={300}
            colors={["#3B82F6", "#8B5CF6", "#FFFFFF"]}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* HEADER: Blue/Purple Theme for Leadership */}
        <div
          className={`flex flex-col md:flex-row items-center gap-6 mb-8 p-8 rounded-3xl border shadow-2xl transition-all duration-500 ${
            isComplete
              ? "bg-blue-900/20 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]"
              : "bg-brand-gray/50 border-white/5"
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-24 h-24 rounded-full border-4 p-1 transition-colors ${
              isComplete ? "border-blue-500" : "border-white/10"
            }`}
          >
            {userData?.photo_url ? (
              <img
                src={userData.photo_url}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-brand-gray flex items-center justify-center text-3xl font-bold text-white">
                {userData?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              {isComplete ? "LEADER STATUS ACHIEVED!" : "LEADERSHIP PATH"}
            </h1>
            <p className="text-brand-muted">
              {isComplete ? (
                <span className="text-blue-400 font-bold">
                  You are now ready to lead others.
                </span>
              ) : (
                <>Developing the skills to influence and serve.</>
              )}
            </p>
          </div>

          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-brand-gray"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={`transition-all duration-1000 ease-out ${
                  isComplete
                    ? "text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    : "text-blue-500"
                }`}
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
            <div className="absolute text-sm font-bold text-white">
              {progress}%
            </div>
          </div>
        </div>

        {/* LEADERSHIP MILESTONES */}
        <div className="grid gap-6">
          <h2 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-blue-500">
            CORE COMPETENCIES
          </h2>

          <StepCard
            title="Leadership Orientation"
            description="Understanding the core values and vision of a Youth Xtreme leader."
            isCompleted={userData?.leadership_steps?.orientation || false}
            onClick={() =>
              toggleStep(
                "orientation",
                userData?.leadership_steps?.orientation || false
              )
            }
            icon="🧭"
          />

          <StepCard
            title="Shadow a Leader"
            description="Observing a ministry leader in action during an event."
            isCompleted={userData?.leadership_steps?.shadowing || false}
            onClick={() =>
              toggleStep(
                "shadowing",
                userData?.leadership_steps?.shadowing || false
              )
            }
            icon="👥"
          />

          <StepCard
            title="Advanced Training"
            description="Completing the 'Servant Leadership' workshop module."
            isCompleted={userData?.leadership_steps?.training || false}
            onClick={() =>
              toggleStep(
                "training",
                userData?.leadership_steps?.training || false
              )
            }
            icon="📚"
          />

          <StepCard
            title="Active Role"
            description="Officially assigned a responsibility in a ministry team."
            isCompleted={userData?.leadership_steps?.active_role || false}
            onClick={() =>
              toggleStep(
                "active_role",
                userData?.leadership_steps?.active_role || false
              )
            }
            icon="🎖️"
          />
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/journey")}
            className="text-brand-muted hover:text-white text-sm font-bold transition-colors"
          >
            ← Back to Foundation Path
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component (Same as Journey but uses Blue/Purple styling if complete)
const StepCard = ({ title, description, isCompleted, onClick, icon }: any) => (
  <div
    onClick={onClick}
    className={`group cursor-pointer relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex items-center gap-6 ${
      isCompleted
        ? "bg-blue-500/10 border-blue-500"
        : "bg-brand-gray border-white/5 hover:border-white/20"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors ${
        isCompleted
          ? "bg-blue-500 text-white"
          : "bg-white/5 text-white grayscale group-hover:grayscale-0"
      }`}
    >
      {isCompleted ? "✓" : icon}
    </div>
    <div className="flex-1">
      <h3
        className={`font-bold text-lg mb-1 ${
          isCompleted ? "text-blue-400" : "text-white"
        }`}
      >
        {title}
      </h3>
      <p className="text-sm text-brand-muted">{description}</p>
    </div>
    <div
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        isCompleted ? "border-blue-500 bg-blue-500" : "border-brand-muted"
      }`}
    >
      {isCompleted && <div className="w-2 h-2 rounded-full bg-brand-dark" />}
    </div>
  </div>
);

export default LeadershipPath;
