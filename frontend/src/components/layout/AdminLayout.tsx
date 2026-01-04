import {
  useState,
  type ReactElement,
  type ReactNode,
  type SVGProps,
} from "react";
import { NavLink } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

type NavIcon = (props: SVGProps<SVGSVGElement>) => ReactElement;

const HomeIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V10.5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon: NavIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M19.4 15a8 8 0 00.1-1l2-1.1-2-3.5-2.2.5a7.7 7.7 0 00-1.7-1l-.3-2.3H10.7l-.3 2.3a7.7 7.7 0 00-1.7 1l-2.2-.5-2 3.5 2 1.1a8 8 0 00.1 1 8 8 0 00-.1 1l-2 1.1 2 3.5 2.2-.5a7.7 7.7 0 001.7 1l.3 2.3h4.6l.3-2.3a7.7 7.7 0 001.7-1l2.2.5 2-3.5-2-1.1a8 8 0 00-.1-1z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: Array<{ to: string; label: string; Icon: NavIcon }> = [
    { to: "/", label: "Home", Icon: HomeIcon },
    { to: "/events", label: "Events", Icon: CalendarIcon },
    { to: "/admin", label: "Admin", Icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text font-sans">
      <div className="flex min-h-screen">
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-brand-gray/80 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-black/40 transform transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold tracking-wider text-white">
                YOUTH <span className="text-brand-accent">XTREME</span>
              </h1>
              <button
                type="button"
                className="lg:hidden text-brand-muted hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-brand-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Admin Panel
            </div>
          </div>

          <div className="px-4 pt-5">
            <div className="px-3 text-[11px] uppercase tracking-wider text-brand-muted">
              Navigation
            </div>
            <nav className="mt-3 space-y-1">
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60 ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-brand-muted hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${
                          isActive ? "bg-brand-accent" : "bg-transparent"
                        }`}
                      />
                      <Icon
                        className={`h-5 w-5 transition-colors ${
                          isActive
                            ? "text-brand-accent"
                            : "text-brand-muted group-hover:text-white"
                        }`}
                      />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-brand-muted">
              <span>© 2026 Youth Xtreme</span>
              <span className="rounded-full bg-white/5 px-2 py-0.5">v1</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-brand-gray/40 backdrop-blur border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-white">
                Admin Dashboard
              </h2>
            </div>

            <div className="hidden sm:block text-xs text-brand-muted">
              Manage events and site content
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
