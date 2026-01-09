import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* COLUMN 1: BRANDING */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-brand-accent animate-pulse"></span>
              <span className="text-xl font-display font-bold text-white tracking-wider uppercase">
                Youth Xtreme
              </span>
            </div>
            <p className="text-brand-muted text-sm leading-relaxed max-w-xs">
              Empowering the next generation to live with purpose, passion, and
              bold faith. Come sit with us.
            </p>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">
              Explore
            </h3>
            <ul className="space-y-3 text-sm text-brand-muted">
              <li>
                <Link
                  to="/events"
                  className="hover:text-brand-accent transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="hover:text-brand-accent transition-colors"
                >
                  Bible Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/media"
                  className="hover:text-brand-accent transition-colors"
                >
                  Media Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/connect"
                  className="hover:text-brand-accent transition-colors"
                >
                  I'm New Here
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: CONNECT (Facebook Ref) */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">
              Connect
            </h3>
            <p className="text-brand-muted text-sm mb-4">
              Follow the movement on social media for daily updates.
            </p>
            <a
              href="https://www.facebook.com/yxcdo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Youth Xtreme CDO
            </a>
          </div>
        </div>

        {/* BOTTOM BAR: COPYRIGHT */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-brand-muted">
            &copy; {currentYear} Youth Xtreme. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-muted">
              Built for the Kingdom 👑
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
