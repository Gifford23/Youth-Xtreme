import { useState, useEffect, useRef } from "react";
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // Dropdown state
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === "admin");
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    ...(user ? [{ name: "Prayer", path: "/prayer-wall" }] : []),
    { name: "Resources", path: "/resources" },
    { name: "Media", path: "/media" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-dark/95 backdrop-blur-md border-b border-brand-border transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
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

          {/* RIGHT SIDE: Profile Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* 1. SPROUT ICON (Stuck on Navbar) - Links to My Journey */}
                {!isAdmin && (
                  <Link
                    to="/journey"
                    title="My Journey"
                    className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all group ${
                      isActive("/journey")
                        ? "bg-brand-accent/20 border-brand-accent shadow-[0_0_10px_rgba(204,255,0,0.4)]"
                        : "border-white/20 hover:border-brand-accent hover:bg-white/5"
                    }`}
                  >
                    <img
                      src={SproutIcon}
                      alt="Growth"
                      className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
                    />
                  </Link>
                )}

                {/* 2. PROFILE AVATAR & DROPDOWN */}
                <div
                  className="relative pl-4 border-l border-white/10"
                  ref={profileMenuRef}
                >
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-3 group focus:outline-none"
                  >
                    <div className="text-right hidden lg:block">
                      <p className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">
                        {isAdmin ? "Admin" : "Account"}
                      </p>
                      <p className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors max-w-[100px] truncate">
                        {user.displayName || "Member"}
                      </p>
                    </div>

                    <div
                      className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${
                        isProfileMenuOpen
                          ? "border-brand-accent"
                          : "border-white/20 group-hover:border-white/50"
                      }`}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="User"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-brand-gray flex items-center justify-center text-sm font-bold text-white">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* DROPDOWN MENU */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-brand-gray border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-fade-in-up origin-top-right">
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-xs text-brand-muted truncate">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-white truncate">
                          {user.email}
                        </p>
                      </div>

                      {isAdmin ? (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          My Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/login">
                <button className="text-brand-muted hover:text-white font-bold text-sm px-4 py-2 transition-colors">
                  Log In
                </button>
              </Link>
            )}

            {!user && (
              <Link to="/connect">
                <button className="bg-brand-accent text-brand-dark font-bold px-6 py-2.5 rounded-full hover:bg-brand-text hover:scale-105 transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                  Join Us
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden gap-4 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-muted hover:text-brand-text p-2 rounded-md"
            >
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
                  {!isAdmin && (
                    <Link
                      to="/journey"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center text-white font-bold py-3 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center gap-3"
                    >
                      <img src={SproutIcon} alt="Growth" className="w-5 h-5" />
                      My Journey
                    </Link>
                  )}

                  <Link
                    to={isAdmin ? "/admin" : "/dashboard"}
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center text-brand-accent font-bold py-3 rounded-xl border border-brand-accent/20"
                  >
                    {isAdmin ? "Admin Dashboard" : "Edit Profile"}
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="block w-full text-center text-red-400 font-bold py-3 rounded-xl hover:bg-white/5"
                  >
                    Sign Out
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
