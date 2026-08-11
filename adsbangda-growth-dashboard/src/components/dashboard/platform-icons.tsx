import type { SVGProps } from "react";

/**
 * lucide-react doesn't ship Instagram/Facebook glyphs, so these are minimal
 * outline icons drawn in the same stroke style (24x24, currentColor,
 * strokeWidth 2, round caps) as the rest of the icon set — purely
 * functional platform indicators, not a reproduction of any brand artwork.
 */

export function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14 8.5h-1.5A1.5 1.5 0 0 0 11 10v2m0 0v6m0-6h3" />
    </svg>
  );
}
