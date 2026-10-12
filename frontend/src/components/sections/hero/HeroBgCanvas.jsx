import React from 'react';

/**
 * HeroBgCanvas
 * Renders comic manuscript perspective drafting lines and camera viewfinder markings
 * directly on the white drafting board canvas.
 * Strict color theme: Pure black on light theme, pure white on dark mode.
 */
export default function HeroBgCanvas({ bgRaysRef, cornerMarksRef, isDark }) {
  const strokeBold = isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.7)';
  const strokeMedium = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.38)';
  const strokeLight = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.18)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)';

  return (
    <>
      {/* Corner telemetry marks for comic draft layout */}
      <div ref={cornerMarksRef} className="contents" aria-hidden="true">
        <div
          className="absolute top-1.5 left-2 sm:top-2 sm:left-3 font-mono-tech text-[9px] sm:text-xs font-bold text-black dark:text-white select-none z-20 pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          + C_01 [DRAFT_STAGE]
        </div>
        <div
          className="absolute top-1.5 right-2 sm:top-2 sm:right-3 font-mono-tech text-[9px] sm:text-xs font-bold text-black dark:text-white select-none z-20 pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          [BLEED_SAFE] C_02 +
        </div>
        <div
          className="absolute bottom-1.5 left-2 sm:bottom-2 sm:left-3 font-mono-tech text-[9px] sm:text-xs font-bold text-black dark:text-white select-none z-20 pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          + C_03 [PERSPECTIVE_GRID]
        </div>
        <div
          className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-3 font-mono-tech text-[9px] sm:text-xs font-bold text-black dark:text-white select-none z-20 pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          [Z_CONVERGENCE] C_04 +
        </div>
      </div>

      {/* Perspective drafting lines on the white/dark comic board surface */}
      <div
        ref={bgRaysRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        style={{ transform: 'translateZ(2px)' }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Manuscript Drafting Margin Frames (Bleed & Safe Area Guides) */}
          <rect x="15" y="15" width="970" height="670" fill="none" stroke={strokeLight} strokeWidth="1" strokeDasharray="6 6" />
          <rect x="35" y="35" width="930" height="630" fill="none" stroke={strokeMedium} strokeWidth="1.2" />

          {/* Primary Diagonal Corner-to-Corner Perspective Projection Beams */}
          <line x1="0" y1="0" x2="1000" y2="700" stroke={strokeBold} strokeWidth="1.4" />
          <line x1="1000" y1="0" x2="0" y2="700" stroke={strokeBold} strokeWidth="1.4" />

          {/* Principal Horizon Axis (H.L.) & Vertical Center Axis (V.A.) */}
          <line x1="0" y1="350" x2="1000" y2="350" stroke={strokeBold} strokeWidth="1.4" strokeDasharray="8 4" />
          <line x1="500" y1="0" x2="500" y2="700" stroke={strokeBold} strokeWidth="1.4" strokeDasharray="8 4" />

          {/* Perspective Fan Rays: Top Perimeter Convergence */}
          <line x1="80" y1="0" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="5 3" />
          <line x1="180" y1="0" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1.1" />
          <line x1="280" y1="0" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="6 4" />
          <line x1="380" y1="0" x2="500" y2="350" stroke={strokeLight} strokeWidth="0.9" strokeDasharray="4 4" />
          <line x1="620" y1="0" x2="500" y2="350" stroke={strokeLight} strokeWidth="0.9" strokeDasharray="4 4" />
          <line x1="720" y1="0" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="6 4" />
          <line x1="820" y1="0" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1.1" />
          <line x1="920" y1="0" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="5 3" />

          {/* Perspective Fan Rays: Bottom Perimeter Convergence */}
          <line x1="80" y1="700" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="5 3" />
          <line x1="180" y1="700" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1.1" />
          <line x1="280" y1="700" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="6 4" />
          <line x1="380" y1="700" x2="500" y2="350" stroke={strokeLight} strokeWidth="0.9" strokeDasharray="4 4" />
          <line x1="620" y1="700" x2="500" y2="350" stroke={strokeLight} strokeWidth="0.9" strokeDasharray="4 4" />
          <line x1="720" y1="700" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="6 4" />
          <line x1="820" y1="700" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1.1" />
          <line x1="920" y1="700" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="5 3" />

          {/* Perspective Fan Rays: Left & Right Lateral Perimeter */}
          <line x1="0" y1="110" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="6 3" />
          <line x1="0" y1="220" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1.1" />
          <line x1="0" y1="480" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1.1" />
          <line x1="0" y1="590" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="6 3" />

          <line x1="1000" y1="110" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="6 3" />
          <line x1="1000" y1="220" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1.1" />
          <line x1="1000" y1="480" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1.1" />
          <line x1="1000" y1="590" x2="500" y2="350" stroke={strokeMedium} strokeWidth="1" strokeDasharray="6 3" />

          {/* Perspective Depth Recession Ellipses */}
          <ellipse cx="500" cy="350" rx="140" ry="85" fill="none" stroke={strokeLight} strokeWidth="0.9" strokeDasharray="5 5" />
          <ellipse cx="500" cy="350" rx="280" ry="170" fill="none" stroke={strokeLight} strokeWidth="1" strokeDasharray="7 5" />
          <ellipse cx="500" cy="350" rx="460" ry="280" fill="none" stroke={strokeLight} strokeWidth="1.1" strokeDasharray="9 7" />

          {/* Perspective Telemetry Annotations */}
          <text x="45" y="342" fill={textColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
            H.L. [HORIZON AXIS // 0.00°]
          </text>
          <text x="955" y="342" textAnchor="end" fill={textColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
            1-POINT PERSPECTIVE CONVERGENCE [θ: 180.00°]
          </text>
          <text x="510" y="30" fill={textColor} fontSize="10" fontFamily="monospace" fontWeight="bold">
            V.A. [CENTER AXIS // 90°]
          </text>
          <text x="510" y="685" fill={textColor} fontSize="10" fontFamily="monospace" fontWeight="bold">
            V.A. [NADIR VECTOR // 270°]
          </text>

          {/* Angle degree telemetry tags */}
          <text x="160" y="55" fill={textColor} fontSize="9" fontFamily="monospace" opacity="0.8">
            [θ: 34.2°]
          </text>
          <text x="840" y="55" textAnchor="end" fill={textColor} fontSize="9" fontFamily="monospace" opacity="0.8">
            [θ: 145.8°]
          </text>
          <text x="160" y="660" fill={textColor} fontSize="9" fontFamily="monospace" opacity="0.8">
            [θ: 214.2°]
          </text>
          <text x="840" y="660" textAnchor="end" fill={textColor} fontSize="9" fontFamily="monospace" opacity="0.8">
            [θ: 325.8°]
          </text>

          {/* Framing Alignment Brackets */}
          <path d="M 35 15 L 15 15 L 15 35" fill="none" stroke={strokeBold} strokeWidth="1.8" />
          <path d="M 965 15 L 985 15 L 985 35" fill="none" stroke={strokeBold} strokeWidth="1.8" />
          <path d="M 35 685 L 15 685 L 15 665" fill="none" stroke={strokeBold} strokeWidth="1.8" />
          <path d="M 965 685 L 985 685 L 985 665" fill="none" stroke={strokeBold} strokeWidth="1.8" />
        </svg>
      </div>
    </>
  );
}
