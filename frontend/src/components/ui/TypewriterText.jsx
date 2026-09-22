import React, { useState, useEffect, useRef } from 'react';

/**
 * TypewriterText: Types out small and non-bold text smoothly character-by-character when scrolled into view.
 */
export default function TypewriterText({
  text,
  children,
  speed = 18,
  delay = 200,
  className = '',
  as: Component = 'p',
  cursor = true,
  cursorChar = '▋'
}) {
  const fullText = typeof text === 'string' ? text : (typeof children === 'string' ? children : '');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Reset typing if text changes (e.g. on language translation switch)
    setDisplayedText('');
    setIsDone(false);
    setHasStarted(false);
    setIsTyping(false);

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fullText]);

  useEffect(() => {
    if (!hasStarted || !fullText) return;

    let index = 0;
    setIsTyping(true);

    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        index += 1;
        setDisplayedText(fullText.slice(0, index));

        if (index >= fullText.length) {
          clearInterval(interval);
          setIsTyping(false);
          setIsDone(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [hasStarted, fullText, speed, delay]);

  // If complex JSX children are passed instead of a plain string, render normally
  if (!fullText && children) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component ref={containerRef} className={`relative ${className}`}>
      <span>{displayedText}</span>
      {cursor && isTyping && (
        <span className="inline-block text-[#a3e635] text-[0.85em] animate-pulse ml-0.5 select-none">
          {cursorChar}
        </span>
      )}
      {!hasStarted && (
        <span className="opacity-0 pointer-events-none select-none">
          {fullText}
        </span>
      )}
    </Component>
  );
}
