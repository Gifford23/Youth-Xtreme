import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface UserData {
  name: string;
  email: string;
  photo_url: string;
  role: string;
  // Growth Track Data
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

  // 1. Listen for Auth State
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login"); // Kick out if not logged in
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubAuth();
  }, [navigate]);

  // 2. Fetch & Listen to User Data (Real-time)
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubDoc = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;

        // Initialize steps if they don't exist yet
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

  // 3. Handle Toggles (Updates Database)
  const toggleStep = async (stepKey: string, currentValue: boolean) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    // Optimistic UI update (optional, but Firestore is fast enough)
    await updateDoc(userRef, {
      [`steps.${stepKey}`]: !currentValue,
    });
  };

  // Calculate Progress
  const calculateProgress = () => {
    if (!userData?.steps) return 0;
    const steps = Object.values(userData.steps);
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-accent">
        Loading your journey...
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-brand-gray/50 p-8 rounded-3xl border border-white/5 shadow-2xl animate-fade-in-up">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-2 border-brand-accent p-1">
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

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              MY <span className="text-brand-accent">JOURNEY</span>
            </h1>
            <p className="text-brand-muted">
              Welcome back,{" "}
              <span className="text-white font-bold">{userData?.name}</span>.
              Keep moving forward!
            </p>
          </div>

          {/* Progress Circle */}
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
                className="text-brand-accent transition-all duration-1000 ease-out"
                strokeDasharray={`${calculateProgress()}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
            <div className="absolute text-sm font-bold text-white">
              {calculateProgress()}%
            </div>
          </div>
        </div>

        {/* GROWTH TRACK STEPS */}
        <div className="grid gap-6">
          <h2 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-brand-accent">
            SPIRITUAL MILESTONES
          </h2>

          {/* Step 1: Salvation */}
          <StepCard
            title="Accepted Christ"
            description="The beginning of a new life. Making Jesus the Lord of your heart."
            isCompleted={userData?.steps?.salvation || false}
            onClick={() =>
              toggleStep("salvation", userData?.steps?.salvation || false)
            }
            icon="✝️"
          />

          {/* Step 2: Water Baptism */}
          <StepCard
            title="Water Baptism"
            description="Publicly declaring your faith and leaving the old life behind."
            isCompleted={userData?.steps?.baptism || false}
            onClick={() =>
              toggleStep("baptism", userData?.steps?.baptism || false)
            }
            icon="💧"
          />

          {/* Step 3: Life Group */}
          <StepCard
            title="Joined a Life Group"
            description="Doing life together. Finding community and accountability."
            isCompleted={userData?.steps?.life_group || false}
            onClick={() =>
              toggleStep("life_group", userData?.steps?.life_group || false)
            }
            icon="🤝"
          />

          {/* Step 4: Dream Team */}
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

// Helper Component for the Cards
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

    {/* Checkbox Visual */}
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
