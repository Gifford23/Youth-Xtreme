import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { AnimatePresence } from "framer-motion";

// --- COMPONENT IMPORTS ---
import Navbar from "./components/layout/Navbar";
import AdminLayout from "./components/layout/AdminLayout";
import Footer from "./components/layout/Footer";
import PageLoader from "./components/layout/PageLoader";
import ScrollToTop from "./components/utils/ScrollToTop";

// Public Pages
import Home from "./pages/Home";
import FaqPage from "./pages/FaqPage";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Calendar from "./pages/Calendar";
import Resources from "./pages/Resources";
import ResourceDetails from "./pages/ResourceDetails";
import PrayerWall from "./pages/PrayerWall";
import ConnectCard from "./pages/ConnectCard";
import Media from "./pages/Media";
import Journey from "./pages/Journey";
import LeadershipPath from "./pages/LeadershipPath";
import UserDashboard from "./pages/UserDashboard";
import InviteGenerator from "./pages/InviteGenerator";
import Dashboard from "./pages/Dashboard";

// Auth Pages
import Login from "./pages/Login";

// Admin Pages
import Admin from "./pages/Admin";
import Members from "./pages/admin/Member";
import MediaManager from "./pages/admin/MediaManager";
import ConnectCards from "./pages/admin/ConnectCards";
import CalendarManager from "./pages/admin/CalendarManager";
import RSVPManager from "./pages/admin/RSVPManager";
import PrayerManager from "./pages/admin/PrayerManager";
import ActivityLog from "./pages/admin/ActivityLog";
import TestimonialManager from "./pages/admin/TestimonialManager";
import ScannerPage from "./pages/Scanner";
import ManageReels from "./pages/admin/ManageReels";
import Analytics from "./pages/admin/Analytics";

// Assets
import LogoIcon from "./assets/logo-icon.png";

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

// --- LAYOUT WRAPPERS ---
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <FloatingMessenger />
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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

  return <>{children}</>;
};

// --- ROUTING LOGIC ---
const AnimatedRoutes = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ UPDATED LOGIC: Removed the wildcard check for admin
  useEffect(() => {
    // Only trigger loader on these EXACT paths:
    // 1. /login (Login page)
    // 2. /connect (Join Us page)
    // 3. /admin (Main Dashboard entry - triggers when logging in)
    const triggerPaths = ["/login", "/connect", "/admin"];

    // We removed 'location.pathname.startsWith("/admin")'
    // This ensures navigating to "/admin/members" does NOT show the loader.
    if (triggerPaths.includes(location.pathname)) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <PageLoader key="loader" />
      ) : (
        <Routes location={location} key={location.pathname}>
          {/* GROUP A: Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetails />} />
            <Route path="/prayer-wall" element={<PrayerWall />} />
            <Route path="/connect" element={<ConnectCard />} />
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <Media />
                </ProtectedRoute>
              }
            />
            <Route path="/journey" element={<Journey />} />
            <Route path="/journey/leadership" element={<LeadershipPath />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/invite" element={<InviteGenerator />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* GROUP B: Standalone Routes */}
          <Route path="/login" element={<Login />} />

          {/* GROUP C: Admin Routes */}
          <Route path="/admin/reels" element={<ManageReels />} />

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
          <Route
            path="/scanner"
            element={
              <ProtectedRoute>
                <ScannerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Analytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-dark text-brand-text font-sans selection:bg-brand-accent selection:text-brand-dark">
        <ScrollToTop />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
