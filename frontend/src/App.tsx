import { useEffect, useState } from "react";
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
import Admin from "./pages/Admin"; // ✅ ADDED THIS MISSING IMPORT
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
//

// 1. Create a Layout for Public Pages (Navbar + Content)
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

// 2. Security Guard for Admin
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return children;
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
            <Route path="/connect" element={<ConnectCard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* Group B: Standalone Routes (No Navbar) */}
          <Route path="/login" element={<Login />} />

          {/* Group C: Admin Routes */}

          {/* 1. Main Dashboard Home */}
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

          {/* 2. Members Management Page */}
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

          {/* 3. Media Manager Page */}
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

          {/* 4. Connect Cards Page */}
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

          {/* 5. Calendar Manager Page */}
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

          {/* 6. RSVP Manager Page (✅ NEW ROUTE) */}
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

          {/* 7. Prayer Manager Page */}
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
