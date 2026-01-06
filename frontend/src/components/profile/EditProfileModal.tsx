import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface EditProfileProps {
  user: any;
  userData: any;
  onClose: () => void;
}

const EditProfileModal = ({ user, userData, onClose }: EditProfileProps) => {
  const [name, setName] = useState(userData?.name || "");
  const [photoUrl, setPhotoUrl] = useState(userData?.photo_url || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name,
        photo_url: photoUrl,
        bio,
        phone,
      });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-brand-gray border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-muted hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 font-display">
          Edit Profile
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Photo URL */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Profile Picture URL
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-accent placeholder-white/20"
              placeholder="https://..."
            />
            <p className="text-[10px] text-brand-muted mt-1">
              Paste a direct link to an image (e.g., from Google Photos or
              Imgur).
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-accent"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Bio / Motto
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-accent h-24 resize-none"
              placeholder="Share your favorite verse or life motto..."
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-brand-muted uppercase mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-accent"
              placeholder="+63 9..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-brand-accent text-brand-dark font-bold text-sm hover:bg-white hover:scale-105 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
