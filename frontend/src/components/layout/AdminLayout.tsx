import {
  useState,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
  type SVGProps,
} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import ThemeToggle from "../common/ThemeToggle";

interface AdminLayoutProps {
  children: ReactNode;
}

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  read: boolean;
  link?: string;
  created_at: any;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // ✅ ADDED "REELS MANAGER" HERE
  const navItems = [
    { to: "/admin", label: "Dashboard", Icon: SettingsIcon },
    { to: "/", label: "Home", Icon: HomeIcon },
    { to: "/admin/members", label: "Members", Icon: UsersIcon },
    { to: "/admin/connect", label: "Connect Cards", Icon: ClipboardIcon },
    { to: "/admin/reels", label: "Reels Manager", Icon: VideoIcon }, // ✅ NEW
    { to: "/admin/media", label: "Media Feed", Icon: CameraIcon },
    { to: "/admin/testimonials", label: "Testimonials", Icon: ChatIcon },
    { to: "/admin/calendar", label: "Calendar Manager", Icon: DateIcon },
    { to: "/admin/rsvps", label: "Registrations", Icon: TicketIcon },
    { to: "/admin/prayer", label: "Prayer Wall", Icon: HandsIcon },
    { to: "/admin/analytics", label: "Analytics", Icon: ChartIcon },
    { to: "/admin/logs", label: "Activity Logs", Icon: ActivityIcon },
  ];

  // 1. Listen for Notifications
  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, "notifications"),
      orderBy("created_at", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 2. Handle Mark as Read & Redirect
  const handleMarkAsRead = async (id: string, link?: string) => {
    if (!db) return;
    try {
      const notifRef = doc(db, "notifications", id);
      await updateDoc(notifRef, { read: true });
      if (link) {
        navigate(link);
        setShowNotifications(false);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  // 3. Mark All Read
  const handleMarkAllRead = async () => {
    if (!db) return;
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      if (!n.read) {
        const ref = doc(db, "notifications", n.id);
        batch.update(ref, { read: true });
      }
    });
    await batch.commit();
  };

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

  // ✅ HELPER: Get Color based on Notification Type
  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-sky-500";
      case "alert":
        return "bg-red-500";
      default:
        return "bg-brand-accent";
    }
  };

  // ✅ HELPER: Custom Label Text
  const getNotificationLabel = (notif: Notification) => {
    if (notif.type === "warning") return "PRAYER REQUEST";
    if (notif.type === "success") {
      if (notif.message.toLowerCase().includes("praise"))
        return "PRAISE REPORT";
      return "REGISTERED";
    }
    if (notif.type === "alert") return "URGENT";
    return "INFO";
  };

  // ✅ HELPER: Render Icon based on Type
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "warning":
        return <HandsIcon className="w-5 h-5 text-sky-500" />;
      case "alert":
        return <AlertIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InfoIcon className="w-5 h-5 text-brand-accent" />;
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
          {/* Sidebar Header */}
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

          {/* Navigation Links */}
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

          <div className="p-6 border-t border-white/5 bg-black/20">
            <div className="flex items-center justify-between text-xs text-brand-muted font-medium">
              <span>© 2026 Youth Xtreme</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-md text-white/50">
                v1.1
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 relative">
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

            <div className="flex items-center gap-3">
              {/* NOTIFICATION BELL */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full text-brand-muted hover:text-white hover:bg-white/10 transition-colors relative"
                >
                  <BellIcon className="w-6 h-6" />

                  {/* NUMBER BADGE */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-brand-dark animate-bounce-in shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-brand-gray border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in origin-top-right">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/20">
                      <h3 className="text-sm font-bold text-white">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-brand-accent hover:underline uppercase font-bold tracking-wider"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-brand-muted text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() =>
                                handleMarkAsRead(notif.id, notif.link)
                              }
                              className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-3 ${
                                !notif.read ? "bg-white/5" : ""
                              }`}
                            >
                              {/* STATUS ICON */}
                              <div className="mt-0.5 flex-shrink-0 bg-white/5 p-1.5 rounded-full border border-white/5">
                                {renderNotificationIcon(notif.type)}
                              </div>

                              <div className="flex-1">
                                <p
                                  className={`text-sm leading-tight ${
                                    !notif.read
                                      ? "text-white font-bold"
                                      : "text-brand-muted"
                                  }`}
                                >
                                  {notif.message}
                                </p>
                                {/* CUSTOM LABELS & COLORS */}
                                <p className="text-[10px] text-brand-muted mt-1.5 uppercase tracking-wide flex items-center gap-2">
                                  {!notif.read && (
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                                        notif.type === "warning"
                                          ? "bg-sky-500/20 text-sky-400"
                                          : notif.type === "success"
                                          ? "bg-green-500/20 text-green-500"
                                          : notif.type === "alert"
                                          ? "bg-red-500/20 text-red-500"
                                          : "bg-brand-accent/20 text-brand-accent"
                                      }`}
                                    >
                                      {getNotificationLabel(notif)}
                                    </span>
                                  )}
                                  {notif.created_at?.toDate
                                    ? notif.created_at.toDate().toLocaleString()
                                    : "Just now"}
                                </p>
                              </div>

                              {/* Unread Dot */}
                              {!notif.read && (
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <ThemeToggle />

              <div className="hidden sm:block text-xs font-medium text-brand-muted bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                Admin Authorized Only
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

// ✅ NEW VIDEO ICON FOR REELS
const VideoIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CheckCircleIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const WarningIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const InfoIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AlertIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const BellIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const HomeIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const ChatIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const CalendarIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const UsersIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const CameraIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const SettingsIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const MenuIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const LogoutIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const ClipboardIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
);

const DateIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const TicketIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </svg>
);

const HandsIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
    />
  </svg>
);

const ActivityIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ChartIcon: NavIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

export default AdminLayout;
