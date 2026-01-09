import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. AUTH CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch extra user details (role, name) from Firestore
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      } else {
        navigate("/login"); // Redirect if not logged in
      }
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-accent">
        Loading Mission Control...
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-8 gap-4">
          <div>
            <span className="text-brand-accent font-bold uppercase tracking-widest text-xs">
              Mission Control
            </span>
            <h1 className="text-4xl font-display font-bold text-white mt-1">
              Welcome back, {userData?.name?.split(" ")[0] || "Soldier"}.
            </h1>
            <p className="text-brand-muted mt-2">
              Equip yourself for the week ahead.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-full border border-white/10 text-white text-sm hover:bg-white/5 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: TOOLS */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Tools</h3>

            {/* ✅ THE BUTTON TO YOUR EXISTING INVITE GENERATOR */}
            <div className="bg-brand-gray/50 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 hover:border-brand-accent/50 transition-colors">
              <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center text-4xl border border-white/10">
                🎟️
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Invite Generator
                </h2>
                <p className="text-brand-muted mb-6">
                  Create custom graphics to invite your friends to Friday Night
                  Live. Download and share to your story in seconds.
                </p>
                <Link
                  to="/invite"
                  className="inline-flex items-center gap-2 bg-brand-accent text-brand-dark font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors"
                >
                  Launch Tool <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* COMING SOON PLACEHOLDER */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 opacity-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg">🙏</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Prayer Wall</h3>
                  <p className="text-brand-muted text-sm">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PROFILE INFO */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Identity</h3>
            <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center text-xl font-bold text-brand-dark">
                  {userData?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-white font-bold">
                    {userData?.name || "Member"}
                  </p>
                  <p className="text-brand-accent text-xs uppercase tracking-wider">
                    {userData?.role || "Youth"}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-brand-accent/20">
                <p className="text-xs text-brand-accent/80 font-mono">
                  MEMBER ID: {user?.uid.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
