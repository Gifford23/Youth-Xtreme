import { useState } from "react";
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-40 bg-brand-dark/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <h1 className="font-display text-2xl font-bold tracking-wider text-white">
              YOUTH <span className="text-brand-accent">XTREME</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className="hover:text-brand-accent transition-colors px-4 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>

              <Dropdown title="Events">
                <Link
                  to="/events"
                  onClick={() => {
                    /* Close dropdown handled by Dropdown component */
                  }}
                  className="block px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Upcoming Events
                </Link>
                <Link
                  to="/calendar"
                  className="block px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Calendar View
                </Link>
              </Dropdown>

              <Dropdown title="Community">
                <Link
                  to="/prayer-wall"
                  className="block px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Prayer Wall
                </Link>
                <Link
                  to="/connect"
                  className="block px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Connect Card
                </Link>
                <Link
                  to="/media"
                  className="block px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Xtreme Moments
                </Link>
              </Dropdown>

              <Dropdown title="Resources">
                <Link
                  to="/resources"
                  className="block px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  All Resources
                </Link>
                <div className="border-t border-white/5 my-2"></div>
                <div className="px-4 py-2">
                  <p className="text-xs text-brand-muted uppercase tracking-wide">
                    Categories
                  </p>
                </div>
                <Link
                  to="/resources?category=devotionals"
                  className="block px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Devotionals
                </Link>
                <Link
                  to="/resources?category=sermons"
                  className="block px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sermon Notes
                </Link>
              </Dropdown>

              <Link
                to="/admin"
                className="hover:text-brand-accent transition-colors px-4 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="hidden md:block">
            <Link
              to="/connect"
              className="bg-brand-accent text-brand-dark font-bold px-5 py-2 rounded-full hover:bg-white transition-colors duration-300 inline-block"
            >
              Join Us
            </Link>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
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
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-brand-gray border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>

            {/* Mobile Events Section */}
            <div className="border-t border-white/5 pt-2 mt-2">
              <p className="px-3 text-xs text-brand-muted uppercase tracking-wide mb-2">
                Events
              </p>
              <Link
                to="/events"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium pl-6"
              >
                Upcoming Events
              </Link>
              <Link
                to="/calendar"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium pl-6"
              >
                Calendar View
              </Link>
            </div>

            {/* Mobile Community Section */}
            <div className="border-t border-white/5 pt-2 mt-2">
              <p className="px-3 text-xs text-brand-muted uppercase tracking-wide mb-2">
                Community
              </p>
              <Link
                to="/prayer-wall"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium pl-6"
              >
                Prayer Wall
              </Link>
              <Link
                to="/connect"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium pl-6"
              >
                Connect Card
              </Link>
              <Link
                to="/media"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium pl-6"
              >
                Xtreme Moments
              </Link>
            </div>

            {/* Mobile Resources Section */}
            <div className="border-t border-white/5 pt-2 mt-2">
              <p className="px-3 text-xs text-brand-muted uppercase tracking-wide mb-2">
                Resources
              </p>
              <Link
                to="/resources"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium pl-6"
              >
                All Resources
              </Link>
              <Link
                to="/resources?category=devotionals"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium pl-6"
              >
                Devotionals
              </Link>
              <Link
                to="/resources?category=sermons"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium pl-6"
              >
                Sermon Notes
              </Link>
            </div>

            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-brand-accent block px-3 py-2 rounded-md text-base font-medium border-t border-white/5 pt-2 mt-2"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
