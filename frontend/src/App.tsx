import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";

import Navbar from "./components/events/Navbar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Admin from "./pages/Admin";
import Login from "./pages/Login"; // New Import
import EventDetails from "./pages/EventDetails";
import Resources from "./pages/Resources";
import ResourceDetails from "./pages/ResourceDetails";
import Calendar from "./pages/Calendar";
import PrayerWall from "./pages/PrayerWall";
import ConnectCard from "./pages/ConnectCard";
import Media from "./pages/Media";

// This component acts as a security guard
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    // Listen for login state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-brand-dark" />; // Empty black screen while checking

  if (!user) {
    return <Navigate to="/login" replace />; // Kick out if not logged in
  }

  return children; // Let them in if they are logged in
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-dark text-brand-text font-sans selection:bg-brand-accent selection:text-brand-dark">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetails />} />
            <Route path="/prayer-wall" element={<PrayerWall />} />
            <Route path="/connect" element={<ConnectCard />} />
            <Route path="/media" element={<Media />} />

            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
