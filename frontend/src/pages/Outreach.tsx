import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- DATA: INSPIRING & BIBLICAL CONTENT ---
const outreachTabs = [
  {
    id: "campus",
    number: "01",
    label: "Campus Invasion",
    title: "Your School is Your Mission Field",
    description:
      "You aren't just a student; you are a missionary disguised as one. We believe God placed you in your hallway for such a time as this. We are raising up bold students who aren't ashamed of the Gospel—students who pray for their teachers, love their classmates, and spark revival right where they study.",
    image:
      "https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/474028344_925661909675361_7778809332990925993_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=Lk5zjbRUeQYQ7kNvwHUVegr&_nc_oc=AdkwaaTlx3LLK4KkgTQzj9fKPj7NTi3q0A4eJtTUypkWDoEvr8NqCmq13ADgYn3K8wg&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=Q3l6PEBT6WE7rLgXYqq5aA&oh=00_AfrbrJfk1p409OIeDGp4JIagduvYgBQvfqXqeDHRTYxDcw&oe=69692E25",
    initiatives: [
      "Lunch Break Life Groups",
      "University Prayer Walks",
      "Student Leader Training",
      "Campus Tours",
    ],
  },
  {
    id: "community",
    number: "02",
    label: "Community Love",
    title: "The Hands & Feet of Jesus",
    description:
      "Jesus didn't stay in the temple; He went to the outcasts. We follow His lead. Serving our city isn't just a 'good deed'—it is an act of worship. When we feed the hungry and clothe the poor, we are serving Christ Himself. Let's make His love tangible in Cagayan de Oro.",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
    initiatives: [
      "Monthly Feeding Programs",
      "Barangay Clean-up Drives",
      "Relief Operations",
      "Kids Ministry",
    ],
  },
  {
    id: "missions",
    number: "03",
    label: "Global Missions",
    title: "To The Ends of the Earth",
    description:
      "The Gospel is too good to keep to ourselves. Comfort zones don't change the world, so we step out. We are raising a generation that says 'Here I am, send me.' Whether it's crossing a street or crossing an ocean, we go where He leads.",
    image:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop",
    initiatives: [
      "Short-term Mission Trips",
      "Missionary Support",
      "Intercessory Prayer",
      "Cultural Training",
    ],
  },
];

// ✅ EXPANDED GALLERY IMAGES (8 Total)
const galleryImages = [
  // Page 1
  "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/581273739_1149459007295649_1684019673604616470_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=pjpDKUIowTQQ7kNvwGgvAZo&_nc_oc=AdlUSUChSwqaV4tRRPLH87tbbCy7AGzw2grq7Sa45PFcpkkHbTCzPJSR8tTC59kGiEo&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=DkbxmjwSLFm5K_FyQvqgyg&oh=00_Afoz5mYteenk4M0Ids1Wn5syBU4sFq0Ms60vtFTs0Tu-RQ&oe=696927C5", // Group group huddle
  "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/581317043_1149459560628927_8870829007379808340_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=GUqgA4CkVIwQ7kNvwEIBjJc&_nc_oc=AdnBcmI-7gjCmB_MadB3rI8jD2c8JeW1iUhsUl5vIZLW38OmTj1TzzVYkhA2EzmLJTo&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=ba8BOH4ALjxKBpCNh8ZPUg&oh=00_Afpy9-_EAV3JnhiDyr0XxI7-zGzRGhQpQuVIFBU2zL-g0w&oe=6969303B", // Outdoor youth gathering
  "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/581595377_1149459580628925_8559813463508112195_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=mEgRHL2XTicQ7kNvwHL5wAd&_nc_oc=AdlkhyRNAb6TnUW6Wl_nfJ8ERKggg83TEKHtPQY4sMTsrNupIZDnvJiur9i_kk4d8yk&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=GynLhSS9wOEuFCSQgpzqEg&oh=00_Afrak4vLJZ1GqwPM2CltVxIY097IlLHxdRSnznK17I-N6w&oe=696910D2", // Hands raised worship
  "https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/581351788_1149460020628881_2149518637914428964_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=sUVGHEgtnt8Q7kNvwEuD1Mj&_nc_oc=AdllIzbjEBUfyFcsT-_Msqy8OL925IHPxz8WZmeJMqV87AEqxxN_-jaI7FEvrPyOMvU&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=1taAzuVrGGtESngvccGqBg&oh=00_AfqVzJW2ieGO0e9MIzG52Oa4fnECUQBE_9XspCgHVG88Pw&oe=696913F7", // Teaching/sharing
  // Page 2
  "https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/558417142_1119306653644218_4821695748486497705_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=k_iNeC7a6acQ7kNvwGLU6_6&_nc_oc=Adn5NXAjU1SNYo4Fa28yj02X0XHPQoYCbI-BP30VdAyIxDiQjH3fTsgc6O4mPFoMpZo&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=wXx4cDwU-oKj67U0S2PoPQ&oh=00_AfoYG3xxhCdslImjpahysHc-DOrtT39sKemae3vKPnfJhg&oe=69693D9D", // Charity/Giving
  "https://images.unsplash.com/photo-1526633712376-1029729c2980?q=80&w=2071&auto=format&fit=crop", // Outreach/Helping
  "https://images.unsplash.com/photo-1573164574472-797ce11726e9?q=80&w=2069&auto=format&fit=crop", // Street ministry/talking
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop", // Group photo diverse
];

