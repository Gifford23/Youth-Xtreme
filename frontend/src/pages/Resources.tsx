import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resourcesData } from "../lib/resourcesData";

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // ✅ Hook for navigation

  // Filter Logic
  const filteredResources = resourcesData.filter((resource) => {
    const matchesCategory =
      activeCategory === "All" || resource.category === activeCategory;
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "Bible Stories", "Study Guides", "Devotionals"];

  // ✅ FEATURE: SURPRISE ME LOGIC
  const handleSurpriseMe = () => {
    if (resourcesData.length === 0) return;

    // Pick a random index
    const randomIndex = Math.floor(Math.random() * resourcesData.length);
    const randomResource = resourcesData[randomIndex];

    // Navigate to that resource
    navigate(`/resources/${randomResource.id}`);
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
            Spiritual <span className="text-brand-accent">Library</span>
          </h1>
          <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Dive deeper into the Word. Explore timeless stories, practical study
            guides, and devotionals designed to fuel your spiritual growth.
          </p>
        </div>

        {/* CONTROLS (Search & Filter) */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center order-2 xl:order-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all border ${
                  activeCategory === cat
                    ? "bg-brand-accent text-brand-dark border-brand-accent shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                    : "bg-transparent text-brand-muted border-white/10 hover:border-white hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Surprise Me */}
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto order-1 xl:order-2">
            {/* ✅ NEW: SURPRISE ME BUTTON */}
            <button
              onClick={handleSurpriseMe}
              className="group px-6 py-3 rounded-full bg-gradient-to-r from-brand-accent to-yellow-400 text-brand-dark font-bold text-sm uppercase tracking-wider hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span className="text-lg group-hover:rotate-12 transition-transform">
                🎲
              </span>
              Surprise Me
            </button>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72 group">
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full bg-brand-gray border border-white/10 rounded-full px-6 py-3 pl-12 text-white focus:border-brand-accent focus:outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-500 absolute left-4 top-3.5 group-focus-within:text-brand-accent transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* RESOURCE GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {filteredResources.map((resource) => (
            <Link
              to={`/resources/${resource.id}`}
              key={resource.id}
              className="group bg-brand-gray border border-white/5 rounded-3xl overflow-hidden hover:border-brand-accent/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col h-full"
            >
              {/* Image Container */}
              <div className="h-56 overflow-hidden relative">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-gray via-transparent to-transparent opacity-90"></div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {resource.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase mb-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {resource.scripture}
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight group-hover:text-brand-accent transition-colors">
                    {resource.title}
                  </h3>
                </div>

                <p className="text-brand-muted text-sm leading-relaxed mb-6 line-clamp-3">
                  {resource.summary}
                </p>

                <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {resource.readTime}
                  </span>
                  <span className="text-white text-sm font-bold group-hover:translate-x-2 transition-transform flex items-center gap-1">
                    Read Story <span className="text-brand-accent">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              📚
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No resources found
            </h3>
            <p className="text-brand-muted">
              Try adjusting your search or category filter.
            </p>
          </div>
        )}

        {/* EXTERNAL TOOLS */}
        <div className="border-t border-white/10 pt-20">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Trusted Study Tools
              </h2>
              <p className="text-brand-muted">
                External resources we recommend for deeper theology.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* The Bible Project */}
            <a
              href="https://bibleproject.com/"
              target="_blank"
              rel="noreferrer"
              className="group relative h-64 rounded-3xl overflow-hidden border border-white/10 hover:border-brand-accent/50 transition-all shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40 z-10"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2573&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>

              <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white text-black font-bold px-3 py-1 rounded text-xs uppercase tracking-widest">
                    Watch
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-brand-accent transition-colors">
                    The Bible Project
                  </h3>
                </div>
                <p className="text-gray-300 text-sm mb-4 max-w-md">
                  Experience the Bible as a unified story that leads to Jesus
                  through beautiful animated videos.
                </p>
                <span className="inline-flex items-center gap-2 text-white font-bold text-sm border-b border-brand-accent pb-0.5">
                  Visit Website
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </div>
            </a>

            {/* GotQuestions */}
            <a
              href="https://www.gotquestions.org/"
              target="_blank"
              rel="noreferrer"
              className="group relative h-64 rounded-3xl overflow-hidden border border-white/10 hover:border-blue-400/50 transition-all shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40 z-10"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>

              <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded text-xs uppercase tracking-widest">
                    Ask
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    GotQuestions.org
                  </h3>
                </div>
                <p className="text-gray-300 text-sm mb-4 max-w-md">
                  Have a tough question? Find biblical, theological, and
                  practical answers instantly.
                </p>
                <span className="inline-flex items-center gap-2 text-white font-bold text-sm border-b border-blue-400 pb-0.5">
                  Search Answers
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </div>
            </a>
          </div>

          {/* CREDITS */}
          <div className="mt-12 border-t border-white/5 pt-8 text-center md:text-left">
            <p className="text-xs text-brand-muted/50 uppercase tracking-widest font-bold mb-2">
              Resource Credits & Disclaimer
            </p>
            <p className="text-xs text-brand-muted max-w-3xl leading-relaxed mx-auto md:mx-0">
              "The Bible Project" and "GotQuestions" are independent
              organizations. Youth Xtreme is not affiliated with these
              ministries but recommends them as trusted tools for spiritual
              growth. Content summaries above are original to Youth Xtreme.
              Scripture references are taken from the Holy Bible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
