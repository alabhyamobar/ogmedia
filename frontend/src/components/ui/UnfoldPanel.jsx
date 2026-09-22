import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * UnfoldPanel: Ultra-smooth, realistic horizontal map unrolling animation.
 * Optimized for 60fps GPU compositor performance with zero layout reflows (no jerks).
 * Simulates a person unrolling a large map across a table from left to right.
 */
export default function UnfoldPanel({
  children,
  className = '',
  delay = 0,
  duration = 1.3,
  direction = 'right'
}) {
  const containerRef = useRef(null);
  const rollerRef = useRef(null);
  const contentRef = useRef(null);

  // Normalize duration and delay whether passed as seconds or milliseconds
  const animDuration = duration > 20 ? duration / 1000 : duration;
  const animDelay = delay > 20 ? delay / 1000 : delay;

  useEffect(() => {
    const container = containerRef.current;
    const roller = rollerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const ctx = gsap.context(() => {
      // 1. Initial State: Map rolled at the left edge
      gsap.set(container, {
        clipPath: 'inset(0% 100% 0% 0%)',
        transformPerspective: 1200,
        transformOrigin: 'left center',
        rotateY: -8, // Subtle, natural paper curl without rendering distortion
        x: -12,
        opacity: 0.15,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'clip-path, transform, opacity'
      });

      // Content inside starts slightly compressed like paper uncurling
      gsap.set(content, {
        x: -15,
        scaleX: 0.98,
        transformOrigin: 'left center',
        willChange: 'transform'
      });

      if (roller) {
        // GPU-accelerated: use xPercent/x instead of 'left' to eliminate layout reflows
        gsap.set(roller, {
          xPercent: 0,
          opacity: 0.9,
          willChange: 'transform, opacity'
        });
      }

      // 2. Timeline triggered on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        delay: animDelay
      });

      // Smooth horizontal map unroll using power2.out for natural paper deceleration
      tl.to(
        container,
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          rotateY: 0,
          x: 0,
          opacity: 1,
          duration: animDuration,
          ease: 'power2.out'
        },
        0
      );

      // Inner content gracefully settles flat
      tl.to(
        content,
        {
          x: 0,
          scaleX: 1,
          duration: animDuration,
          ease: 'power2.out'
        },
        0
      );

      // Traveling paper crease roller shadow (100% GPU accelerated via x/xPercent)
      if (roller) {
        tl.to(
          roller,
          {
            x: () => container.offsetWidth,
            duration: animDuration,
            ease: 'power2.out'
          },
          0
        );

        // Soft fade out as the roller reaches the far edge
        tl.to(
          roller,
          {
            opacity: 0,
            duration: animDuration * 0.35,
            ease: 'power1.out'
          },
          animDuration * 0.65
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [animDelay, animDuration, direction]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Traveling paper roller shadow (GPU accelerated, zero reflows) */}
      <div
        ref={rollerRef}
        className="absolute top-0 bottom-0 left-0 pointer-events-none z-30 w-6 -ml-3"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.28), rgba(0,0,0,0.12) 50%, rgba(255,255,255,0.3) 70%, transparent)'
        }}
      />

      {/* Inner Content Wrapper */}
      <div ref={contentRef} className="w-full h-full">
        {children}
      </div>
    </div>
  );
}
