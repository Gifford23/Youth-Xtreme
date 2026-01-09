import { motion } from "framer-motion";
import React from "react";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: "blur(5px)" }} // Start slightly down and blurred
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} // Animate to clear and center
      exit={{ opacity: 0, y: -15, filter: "blur(5px)" }} // Exit slightly up and blurred
      transition={{ duration: 0.4, ease: "easeOut" }} // Smooth timing
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