const Outreach = () => {
  const [activeTab, setActiveTab] = useState(outreachTabs[0]);

  // ✅ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(galleryImages.length / itemsPerPage);

  // Get current slice of images
  const paginatedImages = galleryImages.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Pagination Handlers
  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };
  const prevPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-32 pb-20 px-6 relative overflow-hidden">
      {/* --- ATMOSPHERE BACKGROUND --- */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-brand-accent/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-600/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- HERO SECTION (Unchanged) --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-block py-1 px-3 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent font-bold tracking-widest uppercase text-xs mb-4">
            The Great Commission
          </span>
          <h1 className="text-5xl md:text-8xl font-display font-bold text-white mb-6">
            We Are The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">
              Church
            </span>
          </h1>
          <p className="text-brand-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            We don't just sit in pews; we stand in the gap. We believe ministry
            happens wherever your feet take you. It's time to be the salt and
            light outside the four walls.
          </p>
        </motion.div>

        {/* --- INTERACTIVE TABS (Unchanged) --- */}
        <div className="mb-24">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 border-b border-white/10 pb-4">
            {outreachTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm md:text-lg font-bold tracking-wide transition-all relative ${
                  activeTab.id === tab.id
                    ? "text-brand-accent"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <span className="mr-2 opacity-50 font-mono text-xs">
                  {tab.number}.
                </span>
                {tab.label}
                {activeTab.id === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-accent"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                  {activeTab.title}
                </h2>
                <p className="text-brand-muted text-lg leading-relaxed mb-8 border-l-2 border-brand-accent/50 pl-6 italic">
                  "{activeTab.description}"
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">
                    How We Move
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeTab.initiatives.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-brand-muted text-sm"
                      >
                        <svg
                          className="w-4 h-4 text-brand-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="relative h-80 md:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img
                  src={activeTab.image}
                  alt={activeTab.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- MARK 10:45 SECTION (Unchanged) --- */}
        <div className="mb-24 text-center bg-white/5 rounded-3xl p-10 border border-white/5">
          <p className="text-brand-accent font-mono text-sm mb-4">MARK 10:45</p>
          <h3 className="text-2xl md:text-4xl font-bold text-white max-w-4xl mx-auto leading-tight mb-6">
            "For even the Son of Man did not come to be served, but to serve,
            and to give his life as a ransom for many."
          </h3>
          <p className="text-brand-muted max-w-2xl mx-auto">
            True leadership begins with a towel and a basin. We serve because He
            first served us.
          </p>
        </div>

        {/* --- ✅ UPDATED SNAPSHOTS GALLERY WITH PAGINATION --- */}
        <div className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Ministry in Action
              </h3>
              <p className="text-brand-muted text-sm mt-1">
                Page {currentPage + 1} of {totalPages}
              </p>
            </div>

            {/* ✅ PAGINATION ARROWS */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-accent hover:border-brand-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-brand-accent hover:border-brand-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Animated Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage} // Key change triggers animation
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[300px]"
            >
              {paginatedImages.map((img, idx) => {
                // Calculate actual index for unique keys across pages
                const actualIndex = currentPage * itemsPerPage + idx;
                // Dynamic layout: First item on first page gets special styling
                const isFirstItem = actualIndex === 0;

                return (
                  <motion.div
                    key={actualIndex}
                    whileHover={{ y: -5 }}
                    className={`rounded-2xl overflow-hidden border border-white/5 relative group ${
                      isFirstItem
                        ? "col-span-2 row-span-2 aspect-square md:aspect-auto"
                        : "aspect-square"
                    }`}
                  >
                    <img
                      src={img}
                      alt="Outreach"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-brand-accent font-bold text-sm tracking-widest uppercase">
                        View Post
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- CALL TO ACTION (Unchanged) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-brand-accent/20 to-transparent border border-brand-accent/20 p-12 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Be Used by God?
            </h2>
            <p className="text-brand-muted mb-8 max-w-xl mx-auto">
              God doesn't call the qualified; He qualifies the called. If you
              have a willing heart, there is a place for you here.
            </p>
            <a
              href="https://m.me/yxcdo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-brand-accent hover:scale-105 transition-all shadow-lg"
            >
              I'm Ready to Serve
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Outreach;
