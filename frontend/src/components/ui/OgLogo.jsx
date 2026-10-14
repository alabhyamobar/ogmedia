import React from 'react';

export default function OgLogo({
  size = 'md',
  withText = true,
  title = 'MEDIA',
  subtitle = 'CREATIVE INTELLIGENCE STUDIO',
  className = ''
}) {
  const containerSizeClasses = {
    sm: 'w-9 h-9 sm:w-10 sm:h-10',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-12 h-12 sm:w-16 sm:h-16',
    xl: 'w-16 h-16 sm:w-24 sm:h-24'
  };

  const imgSizeClasses = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-11 h-11 sm:w-15 sm:h-15',
    xl: 'w-15 h-15 sm:w-22 sm:h-22'
  };

  const titleSizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-base sm:text-xl',
    xl: 'text-xl sm:text-3xl'
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
            src="/ogmedia/assets/og_logo.webp"
            alt="OG Crest Logo"
            className={`${imgSizeClasses[size] || imgSizeClasses.md} object-contain transition-transform`}
          />
        </div>
      </div>

      {withText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-heading font-black tracking-tighter text-black dark:text-[#F5F5F5] uppercase ${titleSizeClasses[size] || titleSizeClasses.md}`}>
              {title}
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
