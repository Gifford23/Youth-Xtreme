import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // ✅ NEW: Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);

      // Fetch user data
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        setBio(data.bio || "");
        setPhone(data.phone || "");
        setPhotoUrl(data.photo_url || "");
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
      });
      // ✅ Trigger the Success Modal
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
      {/* ✅ SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-gray border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
            {/* Success Icon */}
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
              Profile Updated!
            </h3>
            <p className="text-brand-muted mb-8">
              Your details have been successfully saved to your dashboard.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-xl hover:bg-white transition-all shadow-lg"
            >
              Okay, got it!
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          My Dashboard
        </h1>
        <p className="text-brand-muted mb-8">
          Manage your personal information and settings.
        </p>

        <div className="bg-brand-gray/50 border border-white/5 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Photo Preview */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden mb-4 bg-black relative group">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                    {name.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <p className="text-xs text-brand-muted">Profile Preview</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Your Name"
                />
              </div>

              {/* Phone */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="+63 9..."
                />
              </div>

              {/* Photo URL */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                  Photo URL
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="https://example.com/my-photo.jpg"
                />
                <p className="text-[10px] text-brand-muted mt-2">
                  Paste a link to your image (e.g. from Facebook, Imgur, or
                  Google).
                </p>
              </div>

              {/* Bio */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-brand-muted uppercase mb-2">
                  Bio / Motto
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent h-32 resize-none transition-colors"
                  placeholder="Share a favorite verse or a brief bio..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                className="bg-brand-accent text-brand-dark font-bold px-8 py-3 rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
