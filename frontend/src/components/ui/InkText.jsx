import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function InkText({
  children,
  text,
  as: Component = 'span',
  className = '',
  strokeColor,
  fillColor,
  strokeWidth = '0.5px',
  delay = 200,
  duration = 2000,
  triggerOnce = true
}) {
  const { isDark } = useTheme();
  const content = text || children;
  const ref = useRef(null);
  const [isFilled, setIsFilled] = useState(false);

  const resolvedStroke = strokeColor || (isDark ? '#ffffff' : '#000000');
  const resolvedFill = fillColor || (isDark ? '#ffffff' : '#000000');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const timer = setTimeout(() => {
              setIsFilled(true);
            }, delay);
            if (triggerOnce) {
              observer.unobserve(el);
            }
            return () => clearTimeout(timer);
          } else if (!triggerOnce) {
            setIsFilled(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, triggerOnce]);

  return (
    <Component
      ref={ref}
      className={`inline-block select-none relative ${className}`}
      style={{
        color: isFilled ? resolvedFill : 'transparent',
        WebkitTextStroke: isFilled ? '0px transparent' : `${strokeWidth} ${resolvedStroke}`,
        paintOrder: 'stroke fill',
        backgroundImage: `linear-gradient(105deg, ${resolvedFill} 0%, ${resolvedFill} 100%)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: isFilled ? '100% 100%' : '0% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        transition: `background-size ${duration}ms cubic-bezier(0.45, 0.05, 0.25, 1), color 350ms ease ${Math.max(0, duration - 200)}ms, -webkit-text-stroke 300ms ease`,
        willChange: 'background-size, color'
      }}
    >
      {content}
    </Component>
  );
}

