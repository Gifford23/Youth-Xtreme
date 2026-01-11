import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is a hash (e.g. #moments), scroll to it smoothly
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Otherwise, snap to top instantly for a fresh page feel
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}
