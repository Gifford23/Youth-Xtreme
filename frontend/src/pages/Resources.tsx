import { useState } from "react";
import { Link } from "react-router-dom";
import { resourcesData } from "../lib/resourcesData"; // ✅ Uses the shared data file

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-display font-bold text-white mb-6">
            Spiritual <span className="text-brand-accent">Library</span>
          </h1>
          <p className="text-brand-muted text-lg leading-relaxed">
            Dive deeper into the Word. Explore timeless stories, practical study
            guides, and devotionals designed to fuel your spiritual growth.
          </p>
        </div>

        {/* CONTROLS (Search & Filter) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all border ${
                  activeCategory === cat
                    ? "bg-brand-accent text-brand-dark border-brand-accent"
                    : "bg-transparent text-brand-muted border-white/10 hover:border-white hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full bg-brand-gray border border-white/10 rounded-full px-6 py-3 pl-12 text-white focus:border-brand-accent focus:outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-4 top-3.5"
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

        {/* RESOURCE GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => (
            <Link
              to={`/resources/${resource.id}`}
              key={resource.id}
              className="group bg-brand-gray border border-white/5 rounded-3xl overflow-hidden hover:border-brand-accent/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(204,255,0,0.1)] flex flex-col h-full"
            >
              {/* Image Container */}
              <div className="h-56 overflow-hidden relative">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-gray to-transparent opacity-80"></div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
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
                  <span className="text-white text-sm font-bold group-hover:translate-x-2 transition-transform">
                    Read Story →
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
      </div>
    </div>
  );
};

export default Resources;
