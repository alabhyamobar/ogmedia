import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

  const animDuration = duration > 20 ? duration / 1000 : duration;
  const animDelay = delay > 20 ? delay / 1000 : delay;

  useEffect(() => {
    const container = containerRef.current;
    const roller = rollerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const ctx = gsap.context(() => {
      gsap.set(container, {
        clipPath: 'inset(0% 100% 0% 0%)',
        transformPerspective: 1200,
        transformOrigin: 'left center',
        rotateY: -8,
        x: -12,
        opacity: 0.15,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'clip-path, transform, opacity'
      });

      gsap.set(content, {
        x: -15,
        scaleX: 0.98,
        transformOrigin: 'left center',
        willChange: 'transform'
      });

      if (roller) {
        gsap.set(roller, {
          xPercent: 0,
          opacity: 0.9,
          willChange: 'transform, opacity'
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        delay: animDelay
      });

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
      <div
        ref={rollerRef}
        className="absolute top-0 bottom-0 left-0 pointer-events-none z-30 w-6 -ml-3"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.28), rgba(0,0,0,0.12) 50%, rgba(255,255,255,0.3) 70%, transparent)'
        }}
      />

      <div ref={contentRef} className="w-full h-full">
        {children}
      </div>
    </div>
  );
}
