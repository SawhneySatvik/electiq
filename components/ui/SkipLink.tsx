"use client";

/**
 * Skip-to-main-content link for keyboard users. Visually hidden until focused;
 * lands on the `#main` landmark so users can bypass the navbar in one tab.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-3 focus:py-2 focus:rounded-md focus:bg-accent focus:text-bg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
    >
      Skip to main content
    </a>
  );
}
