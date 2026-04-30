"use client";

import { ReactLenis } from "lenis/react";

/**
 * Global smooth-scroll provider powered by Lenis.
 * Wraps children so that all page scrolling is buttery-smooth.
 *
 * Uses `root` mode — Lenis takes over `<html>` scrolling,
 * no extra wrapper divs injected into the DOM.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  );
}
