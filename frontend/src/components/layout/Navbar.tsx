import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import SproutIcon from "../../assets/sprout.png";
import Logo from "../../assets/Official-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (confirm("Sign out?")) {
      await signOut(auth);
      setIsOpen(false);
      navigate("/");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Calendar", path: "/calendar" },
    { name: "Prayer", path: "/prayer-wall" },
    { name: "Resources", path: "/resources" },
    { name: "Media", path: "/media" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-dark/95 backdrop-blur-md border-b border-brand-border transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
            {/* The Image Logo */}
            <img
              src={Logo}
              alt="Youth Xtreme"
              className="h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
            />

            <span className="font-display text-2xl font-bold text-brand-text tracking-wider hidden sm:block">
              Cagayan <span className="text-brand-accent">de Oro</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-bold transition-all ${
                    isActive(link.path)
                      ? "text-brand-accent bg-white/5"
                      : "text-brand-muted hover:text-brand-text hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Smart Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin ? (
                  <Link to="/admin">
                    <button className="text-brand-accent hover:text-white font-bold text-sm px-4 py-2 border border-brand-accent/30 rounded-lg hover:bg-brand-accent/10 transition-all">
                      Admin Dashboard
                    </button>
                  </Link>
                ) : (
                  // ✅ NEW: Just the Circle Logo (No Text)
                  <Link to="/journey" title="My Journey">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-brand-accent hover:bg-white/10 transition-all group">
                      <img
                        src={SproutIcon}
                        alt="Growth"
                        className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
                      />
                    </button>
                  </Link>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User"
                      className="w-8 h-8 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center text-xs font-bold text-brand-muted">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-bold text-brand-muted hover:text-red-400 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" title="Member Login">
                <button className="text-brand-muted hover:text-white p-2 rounded-full transition-colors hover:bg-white/5">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </Link>
            )}

            <Link to="/connect">
              <button className="bg-brand-accent text-brand-dark font-bold px-6 py-2.5 rounded-full hover:bg-brand-text hover:scale-105 transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                Join Us
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden gap-4 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-muted hover:text-brand-text p-2 rounded-md"
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden bg-brand-gray/95 backdrop-blur-xl border-b border-brand-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-bold ${
                  isActive(link.path)
                    ? "text-brand-accent bg-white/5"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="block w-full text-center text-brand-accent font-bold py-3 rounded-xl border border-brand-accent/20"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    // I kept text here for clarity on Mobile
                    <Link
                      to="/journey"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center text-white font-bold py-3 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center gap-3"
                    >
                      <img src={SproutIcon} alt="Growth" className="w-6 h-6" />
                      My Journey
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-center text-red-400 font-bold py-3 rounded-xl hover:bg-white/5"
                  >
                    Sign Out ({user.email})
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center text-brand-text font-bold py-3 rounded-xl bg-white/5"
                >
                  Member Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
