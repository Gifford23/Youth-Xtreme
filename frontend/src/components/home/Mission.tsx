import { Link } from "react-router-dom";

const VIBES = [
  {
    icon: "🕊️",
    title: "Grace-Filled Space",
    desc: "You are a masterpiece in progress. No masks or dress codes required—just a community ready to welcome you with the same grace Christ gives us all.",
  },
  {
    icon: "🔥",
    title: "Spirit & Truth",
    desc: "Worship with freedom and passion. We create an atmosphere where the Holy Spirit moves and every heart is invited to experience His presence.",
  },
  {
    icon: "🌿",
    title: "Safe Harbor",
    desc: "A sanctuary for honest hearts. Bring your questions and your burdens; find a family that listens with love and walks with you in the peace of God.",
  },
];

const Mission = () => {
  return (
    <section className="py-20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content Area */}
          <div className="flex flex-col">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              The Pulse <br />
              <span className="text-brand-accent">Check.</span>
            </h2>

            <p className="text-xl text-gray-300 mb-10 font-light italic leading-relaxed">
              Stepping into the unknown can be a heavy walk, but you don't have
              to carry that weight here. Discover a{" "}
              <span className="text-white font-medium">
                sanctuary built on grace,
              </span>{" "}
              where you can breathe easy and experience the presence of God
              exactly as you are.
            </p>

            {/* Adjusted spacing to space-y-7 for perfect leveling with a 550px image */}
            <div className="space-y-7">
              {VIBES.map((v, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:bg-brand-accent group-hover:text-black transition-all duration-300">
                    {v.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-0.5">
                      {v.title}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual (Adjusted to 550px for a sleek, leveled look) */}
          <div className="relative h-[550px] rounded-3xl overflow-hidden group shadow-xl">
            <img
              src="https://scontent.fcgy3-2.fna.fbcdn.net/v/t39.30808-6/517059800_1039160668294515_4056897022503255003_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=dkeXwulZRzMQ7kNvwGGMH3o&_nc_oc=AdlXP7XA2rA4sBnXum5zpEQQrNlVc0C8YswAY8_OhRsPRzuorklUzUoLhuB67d7RJT8&_nc_zt=23&_nc_ht=scontent.fcgy3-2.fna&_nc_gid=w-szO96T5IJEicPURSVpgw&oh=00_AfoBHgWaL17MjJp_8YnIT2iFIVH3sg27Kp06YV-9oh7phQ&oe=6965074E"
              alt="Worship Vibe"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
            />

            {/* Overlay Card */}
            <div className="absolute bottom-6 left-6 right-6">
              <Link
                to="/events"
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
