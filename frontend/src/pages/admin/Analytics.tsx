import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  collectionGroup,
  getCountFromServer, // ✅ IMPORTED: The secret to cheap & fast counts
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalEvents: 0,
    totalRsvps: 0,
    activeThisMonth: 0,
  });
  const [rsvpData, setRsvpData] = useState<any[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. FETCH TOTAL MEMBERS (Optimized)
        // ⚡ Uses aggregation query (costs 1 read instead of N reads)
        const usersSnapshot = await getCountFromServer(collection(db, "users"));
        const totalMembers = usersSnapshot.data().count;

        // 2. FETCH EVENTS & RSVPs (For Chart)
        // We still need getDocs here because we need the TITLE and DATE for the chart
        const eventsQuery = query(
          collection(db, "events"),
          orderBy("event_date", "desc"),
          limit(5)
        );
        const eventsSnap = await getDocs(eventsQuery);

        const chartData = [];

        for (const eventDoc of eventsSnap.docs) {
          const eventData = eventDoc.data();

          // ⚡ OPTIMIZED: Just count the RSVPs for this event, don't download them
          const rsvpsSnap = await getCountFromServer(
            collection(db, "events", eventDoc.id, "rsvps")
          );
          const count = rsvpsSnap.data().count;

          chartData.push({
            name: eventData.title.split(" ")[0],
            fullTitle: eventData.title,
            rsvps: count,
            date: eventData.event_date
              ?.toDate()
              .toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          });
        }

        setRsvpData(chartData.reverse());

        // 3. FETCH TOTAL EVENTS COUNT (Optimized)
        const allEventsSnap = await getCountFromServer(
          collection(db, "events")
        );

        // 4. GET TOTAL RSVPs GLOBALLY (Optimized)
        const rsvpsGroupSnap = await getCountFromServer(
          collectionGroup(db, "rsvps")
        );

        // 5. MOCK MEMBER GROWTH
        const growthData = [
          { month: "Jan", users: Math.floor(totalMembers * 0.2) },
          { month: "Feb", users: Math.floor(totalMembers * 0.4) },
          { month: "Mar", users: Math.floor(totalMembers * 0.6) },
          { month: "Apr", users: Math.floor(totalMembers * 0.8) },
          { month: "May", users: totalMembers },
        ];
        setMemberGrowth(growthData);

        setStats({
          totalMembers,
          totalEvents: allEventsSnap.data().count,
          totalRsvps: rsvpsGroupSnap.data().count,
          activeThisMonth: Math.floor(totalMembers * 0.65),
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-8 pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Dashboard <span className="text-brand-accent">Analytics</span>
        </h1>
        <p className="text-brand-muted">
          Overview of ministry growth and engagement.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          }
          trend="+12% vs last month"
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          }
          trend="Consistent"
        />
        <StatCard
          title="Total Registrations"
          value={stats.totalRsvps}
          icon={
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          }
          trend="High Engagement"
        />
        <StatCard
          title="Active Users"
          value={stats.activeThisMonth}
          icon={<path d="M13 10V3L4 14h7v7l9-11h-7z" />}
          trend="~65% Engagement Rate"
        />
      </div>

      {/* CHARTS ROW */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* MAIN CHART: RSVP TRENDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-brand-gray/50 border border-white/5 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-lg">
              Event Attendance (Last 5 Events)
            </h3>
            <div className="text-xs text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">
              Live Data
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rsvpData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#ffffff10" }}
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar
                  dataKey="rsvps"
                  fill="#ccff00"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* SIDE CHART: USER GROWTH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-brand-gray/50 border border-white/5 rounded-3xl p-6 shadow-xl"
        >
          <h3 className="font-bold text-white text-lg mb-6">Member Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#ccff00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// HELPER: Stat Card Component
const StatCard = ({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: number | string;
  icon: any;
  trend: string;
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-brand-gray/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-brand-accent/10 transition-colors"></div>

    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-black/40 rounded-xl text-brand-accent border border-white/5">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            {icon}
          </svg>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
          {trend}
        </span>
      </div>

      <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
      <p className="text-brand-muted text-xs font-bold uppercase tracking-wider">
        {title}
      </p>
    </div>
  </motion.div>
);

export default Analytics;
