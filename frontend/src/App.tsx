import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom"; // Added Outlet import
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";

// Components
import Navbar from "./components/layout/Navbar"; // Note: Ideally move this to components/layout/Navbar.tsx later
import Home from "./pages/Home";
import Events from "./pages/Events";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import EventDetails from "./pages/EventDetails";
import Resources from "./pages/Resources";
import ResourceDetails from "./pages/ResourceDetails";
import Calendar from "./pages/Calendar";
import PrayerWall from "./pages/PrayerWall";
import ConnectCard from "./pages/ConnectCard";
import Media from "./pages/Media";

// 1. Create a Layout for Public Pages (Navbar + Content)
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {/* This represents the child route (Home, Events, etc.) */}
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
          </Route>

          {/* Group B: Standalone Routes (No Navbar) */}
          <Route path="/login" element={<Login />} />

          {/* Group C: Admin Route (No Navbar, uses AdminLayout) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
