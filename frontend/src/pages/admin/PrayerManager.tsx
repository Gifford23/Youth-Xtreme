import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface PrayerRequest {
  id: string;
  request: string;
  created_at: any;
  commit_count: number;
}

interface PraiseReport {
  id: string;
  author: string;
  testimony: string;
  created_at: any;
}

const PrayerManager = () => {
  const [activeTab, setActiveTab] = useState<"requests" | "praise">("requests");
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [praises, setPraises] = useState<PraiseReport[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data based on Tab
  useEffect(() => {
    setLoading(true);
    let q;
    
    if (activeTab === "requests") {
      q = query(collection(db, "prayer_requests"), orderBy("created_at", "desc"));
    } else {
      q = query(collection(db, "praise_reports"), orderBy("created_at", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      if (activeTab === "requests") {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PrayerRequest)));
      } else {
        setPraises(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PraiseReport)));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  // 2. Delete Action
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this post?")) return;
    
    const collectionName = activeTab === "requests" ? "prayer_requests" : "praise_reports";
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Prayer Wall</h1>
          <p className="text-brand-muted">Moderate requests and praise reports.</p>
        </div>

        {/* Tab Toggle */}
        <div className="bg-brand-dark border border-white/10 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "requests"
                ? "bg-brand-accent text-brand-dark shadow-lg"
                : "text-brand-muted hover:text-white"
            }`}
          >
            Requests
          </button>
          <button
            onClick={() => setActiveTab("praise")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "praise"
                ? "bg-green-500 text-white shadow-lg"
                : "text-brand-muted hover:text-white"
            }`}
          >
            Praise Reports
          </button>
        </div>
      </div>

      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-brand-muted">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-brand-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-white/10 w-24">Date</th>
                  <th className="p-4 font-bold border-b border-white/10">Content</th>
                  {activeTab === "requests" ? (
                    <th className="p-4 font-bold border-b border-white/10 text-center w-32">Prayers</th>
                  ) : (
                    <th className="p-4 font-bold border-b border-white/10 w-48">Author</th>
                  )}
                  <th className="p-4 font-bold border-b border-white/10 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(activeTab === "requests" ? requests : praises).map((item: any) => {
                  const dateStr = item.created_at?.toDate 
                    ? item.created_at.toDate().toLocaleDateString() 
                    : "Just now";

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-xs text-brand-muted align-top pt-5">
                        {dateStr}
                      </td>
                      
                      <td className="p-4 align-top">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                          {activeTab === "requests" ? item.request : item.testimony}
                        </p>
                      </td>

                      {activeTab === "requests" ? (
                        <td className="p-4 text-center align-top pt-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-accent/10 text-brand-accent text-xs font-bold border border-brand-accent/20">
                            🙏 {item.commit_count || 0}
                          </span>
                        </td>
                      ) : (
                        <td className="p-4 text-sm text-white align-top pt-5">
                          {item.author || "Anonymous"}
                        </td>
                      )}

                      <td className="p-4 text-right align-top pt-4">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-brand-muted hover:text-red-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
                          title="Delete Post"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {(activeTab === "requests" ? requests : praises).length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-brand-muted">
                      No posts found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerManager;