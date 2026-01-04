import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import AdminLayout from "../components/layout/AdminLayout";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"events" | "photos" | "content">(
    "events"
  );

  // Events state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    category: "Worship",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Photos state
  const [photos, setPhotos] = useState<any[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);

  // Content state
  const [resources, setResources] = useState<any[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "Devotional",
    verse: "",
    excerpt: "",
    content: "",
  });
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceMessage, setResourceMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!db) {
      setLoading(false);
      setMessage(
        "❌ Firebase is not configured. Add your VITE_FIREBASE_* values to .env.local and restart the dev server."
      );
      return;
    }

    try {
      const eventDate = new Date(formData.date);

      await addDoc(collection(db, "events"), {
        title: formData.title,
        location: formData.location,
        category: formData.category,
        image_url: formData.image_url,
        event_date: Timestamp.fromDate(eventDate),
        created_at: Timestamp.now(),
      });

      setMessage("✅ Event added successfully!");
      setFormData({
        title: "",
        date: "",
        location: "",
        category: "Worship",
        image_url: "",
      });
      setTimeout(() => navigate("/events"), 1200);
    } catch (error) {
      console.error("Error adding event: ", error);
      setMessage("❌ Failed to add event. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch photos
  useEffect(() => {
    if (!db || activeTab !== "photos") return;
    setPhotosLoading(true);
    const q = query(collection(db, "photos"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setPhotosLoading(false);
    });
    return unsub;
  }, [activeTab]);

  // Fetch resources
  useEffect(() => {
    if (!db || activeTab !== "content") return;
    setResourcesLoading(true);
    const q = query(collection(db, "resources"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setResources(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setResourcesLoading(false);
    });
    return unsub;
  }, [activeTab]);

  const handlePhotoApprove = async (id: string, approved: boolean) => {
    if (!db) return;
    await updateDoc(doc(db, "photos", id), {
      approved,
      updated_at: serverTimestamp(),
    });
  };

  const handleResourceEdit = (r: any) => {
    setEditingResource(r);
    setResourceForm({
      title: r.title ?? "",
      type: r.type ?? "Devotional",
      verse: r.verse ?? "",
      excerpt: r.excerpt ?? "",
      content: r.content ?? "",
    });
  };

  const handleResourceSave = async () => {
    if (!db || !editingResource) return;
    setResourceSaving(true);
    setResourceMessage("");
    try {
      await updateDoc(doc(db, "resources", editingResource.id), {
        ...resourceForm,
        updated_at: serverTimestamp(),
      });
      setResourceMessage("Resource updated.");
      setEditingResource(null);
      setResourceForm({
        title: "",
        type: "Devotional",
        verse: "",
        excerpt: "",
        content: "",
      });
    } catch (err) {
      setResourceMessage("Failed to update resource.");
    } finally {
      setResourceSaving(false);
    }
  };

  const handleResourceCreate = async () => {
    if (!db) return;
    setResourceSaving(true);
    setResourceMessage("");
    try {
      await addDoc(collection(db, "resources"), {
        ...resourceForm,
        created_at: serverTimestamp(),
      });
      setResourceMessage("Resource created.");
      setResourceForm({
        title: "",
        type: "Devotional",
        verse: "",
        excerpt: "",
        content: "",
      });
    } catch (err) {
      setResourceMessage("Failed to create resource.");
    } finally {
      setResourceSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl">
        <h1 className="text-3xl font-display font-bold text-white mb-8 uppercase">
          Admin <span className="text-brand-accent">Dashboard</span>
        </h1>

        {!isFirebaseConfigured && (
          <div className="mb-6 bg-brand-gray p-4 rounded-2xl border border-white/5">
            <p className="text-brand-muted text-sm">
              Firebase is not configured. Add your <code>VITE_FIREBASE_*</code>{" "}
              values to
              <code>.env.local</code> and restart the dev server.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 mb-8">
          {[
            { key: "events", label: "Events" },
            { key: "photos", label: "Photos" },
            { key: "content", label: "Content" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as any)}
              className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors ${
                activeTab === key
                  ? "bg-brand-accent text-brand-dark"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === "events" && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-brand-gray p-8 rounded-2xl border border-white/5 shadow-xl"
          >
            {message && (
              <div
                className={`p-4 rounded-lg text-sm font-medium ${
                  message.includes("✅")
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">
                Event Title
              </label>
              <input
                required
                type="text"
                className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                placeholder="e.g., Neon Night Worship"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-2">
                  Date & Time
                </label>
                <input
                  required
                  type="datetime-local"
                  className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-2">
                  Category
                </label>
                <select
                  className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Worship">Worship</option>
                  <option value="Fun Run">Fun Run</option>
                  <option value="Service">Service</option>
                  <option value="Meeting">Meeting</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">
                Location
              </label>
              <input
                required
                type="text"
                className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                placeholder="e.g., Main Sanctuary"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">
                Image URL
              </label>
              <input
                required
                type="url"
                className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                placeholder="Paste flyer image link here"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent text-brand-dark font-bold py-4 rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {loading ? "Processing..." : "Publish Event"}
            </button>
          </form>
        )}

        {/* Photos Tab */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide">
                Photo Approvals
              </h2>
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                + Upload Photos
              </button>
            </div>

            {photosLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
                <p className="mt-4 text-brand-muted">Loading photos...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="bg-brand-gray p-10 rounded-3xl border border-white/5 text-center">
                <h3 className="text-lg font-display font-bold text-white uppercase">
                  No photos yet
                </h3>
                <p className="mt-3 text-brand-muted">
                  Add documents to the <code>photos</code> collection in
                  Firestore.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-brand-gray overflow-hidden"
                  >
                    <div className="aspect-video bg-brand-dark/40 flex items-center justify-center text-brand-muted">
                      {p.url ? (
                        <img
                          src={p.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>No image</span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-brand-muted">
                          {p.created_at?.toDate?.()?.toLocaleDateString() ?? ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePhotoApprove(p.id, !p.approved)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                            p.approved
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/30"
                          }`}
                        >
                          {p.approved ? "Approved" : "Approve"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide">
                Manage Content
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingResource(null);
                  setResourceForm({
                    title: "",
                    type: "Devotional",
                    verse: "",
                    excerpt: "",
                    content: "",
                  });
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                + New Post
              </button>
            </div>

            {resourceMessage && (
              <div className="rounded-xl bg-white/5 p-4 text-sm text-white">
                {resourceMessage}
              </div>
            )}

            {resourcesLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
                <p className="mt-4 text-brand-muted">Loading content...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="bg-brand-gray p-10 rounded-3xl border border-white/5 text-center">
                <h3 className="text-lg font-display font-bold text-white uppercase">
                  No content yet
                </h3>
                <p className="mt-3 text-brand-muted">
                  Add documents to the <code>resources</code> collection in
                  Firestore.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-brand-gray overflow-hidden">
                <table className="w-full">
                  <thead className="bg-brand-dark/40 border-b border-white/5">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-brand-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {resources.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-5 py-4 text-white font-medium">
                          {r.title}
                        </td>
                        <td className="px-5 py-4 text-brand-muted">{r.type}</td>
                        <td className="px-5 py-4 text-brand-muted">
                          {r.created_at?.toDate?.()?.toLocaleDateString() ?? ""}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleResourceEdit(r)}
                            className="text-brand-accent hover:text-white text-sm font-semibold transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Content Edit Modal */}
        {(editingResource !== null || resourceForm.title) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-brand-gray rounded-3xl border border-white/10 p-8">
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight mb-6">
                {editingResource ? "Edit Resource" : "New Resource"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-2">
                    Title
                  </label>
                  <input
                    value={resourceForm.title}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-2">
                    Type
                  </label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, type: e.target.value })
                    }
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                  >
                    <option value="Devotional">Devotional</option>
                    <option value="Sermon Notes">Sermon Notes</option>
                    <option value="Small Group">Small Group</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-2">
                    Verse (optional)
                  </label>
                  <input
                    value={resourceForm.verse}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        verse: e.target.value,
                      })
                    }
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-2">
                    Excerpt (optional)
                  </label>
                  <textarea
                    value={resourceForm.excerpt}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        excerpt: e.target.value,
                      })
                    }
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-muted mb-2">
                    Content
                  </label>
                  <textarea
                    value={resourceForm.content}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        content: e.target.value,
                      })
                    }
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors min-h-[200px]"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingResource(null);
                    setResourceForm({
                      title: "",
                      type: "Devotional",
                      verse: "",
                      excerpt: "",
                      content: "",
                    });
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={
                    editingResource ? handleResourceSave : handleResourceCreate
                  }
                  disabled={resourceSaving}
                  className="rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold text-brand-dark hover:bg-white transition-colors disabled:opacity-60"
                >
                  {resourceSaving
                    ? "Saving..."
                    : editingResource
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Admin;
