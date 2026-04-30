"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * Initializes AOS (Animate On Scroll) globally.
 * Drop this once into the layout / page tree — no children needed.
 */
export function AosProvider() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      delay: 0,
    });
    // Refresh AOS after dynamic content settles (images load, etc.)
    const timer = setTimeout(() => AOS.refresh(), 500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
