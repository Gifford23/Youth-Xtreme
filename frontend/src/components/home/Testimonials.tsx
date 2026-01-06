import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Youth Xtreme isn't just a youth group, it's a family. I found my purpose here.",
    author: "Sarah J.",
    role: "Worship Team",
  },
  {
    quote:
      "The energy on Friday nights is unmatched! Best way to start the weekend.",
    author: "Mike T.",
    role: "Member",
  },
  {
    quote: "I learned how to lead and serve others. Truly life-changing.",
    author: "David L.",
    role: "Small Group Leader",
  },
];

const Testimonials = () => {
  return (
    <div className="bg-brand-dark py-24 border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wide">
            Voices of the <span className="text-brand-accent">Family</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-brand-gray/50 p-8 rounded-3xl border border-white/5 relative group hover:border-brand-accent/30 transition-colors"
            >
              <div className="text-brand-accent text-4xl font-serif absolute top-4 left-6 opacity-30">
                "
              </div>
              <p className="text-gray-300 text-lg mb-6 relative z-10 italic leading-relaxed">
                {t.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-purple-600 flex items-center justify-center text-brand-dark font-bold text-sm">
                  {t.author[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t.author}</h4>
                  <span className="text-brand-muted text-xs uppercase tracking-wider">
                    {t.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
