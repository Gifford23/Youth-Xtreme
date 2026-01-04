const Mission = () => {
  const pillars = [
    {
      title: "ENGAGE",
      desc: "Connecting young people through dynamic events and media.",
      icon: "⚡",
    },
    {
      title: "EQUIP",
      desc: "Training the next generation in life-skills and faith.",
      icon: "🛡️",
    },
    {
      title: "EMPOWER",
      desc: "Providing opportunities for leadership and service.",
      icon: "🚀",
    },
  ];

  return (
    <div className="bg-brand-gray/50 py-20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
        {pillars.map((p) => (
          <div key={p.title} className="text-center group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
              {p.icon}
            </div>
            <h3 className="text-brand-accent font-display text-2xl font-bold mb-2">
              {p.title}
            </h3>
            <p className="text-brand-muted">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mission;
