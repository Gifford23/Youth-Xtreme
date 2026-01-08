import React, { useEffect, useState } from "react"; // ✅ Added React import
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";

// Components
import Navbar from "./components/layout/Navbar";
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import EventDetails from "./pages/EventDetails";
import Resources from "./pages/Resources";
import ResourceDetails from "./pages/ResourceDetails";
import Calendar from "./pages/Calendar";
import PrayerWall from "./pages/PrayerWall";
import ConnectCard from "./pages/ConnectCard";
import Media from "./pages/Media";
import Journey from "./pages/Journey";
import Members from "./pages/admin/Member";
import LeadershipPath from "./pages/LeadershipPath";
import MediaManager from "./pages/admin/MediaManager";
import ConnectCards from "./pages/admin/ConnectCards";
import CalendarManager from "./pages/admin/CalendarManager";
import RSVPManager from "./pages/admin/RSVPManager";
import PrayerManager from "./pages/admin/PrayerManager";
import UserDashboard from "./pages/UserDashboard";
import LogoIcon from "./assets/logo-icon.png";
import ScannerPage from "./pages/Scanner";
import ActivityLog from "./pages/admin/ActivityLog";
import TestimonialManager from "./pages/admin/TestimonialManager";

// --- FLOATING MESSENGER COMPONENT ---
const FloatingMessenger = () => (
  <a
    href="https://m.me/yxcdo"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-brand-dark border-2 border-brand-accent shadow-[0_4px_20px_rgba(204,255,0,0.4)] hover:scale-110 hover:shadow-[0_6px_25px_rgba(204,255,0,0.6)] transition-all duration-300 group"
    title="Connect with us on Messenger"
  >
    <img
      src={LogoIcon}
      alt="Chat with us"
      className="w-full h-full object-cover rounded-full"
    />
    <span className="absolute right-full mr-4 bg-white text-black text-xs font-bold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-all duration-300 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
      Connect with us
    </span>
  </a>
);

// 1. Public Layout
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <FloatingMessenger />
    </>
  );
};

// 2. Protected Admin Route
// ✅ FIX: Changed JSX.Element to React.ReactNode
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FIX: Removed '!auth' check to satisfy strict type checking if auth is guaranteed
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-brand-dark" />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // Wrap children in fragment
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-dark text-brand-text font-sans selection:bg-brand-accent selection:text-brand-dark">
        <Routes>
          {/* Group A: Public Routes (With Navbar) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetails />} />
            <Route path="/prayer-wall" element={<PrayerWall />} />
            <Route path="/connect" element={<ConnectCard />} />
            <Route path="/media" element={<Media />} />
            <Route path="/journey" element={<Journey />} />
            <Route path="/journey/leadership" element={<LeadershipPath />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* Group B: Standalone Routes (No Navbar) */}
          <Route path="/login" element={<Login />} />

          {/* Group C: Admin Routes (Protected) */}

          {/* 1. Main Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 2. Members */}
          <Route
            path="/admin/members"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Members />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 3. Media Manager */}
          <Route
            path="/admin/media"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <MediaManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 4. Connect Cards */}
          <Route
            path="/admin/connect"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ConnectCards />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 5. Calendar Manager */}
          <Route
            path="/admin/calendar"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CalendarManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 6. RSVP Manager */}
          <Route
            path="/admin/rsvps"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <RSVPManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 7. Prayer Manager */}
          <Route
            path="/admin/prayer"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PrayerManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 8. Activity Logs */}
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ActivityLog />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* 9. TESTIMONIAL MANAGER */}
          <Route
            path="/admin/testimonials"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <TestimonialManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Scanner Route */}
          <Route
            path="/scanner"
            element={
              <ProtectedRoute>
                <ScannerPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
