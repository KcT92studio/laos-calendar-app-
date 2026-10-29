import React from 'react';

/**
 * Traditional Lao Sin (ຜ້າຊິ່ນ) Woven Textile Pattern
 * Lightweight embedded vector SVG pattern with traditional diamond weave and Dok Champa motif.
 * Uses CSS variable var(--pattern-color) and keeps 5.5% opacity (within 4-8% requirement)
 * to ensure maximum text readability and zero performance overhead. Fully offline.
 */
export const LaoSinPattern: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-300"
      aria-hidden="true"
      style={{ opacity: 0.06 }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="lao-sin-weave-pattern"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            {/* Outer Diamond Weave Frame */}
            <path
              d="M 28 0 L 56 28 L 28 56 L 0 28 Z"
              fill="none"
              stroke="var(--pattern-color)"
              strokeWidth="1.2"
            />

            {/* Stepped Inner Diamond (ລາຍໝີ່ຂັ້ນໄດ) */}
            <path
              d="M 28 8 L 48 28 L 28 48 L 8 28 Z"
              fill="none"
              stroke="var(--pattern-color)"
              strokeWidth="1"
            />
            <path
              d="M 28 14 L 42 28 L 28 42 L 14 28 Z"
              fill="none"
              stroke="var(--pattern-color)"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />

            {/* Central Dok Champa Flower Motif (ດອກຈຳປາ 8 ແສກ) */}
            <path
              d="M 28 19 L 30 25 L 37 28 L 30 31 L 28 37 L 26 31 L 19 28 L 26 25 Z"
              fill="var(--pattern-color)"
            />

            {/* Corner Weave Connectors (Interlocking seamlessly with adjacent tiles) */}
            <path
              d="M 0 0 L 12 12 M 56 0 L 44 12 M 0 56 L 12 44 M 56 56 L 44 44"
              stroke="var(--pattern-color)"
              strokeWidth="1.2"
            />
            <path
              d="M 0 6 L 6 0 M 56 6 L 50 0 M 0 50 L 6 56 M 56 50 L 50 56"
              stroke="var(--pattern-color)"
              strokeWidth="1"
            />

            {/* Tiny accent diamond at center */}
            <circle cx="28" cy="28" r="1.5" fill="var(--card-bg)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lao-sin-weave-pattern)" />
      </svg>
    </div>
  );
};
