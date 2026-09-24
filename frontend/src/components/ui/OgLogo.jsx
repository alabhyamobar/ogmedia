import React from 'react';

/**
 * OG Media Brand Logo Component
 * High-impact geometric typography with manga drop shadow and tech accents
 */
export default function OgLogo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  withText = true,
  subtitle = 'DIGITAL CREATIVE AGENCY',
  className = ''
}) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8 sm:h-9',
    lg: 'h-11 sm:h-12',
    xl: 'h-14 sm:h-16'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Vector OG Emblem */}
      <div className="relative group">
        <svg
          viewBox="0 0 124 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeClasses[size] || sizeClasses.md} w-auto aspect-[124/88] drop-shadow-[2px_2px_0px_#000000]`}
        >
          {/* Black Base Frame Background with beveled corners */}
          <path
            d="M6 0H118L124 6V82L118 88H6L0 82V6L6 0Z"
            fill="#09090b"
          />

          {/* Border Outline */}
          <path
            d="M6 1H118L123 6V82L118 87H6L1 82V6L6 1Z"
            stroke="#bef264"
            strokeWidth="2"
          />

          {/* Letter 'O' (Chamfered Geometry) */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14 16H46L54 24V64L46 72H14L6 64V24L14 16ZM18 26H42L44 28V60L42 62H18L16 60V28L18 26Z"
            fill="#ffffff"
          />

          {/* Lime Core Accent inside 'O' */}
          <rect x="23" y="36" width="14" height="16" fill="#bef264" rx="1" />

          {/* Letter 'G' (Tech Geometry with Media Play Cutout) */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M68 16H104L112 24V38H98V28L96 26H76L74 28V60L76 62H96L98 60V48H86V38H112V64L104 72H68L60 64V24L68 16Z"
            fill="#ffffff"
          />

          {/* Media Play Arrow Accent inside 'G' */}
          <polygon
            points="102,48 114,54 102,60"
            fill="#bef264"
          />

          {/* Registration Crosshair Mark in corner */}
          <line x1="116" y1="8" x2="116" y2="14" stroke="#bef264" strokeWidth="1.5" />
          <line x1="113" y1="11" x2="119" y2="11" stroke="#bef264" strokeWidth="1.5" />

          {/* Bottom Audio/Data Wave Lines */}
          <rect x="20" y="77" width="4" height="3" fill="#bef264" />
          <rect x="26" y="76" width="4" height="4" fill="#bef264" />
          <rect x="32" y="75" width="4" height="5" fill="#bef264" />
          <rect x="38" y="76" width="4" height="4" fill="#bef264" />
          <rect x="44" y="77" width="4" height="3" fill="#bef264" />
        </svg>
      </div>

      {/* Brand Text Lockup */}
      {withText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-black text-sm sm:text-base tracking-tighter text-black dark:text-white uppercase">
              OG MEDIA
            </span>
            <span className="bg-[#bef264] text-black text-[9px] font-mono-tech font-bold px-1 py-0.2 border border-black leading-tight">
              STUDIO
            </span>
          </div>
          {subtitle && (
            <span className="font-mono-tech text-[8px] sm:text-[9px] text-stone-500 dark:text-stone-400 font-semibold tracking-wider uppercase mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
