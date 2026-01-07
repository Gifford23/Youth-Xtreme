import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface LogEntry {
  id: string;
  action: string;
  details: string;
  type: "info" | "warning" | "danger";
  performed_by: string;
  timestamp: any;
}

const ActivityLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch last 50 logs
    const q = query(
      collection(db, "activity_logs"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LogEntry[];
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper for icons based on type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "danger":
        return "🔴";
      case "warning":
        return "🟠";
      default:
        return "🔵";
    }
  };

  // Helper for formatting date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    return timestamp.toDate().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          Activity <span className="text-brand-accent">Log</span>
        </h1>
        <p className="text-brand-muted">
          Track administrative actions and system events.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-brand-gray border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/5 text-brand-muted text-xs uppercase tracking-wider">
                <th className="p-4 w-10"></th>
                <th className="p-4">Action</th>
                <th className="p-4">User</th>
                <th className="p-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-brand-muted">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-brand-muted">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-center">{getTypeIcon(log.type)}</td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">
                        {log.action}
                      </div>
                      <div className="text-xs text-brand-muted mt-0.5">
                        {log.details}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-white/10 text-white text-xs px-2 py-1 rounded font-bold">
                        {log.performed_by}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-brand-muted font-mono">
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
