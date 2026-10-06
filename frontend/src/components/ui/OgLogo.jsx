import React from 'react';

export default function OgLogo({
  size = 'md',
  withText = true,
  subtitle = 'CREATIVE INTELLIGENCE STUDIO',
  className = ''
}) {
  const containerSizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20'
  };

  const imgSizeClasses = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-11 h-11 sm:w-13 sm:h-13',
    xl: 'w-15 h-15 sm:w-19 sm:h-19'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative group">
        <div className="absolute inset-0 bg-[#39FF14]/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        <div
          className={`relative flex items-center justify-center bg-[#0A0A0A] border-2 border-black dark:border-[#333333] rounded-xl p-0.5 shadow-[2px_2px_0px_#000000] group-hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all duration-300 group-hover:scale-105 ${
            containerSizeClasses[size] || containerSizeClasses.md
          }`}
        >
          <img
            src="/ogmedia/assets/og_logo.png"
            alt="OG Crest Logo"
            className={`${imgSizeClasses[size] || imgSizeClasses.md} object-contain transition-transform`}
          />
        </div>
      </div>

      {withText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-black text-sm sm:text-base tracking-tighter text-black dark:text-[#F5F5F5] uppercase">
              OG MEDIA
            </span>
            <span className="bg-[#39FF14] text-black text-[9px] font-mono-tech font-black px-1.5 py-0.5 border border-black leading-tight shadow-[1px_1px_0px_#000000]">
              STUDIO
            </span>
          </div>
          {subtitle && (
            <span className="font-mono-tech text-[8px] sm:text-[9px] text-stone-600 dark:text-[#E0E0E0] font-semibold tracking-wider uppercase mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
