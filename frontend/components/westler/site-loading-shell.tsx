"use client";

/**
 * Minimal full-viewport loader while public API data is in flight.
 * CSS-only spinner — no extra dependencies.
 */
export function SiteLoadingShell() {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--background)]"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading content</span>
      <div
        className="h-8 w-8 rounded-full border-2 border-[#2e739e]/25 border-t-[#2e739e] motion-safe:animate-spin"
        aria-hidden
      />
    </div>
  );
}
