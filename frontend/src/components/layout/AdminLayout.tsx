import {
  useState,
  type ReactElement,
  type ReactNode,
  type SVGProps,
} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import ThemeToggle from "../common/ThemeToggle";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Home", Icon: HomeIcon },
    { to: "/events", label: "Events", Icon: CalendarIcon },
    { to: "/admin/members", label: "Members", Icon: UsersIcon }, // ✅ Added Members Here
    { to: "/admin", label: "Settings", Icon: SettingsIcon },
  ];

  // ✅ LOGOUT FUNCTION
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await signOut(auth);
        navigate("/login");
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text font-sans selection:bg-brand-accent selection:text-brand-dark">
      <div className="flex min-h-screen">
        {/* Mobile Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity lg:hidden ${
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-gray/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* 1. Sidebar Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold tracking-wider text-white">
              YOUTH <span className="text-brand-accent">XTREME</span>
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-brand-muted hover:text-white transition-colors"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          {/* 2. Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
            <div className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-muted mb-4">
              Main Menu
            </div>

            <nav className="space-y-1">
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-brand-accent text-brand-dark shadow-lg shadow-brand-accent/20"
                        : "text-brand-muted hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* ✅ LOGOUT BUTTON */}
            <div className="mt-auto pt-8">
              <button
                onClick={handleLogout}
                className="w-full group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
              >
                <LogoutIcon className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* 3. Sidebar Footer (Copyright) */}
          <div className="p-6 border-t border-white/5 bg-black/20">
            <div className="flex items-center justify-between text-xs text-brand-muted font-medium">
              <span>© 2026 Youth Xtreme</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-md text-white/50">
                v1.0
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 bg-brand-gray/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-white/10 text-white hover:bg-white/5"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-white tracking-wide font-display">
                Admin Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden sm:block text-xs font-medium text-brand-muted bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                Authorized Personnel Only
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 lg:p-8 overflow-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

// --- Icons ---

type NavIcon = (props: SVGProps<SVGSVGElement>) => ReactElement;

const HomeIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ✅ NEW: Users Icon for the Members Link
const UsersIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SettingsIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MenuIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LogoutIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default AdminLayout;