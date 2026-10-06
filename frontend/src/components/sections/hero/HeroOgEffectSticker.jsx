import React, { forwardRef } from 'react';

/**
 * HeroOgEffectSticker (Impact Sticker)
 * The signature 3D tilted sticker badge ("IMPACT // ORIGINAL / 001").
 * Uses forwardRef to bind directly to GSAP camera zoom & mouse tilt kinematics.
 */
const HeroOgEffectSticker = forwardRef(function HeroOgEffectSticker(props, ref) {
  return (
    <div
      ref={ref}
      aria-label="Impact - Original 001"
      className="absolute -top-7 sm:-top-14 right-2 sm:right-6 z-40 flex flex-col items-center select-none group cursor-help"
      style={{
        transform: 'translateZ(85px) rotate(-6deg)',
        transformStyle: 'preserve-3d'
      }}
    >
      <span className="font-heading text-3xl sm:text-6xl md:text-7xl text-[#ef4444] font-black tracking-tight sm:tracking-tighter whitespace-nowrap drop-shadow-[3px_3px_0px_#000] sm:drop-shadow-[5px_5px_0px_#000] drop-shadow-[7px_7px_0px_rgba(0,0,0,0.4)]">
        IMPACT
      </span>
      <div
        className="bg-black text-white font-mono-tech font-extrabold text-[9px] sm:text-xs px-2.5 py-0.5 border border-black transform rotate-3 -mt-1 sm:-mt-2"
        style={{
          boxShadow: '2px 2px 0px #ef4444'
        }}
      >
        ORIGINAL // 001
      </div>
    </div>
  );
});

export default HeroOgEffectSticker;
