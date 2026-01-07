import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [birthday, setBirthday] = useState("");

  // ✅ NEW: Volunteer State
  const [isVolunteer, setIsVolunteer] = useState(false);

  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        setBio(data.bio || "");
        setPhone(data.phone || "");
        setPhotoUrl(data.photo_url || "");
        setBirthday(data.birthday || "");

        // ✅ Load Volunteer Status
        setIsVolunteer(data.isVolunteer === true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name,
        bio,
        phone,
        photo_url: photoUrl,
        birthday,
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-4 relative">
      {/* QR CODE MODAL (THE PASS) */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-accent text-brand-dark font-bold px-6 py-2 rounded-full shadow-lg border-2 border-brand-dark uppercase tracking-widest text-sm">
              Official Pass
            </div>

            <h3 className="text-2xl font-display font-bold text-black mb-1 uppercase">
              {name || "Youth Member"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">{user.email}</p>

            <div className="bg-white p-2 rounded-xl border-4 border-black/10 inline-block mb-6">
              <QRCodeSVG
                value={user.email || ""}
                size={200}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>

            <p className="text-xs text-gray-400 mb-6">
              Show this code at the entrance to check in.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-gray border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-display">
              Changes Saved!
            </h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-xl hover:bg-white mt-4"
            >
              Excellent
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">
              My Profile
            </h1>
            <p className="text-brand-muted">
              Manage your personal details and public presence.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* 1. USHER BUTTON (Direct Link to Scanner) */}
            <Link
              to="/scanner"
              className="flex items-center gap-2 bg-brand-accent hover:bg-white border border-transparent text-brand-dark font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-105"
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
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="hidden sm:inline">Scan Tickets</span>
              <span className="sm:hidden">Scan</span>
            </Link>

            {/* 2. MEMBER BUTTON (Show Pass) */}
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all"
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
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              Show Pass
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Profile Card (Preview) */}
          <div className="lg:col-span-1">
            <div className="bg-brand-gray border border-white/5 rounded-3xl p-8 shadow-xl sticky top-32 text-center relative overflow-hidden">
              {/* ✅ NEW: VOLUNTEER BADGE (CONDITIONAL) */}
              {isVolunteer && (
                <div className="absolute top-0 right-0 p-4 animate-fade-in-down">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-yellow-500/20 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Official Volunteer
                  </div>
                </div>
              )}

              <div className="relative inline-block group mb-6 mt-4">
                <div
                  className={`w-32 h-32 rounded-full border-4 overflow-hidden bg-black mx-auto shadow-2xl transition-all ${
                    isVolunteer
                      ? "border-brand-accent shadow-[0_0_30px_rgba(204,255,0,0.3)]"
                      : "border-white/10"
                  }`}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                      {name.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">
                {name || "Your Name"}
              </h2>

              {/* ✅ UPDATED: Change Text based on Role */}
              <p
                className={`font-bold text-sm mb-6 uppercase tracking-wider ${
                  isVolunteer ? "text-brand-accent" : "text-brand-muted"
                }`}
              >
                {isVolunteer ? "Xtreme Team Volunteer" : "Youth Member"}
              </p>

              {bio && (
                <div className="bg-black/20 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-brand-muted italic leading-relaxed">
                    "{bio}"
                  </p>
                </div>
              )}

              <div className="border-t border-white/5 pt-6 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-brand-muted uppercase font-bold">
                    Joined
                  </p>
                  <p className="text-white font-bold">2024</p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase font-bold">
                    Status
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-white font-bold text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="space-y-8">
              {/* SECTION 1: Personal Info */}
              <div className="bg-brand-gray/50 border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent text-sm">
                    1
                  </span>
                  Personal Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:bg-black/40 transition-all"
                      placeholder="e.g. Juan Dela Cruz"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:bg-black/40 transition-all"
                      placeholder="+63 9..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                      Bio / Life Motto
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:bg-black/40 transition-all h-24 resize-none"
                      placeholder="Share a favorite verse or a brief intro..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Celebration */}
              <div className="bg-brand-gray/50 border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent text-sm">
                    2
                  </span>
                  Celebration
                </h3>

                <div className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                  <div className="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/5 shrink-0">
                    🎂
                  </div>

                  <div className="flex-1 w-full text-center sm:text-left">
                    <h4 className="text-lg font-bold text-white mb-1">
                      When is your birthday?
                    </h4>
                    <p className="text-xs text-brand-muted mb-4">
                      We want to celebrate God's goodness in your life!
                    </p>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Profile Image */}
              <div className="bg-brand-gray/50 border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent text-sm">
                    3
                  </span>
                  Profile Image
                </h3>

                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                    Image URL
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:bg-black/40 transition-all"
                        placeholder="https://..."
                      />
                      <svg
                        className="w-5 h-5 text-brand-muted absolute left-3 top-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-muted mt-2 ml-1">
                    Tip: Use a direct link from Google Photos, Imgur, or social
                    media.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-brand-accent text-brand-dark font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:scale-105 hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all duration-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
