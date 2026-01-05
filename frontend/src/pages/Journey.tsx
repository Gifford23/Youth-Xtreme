import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Confetti from "react-confetti";

interface UserData {
  name: string;
  email: string;
  photo_url: string;
  role: string;
  steps?: {
    salvation: boolean;
    baptism: boolean;
    life_group: boolean;
    dream_team: boolean;
  };
}

const Journey = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Confetti Control
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [recycleConfetti, setRecycleConfetti] = useState(true); // Controls if confetti keeps spawning
  const [showConfetti, setShowConfetti] = useState(false); // Controls if component is rendered

  const detectSize = () => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    return () => window.removeEventListener("resize", detectSize);
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate("/login");
      else setUser(currentUser);
    });
    return () => unsubAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubDoc = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        if (!data.steps) {
          updateDoc(userRef, {
            steps: {
              salvation: false,
              baptism: false,
              life_group: false,
              dream_team: false,
            },
          });
        }
        setUserData(data);
      }
      setLoading(false);
    });
    return () => unsubDoc();
  }, [user]);

  const toggleStep = async (stepKey: string, currentValue: boolean) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { [`steps.${stepKey}`]: !currentValue });
  };

  const calculateProgress = () => {
    if (!userData?.steps) return 0;
    const steps = Object.values(userData.steps);
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  const progress = calculateProgress();
  const isComplete = progress === 100;

  // ✅ CONFETTI TIMER LOGIC
  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      setRecycleConfetti(true);

      // Stop generating NEW confetti after 7 seconds
      const stopTimer = setTimeout(() => {
        setRecycleConfetti(false);
      }, 7000);

      return () => clearTimeout(stopTimer);
    } else {
      setShowConfetti(false);
    }
  }, [isComplete]);

  if (loading)
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-accent">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-20 px-4 relative overflow-x-hidden">
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            recycle={recycleConfetti} // Stops raining after 7s, existing pieces fall naturally
            numberOfPieces={400}
            gravity={0.2}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* HEADER SECTION */}
        <div
          className={`flex flex-col md:flex-row items-center gap-6 mb-8 p-8 rounded-3xl border shadow-2xl transition-all duration-500 ${
            isComplete
              ? "bg-brand-accent/10 border-brand-accent shadow-[0_0_50px_rgba(204,255,0,0.3)]"
              : "bg-brand-gray/50 border-white/5"
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-24 h-24 rounded-full border-4 p-1 transition-colors ${
              isComplete ? "border-brand-accent" : "border-white/10"
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
              {isComplete ? "FOUNDATION COMPLETE!" : "MY JOURNEY"}
            </h1>
            <p className="text-brand-muted">
              {isComplete ? (
                <span className="text-brand-accent font-bold">
                  You are ready for the next level.
                </span>
              ) : (
                <>
                  Welcome back,{" "}
                  <span className="text-white font-bold">{userData?.name}</span>
                  . Keep moving forward!
                </>
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
                    ? "text-brand-accent drop-shadow-[0_0_10px_rgba(204,255,0,0.8)]"
                    : "text-brand-accent"
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

        {/* ✅ NEXT LEVEL: LEADERSHIP PATH (Only shows when 100%) */}
        {isComplete && (
          <div className="mb-12 animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-brand-dark rounded-[22px] p-8 md:p-10 relative overflow-hidden">
                {/* Background Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
                      <span>🔓</span> Unlocked
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">
                      LEADERSHIP PATH
                    </h2>
                    <p className="text-brand-muted max-w-md">
                      You have mastered the foundations. Now, learn how to
                      influence others and lead with purpose.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/journey/leadership")} // ✅ Update this line
                    className="..."
                  >
                    Enter Leadership Track
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
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GROWTH TRACK STEPS (Hidden or Dimmed if complete? I kept them visible so they can see what they achieved) */}
        <div
          className={`grid gap-6 transition-opacity duration-1000 ${
            isComplete
              ? "opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
              : ""
          }`}
        >
          <h2 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-brand-accent">
            FOUNDATION STEPS
          </h2>
          <StepCard
            title="Accepted Christ"
            description="The beginning of a new life. Making Jesus the Lord of your heart."
            isCompleted={userData?.steps?.salvation || false}
            onClick={() =>
              toggleStep("salvation", userData?.steps?.salvation || false)
            }
            icon="✝️"
          />
          <StepCard
            title="Water Baptism"
            description="Publicly declaring your faith and leaving the old life behind."
            isCompleted={userData?.steps?.baptism || false}
            onClick={() =>
              toggleStep("baptism", userData?.steps?.baptism || false)
            }
            icon="💧"
          />
          <StepCard
            title="Joined a Life Group"
            description="Doing life together. Finding community and accountability."
            isCompleted={userData?.steps?.life_group || false}
            onClick={() =>
              toggleStep("life_group", userData?.steps?.life_group || false)
            }
            icon="🤝"
          />
          <StepCard
            title="Joined Dream Team"
            description="Serving the house and discovering your purpose."
            isCompleted={userData?.steps?.dream_team || false}
            onClick={() =>
              toggleStep("dream_team", userData?.steps?.dream_team || false)
            }
            icon="🚀"
          />
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ title, description, isCompleted, onClick, icon }: any) => (
  <div
    onClick={onClick}
    className={`group cursor-pointer relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex items-center gap-6 ${
      isCompleted
        ? "bg-brand-accent/10 border-brand-accent"
        : "bg-brand-gray border-white/5 hover:border-white/20"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors ${
        isCompleted
          ? "bg-brand-accent text-brand-dark"
          : "bg-white/5 text-white grayscale group-hover:grayscale-0"
      }`}
    >
      {isCompleted ? "✓" : icon}
    </div>
    <div className="flex-1">
      <h3
        className={`font-bold text-lg mb-1 ${
          isCompleted ? "text-brand-accent" : "text-white"
        }`}
      >
        {title}
      </h3>
      <p className="text-sm text-brand-muted">{description}</p>
    </div>
    <div
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        isCompleted
          ? "border-brand-accent bg-brand-accent"
          : "border-brand-muted"
      }`}
    >
      {isCompleted && <div className="w-2 h-2 rounded-full bg-brand-dark" />}
    </div>
  </div>
);

export default Journey;
