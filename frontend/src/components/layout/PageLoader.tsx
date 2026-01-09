import { motion } from "framer-motion";

const PageLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-dark"
    >
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer Ring - Slow Rotate */}
        <motion.span
          className="absolute w-full h-full border-2 border-brand-accent/20 rounded-full border-t-brand-accent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />

        {/* Middle Ring - Fast Rotate Reverse */}
        <motion.span
          className="absolute w-3/4 h-3/4 border-2 border-white/10 rounded-full border-b-white"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />

        {/* Inner Core - Pulse */}
        <motion.div
          className="w-4 h-4 bg-brand-accent rounded-full shadow-[0_0_15px_rgba(204,255,0,0.8)]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        />
      </div>

      {/* Text Animation */}
      <motion.div
        className="mt-8 flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {["L", "O", "A", "D", "I", "N", "G"].map((letter, i) => (
          <motion.span
            key={i}
            className="text-white font-display font-bold text-sm tracking-widest"
            animate={{
              y: [0, -5, 0],
              color: ["#ffffff", "#ccff00", "#ffffff"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default PageLoader;
