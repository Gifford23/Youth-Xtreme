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
  
  // ✅ NEW: Search State
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState<any | null>(null);

  // 1. Fetch Data
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

  // ✅ FILTER LOGIC
  const currentList = activeTab === "requests" ? requests : praises;
  
  const filteredList = currentList.filter((item: any) => {
    const term = search.toLowerCase();
    const content = activeTab === "requests" ? item.request : item.testimony;
    const author = activeTab === "praise" ? item.author : "";

    return (
      (content && content.toLowerCase().includes(term)) ||
      (author && author.toLowerCase().includes(term))
    );
  });

  // 2. Delete Action
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this post?")) return;
    
    const collectionName = activeTab === "requests" ? "prayer_requests" : "praise_reports";
    try {
      await deleteDoc(doc(db, collectionName, id));
      if (viewItem?.id === id) setViewItem(null); // Close modal if deleted
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Prayer Wall</h1>
          <p className="text-brand-muted">Moderate requests and praise reports.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* ✅ SEARCH INPUT */}
          <div className="relative">
            <input 
              type="text" 
              placeholder={activeTab === "requests" ? "Search requests..." : "Search reports..."} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 pl-10 text-white focus:outline-none focus:border-brand-accent w-full sm:w-64"
            />
            <svg className="w-4 h-4 text-brand-muted absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Tab Toggle */}
          <div className="bg-brand-dark border border-white/10 p-1 rounded-xl inline-flex">
            <button
              onClick={() => { setActiveTab("requests"); setSearch(""); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "requests"
                  ? "bg-brand-accent text-brand-dark shadow-lg"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Requests
            </button>
            <button
              onClick={() => { setActiveTab("praise"); setSearch(""); }}
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
      </div>

      <div className="bg-brand-gray/50 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-brand-muted">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-brand-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-white/10 w-32">Date</th>
                  <th className="p-4 font-bold border-b border-white/10">Content</th>
                  {activeTab === "requests" ? (
                    <th className="p-4 font-bold border-b border-white/10 text-center w-32">Prayers</th>
                  ) : (
                    <th className="p-4 font-bold border-b border-white/10 w-48">Author</th>
                  )}
                  <th className="p-4 font-bold border-b border-white/10 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* ✅ USE FILTERED LIST HERE */}
                {filteredList.map((item: any) => {
                  const dateStr = item.created_at?.toDate 
                    ? item.created_at.toDate().toLocaleDateString() 
                    : "Just now";

                  const content = activeTab === "requests" ? item.request : item.testimony;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-xs text-brand-muted align-top pt-5">
                        {dateStr}
                      </td>
                      
                      <td className="p-4 align-top">
                        <p className="text-white text-sm leading-relaxed line-clamp-2">
                          {content}
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
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewItem(item)}
                            className="text-brand-muted hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Read Full Text"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-brand-muted hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Delete Post"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-brand-muted">
                      {search ? `No results found for "${search}"` : "No posts found in this category."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* READ MODAL */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setViewItem(null)}>
          <div className="bg-brand-gray border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setViewItem(null)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${activeTab === 'requests' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-green-500/10 text-green-400'}`}>
                {activeTab === 'requests' ? 'Prayer Request' : 'Praise Report'}
              </span>
              <div className="mt-2 text-xs text-brand-muted">
                {viewItem.created_at?.toDate ? viewItem.created_at.toDate().toLocaleString() : "Unknown Date"}
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto mb-6 pr-2">
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                {activeTab === "requests" ? viewItem.request : viewItem.testimony}
              </p>
            </div>

            {activeTab === "praise" && (
              <div className="border-t border-white/5 pt-4 mt-4">
                <div className="text-xs text-brand-muted uppercase tracking-wider">Submitted By</div>
                <div className="text-white font-bold text-lg">{viewItem.author || "Anonymous"}</div>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="border-t border-white/5 pt-4 mt-4 flex items-center gap-2">
                <span className="text-2xl">🙏</span>
                <span className="text-white font-bold">{viewItem.commit_count || 0}</span>
                <span className="text-brand-muted text-sm">people praying</span>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleDelete(viewItem.id)}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerManager;