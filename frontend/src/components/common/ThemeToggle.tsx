import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"neon" | "bw">("neon");

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("yx-theme") as "neon" | "bw";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "neon" ? "bw" : "neon";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("yx-theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 border focus:outline-none ${
        theme === "bw"
          ? "bg-black border-black"
          : "bg-white/10 border-brand-accent/50"
      }`}
      title="Switch Theme"
    >
      <span className="sr-only">Toggle Theme</span>
      <span
        className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full transition-transform duration-300 font-bold text-[9px] uppercase ${
          theme === "bw"
            ? "translate-x-7 bg-white text-black"
            : "translate-x-1 bg-brand-accent text-brand-dark"
        }`}
      >
        {theme === "bw" ? "BW" : "NX"}
      </span>
    </button>
  );
};

export default ThemeToggle;
