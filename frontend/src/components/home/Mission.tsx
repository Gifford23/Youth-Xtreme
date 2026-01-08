import { Link } from "react-router-dom"; // ✅ Import Link

const VIBES = [
  {
    icon: "☕",
    title: "Come As You Are",
    desc: "No dress code. No expectations. Just bring yourself (and maybe a friend).",
  },
  {
    icon: "🔊",
    title: "Loud & Live",
    desc: "We love passionate worship and music that wakes up the soul.",
  },
  {
    icon: "🤝",
    title: "Zero Judgment",
    desc: "A safe space to ask hard questions and find real answers.",
  },
];

const Mission = () => {
  return (
    <section className="py-20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: The "Safe Space" Copy */}
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              The Pulse <br />
              <span className="text-brand-accent">Check.</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-light">
              We know walking into a new place can be scary. Here is exactly
              what you can expect when you step into Youth Xtreme.
            </p>

            <div className="space-y-6">
              {VIBES.map((v, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:bg-brand-accent group-hover:text-black transition-colors">
                    {v.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{v.title}</h4>
                    <p className="text-gray-400 text-sm">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The Visual */}
          <div className="relative h-[500px] rounded-3xl overflow-hidden group">
            <img
              src="https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/517059800_1039160668294515_4056897022503255003_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=dkeXwulZRzMQ7kNvwGGMH3o&_nc_oc=AdlXP7XA2rA4sBnXum5zpEQQrNlVc0C8YswAY8_OhRsPRzuorklUzUoLhuB67d7RJT8&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=w-szO96T5IJEicPURSVpgw&oh=00_AfoBHgWaL17MjJp_8YnIT2iFIVH3sg27Kp06YV-9oh7phQ&oe=6965074E"
              alt="Worship Vibe"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
            />

            {/* Overlay Info Card - Now Clickable */}
            <div className="absolute bottom-6 left-6 right-6">
              <Link
                to="/events" // ✅ Redirects to Events page
                className="block bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-brand-accent/50 transition-colors group/card"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-1">
                      Next Gathering
                    </p>
                    <p className="text-white font-bold text-xl group-hover/card:text-brand-accent transition-colors">
                      This Friday @ 6PM
                    </p>
                  </div>
                  {/* Arrow Icon */}
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold group-hover/card:scale-110 transition-transform">
                    →
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
