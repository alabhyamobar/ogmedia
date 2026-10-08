import React, { useState, useEffect, useRef } from 'react';
import InkText from '../ui/InkText';
import UnfoldPanel from '../ui/UnfoldPanel';

const PROJECTS_DATA = [
  {
  id: '01',
  num: '01',
  category: '// BRAND WORK',
  title: 'Pilgrims',
  badgeType: 'star',
  subtitle: 'AI-Powered Content & Digital Experience',
  desc: 'A modern digital experience for Pilgrims, with an engaging online presence.',
  tags: [
    'AI Content Creation',
    'AI Visuals',
    'Digital Branding'
  ],
  img: '/ogmedia/assets/pilgrims.webp',
  video: '/ogmedia/videos/ogbrandad.mp4',
  liveUrl: 'https://discoverpilgrim.com/'
},

  {
  id: '02',
  num: '02',
  category: '// META-ADS AND DIGITAL PRESENCE',
  title: 'SkySolar',
  badgeType: 'leaf',
  subtitle: 'Solar Solutions for a Cleaner Tomorrow',
  desc: 'A strong digital presence designed to showcase SkySolar and support targeted ads.',
  tags: [
    'Meta Ads',
    'Digital Marketing',
    'Brand Awareness',
    'Online Presence'
  ],
  img: '/ogmedia/assets/ogsky.webp',
  video: '/ogmedia/videos/ogsky.mp4',
  liveUrl: 'https://www.instagram.com/skyrenewableenergies/'
},
  {
    id: '03',
    num: '03',
    category: '// E-commerce TECH',
    title: 'Kumbh Prasadam',
    badgeType: 'star',
    subtitle: 'E-Commerce for Sacred Offerings',
    desc: 'An e-commerce platform for authentic Mahakumbh prasadam and sacred offerings.',
    tags: ['E-Commerce', 'WEB APP', 'Branding', 'Digital Marketing'],
    img: '/ogmedia/assets/preashadam.webp',
    video: '/ogmedia/videos/kumbhPreashadam.mp4',
    liveUrl: 'https://kumbhprasadam.com/'
  },

  {
    id: '04',
    num: '04',
    category: '// AI PLACEMENT',
    title: 'PLACIFY',
    badgeType: 'star',
    subtitle: 'AI-Powered Placement Automation',
    desc: 'Resume parsing, job-role mapping and intelligent recommendations using NLP, ML and GenAI.',
    tags: ['Python', 'MERN', 'OpenAI', 'NLP'],
    img: '/ogmedia/assets/card_placify.webp',
    video: '/ogmedia/herovid1.mp4',
    liveUrl: 'https://placify.example.com'
  },

  {
    id: '05',
    num: '05',
    category: '// WEB APP',
    title: 'Apricoat Insurance',
    badgeType: 'shield',
    subtitle: 'Smart Insurance, Simplified',
    desc: 'Full-stack insurance platform with seamless user experience and secure authentication.',
    tags: ['React', 'Node.js', 'MongoDB', 'JWT'],
    img: '/ogmedia/assets/service_web_app_design.webp',
    video: '/ogmedia/videos/service_influencer.mp4',
    liveUrl: 'https://apricoat.example.com'
  },
];
export default function CollectorCoversSection() {
  const [activeIndex, setActiveIndex] = useState(2);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const containerRef = useRef(null);

  const prevCard = () => {
    setActiveIndex((prev) => (prev === 0 ? PROJECTS_DATA.length - 1 : prev - 1));
  };

  const nextCard = () => {
    setActiveIndex((prev) => (prev === PROJECTS_DATA.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeVideoModal) {
        if (e.key === 'Escape') setActiveVideoModal(null);
        return;
      }
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === 'ArrowRight') nextCard();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideoModal]);

  const renderBadgeIcon = (type) => {
    switch (type) {
      case 'sun':
        return (
          <span className="text-[#f59e0b] text-base select-none inline-block">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0z" />
            </svg>
          </span>
        );
      case 'leaf':
        return (
          <span className="text-[#84cc16] text-sm select-none inline-block transform -rotate-12">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </span>
        );
      case 'star':
        return (
          <span className="text-[#a855f7] select-none inline-block transform rotate-12 scale-110">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          </span>
        );
      case 'shield':
        return (
          <span className="text-[#06b6d4] select-none inline-block">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.08 8.8-7 9.88-3.92-1.08-7-5.34-7-9.88V6.3l7-3.12z" />
            </svg>
          </span>
        );
      case 'brain':
        return (
          <span className="text-[#10b981] select-none inline-block">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 20.3a1 1 0 0 0 1.35 1.35l2.69-.62A8.96 8.96 0 0 0 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm5 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  const getCardStyle = (idx) => {
    const isHovered = hoveredIndex === idx;
    const isActive = activeIndex === idx;

    const fanConfig = [
      { rotate: -3.5, y: 14, z: 10 },
      { rotate: -1.8, y: 6, z: 20 },
      { rotate: 0, y: -16, z: 35 },
      { rotate: 1.8, y: 6, z: 20 },
      { rotate: 3.5, y: 14, z: 10 }
    ];

    const currentFan = fanConfig[idx] || { rotate: 0, y: 0, z: 15 };

    if (isHovered) {
      return {
        transform: `translateY(${currentFan.y - 20}px) rotate(0deg) scale(1.04)`,
        zIndex: 50
      };
    }

    if (isActive) {
      return {
        transform: `translateY(${currentFan.y - 8}px) rotate(${currentFan.rotate * 0.5}deg) scale(1.02)`,
        zIndex: currentFan.z + 10
      };
    }

    return {
      transform: `translateY(${currentFan.y}px) rotate(${currentFan.rotate}deg) scale(1)`,
      zIndex: currentFan.z
    };
  };

  return (
    <section
      id="covers"
      ref={containerRef}
      className="relative px-3 sm:px-6 py-16 sm:py-24 max-w-[1480px] mx-auto overflow-hidden select-none"
    >

      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe]/45 via-[#fce7f3]/25 to-transparent dark:from-[#0c1829]/50 dark:via-[#1e1029]/30 dark:to-transparent" />

        <div className="absolute top-8 left-[18%] w-3 h-3 bg-pink-300/80 rounded-full blur-[0.4px] transform rotate-45" />
        <div className="absolute top-20 right-[28%] w-4 h-2 bg-pink-400/70 rounded-full blur-[0.4px] transform rotate-12" />
        <div className="absolute top-1/2 left-[8%] w-3 h-2 bg-pink-300/80 rounded-full transform -rotate-45" />
        <div className="absolute bottom-20 right-[12%] w-3.5 h-2 bg-pink-300/80 rounded-full transform rotate-30" />
      </div>

      <div className="hidden 2xl:flex absolute left-4 top-28 flex-col items-center pointer-events-none z-10">
        <div className="w-8 py-4 bg-[#7f1d1d]/90 text-pink-200 border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center font-jp-impact text-xs font-black tracking-widest leading-loose">
          <span>継</span>
          <span>続</span>
          <span>は</span>
          <span>力</span>
          <span>な</span>
          <span>り</span>
        </div>
        <div className="w-0.5 h-16 bg-black dark:bg-stone-600 mt-0.5" />
      </div>

      <div className="hidden 2xl:block absolute right-4 top-20 pointer-events-none z-10 text-stone-500 dark:text-stone-400 select-none">
        <div
          className="font-jp-impact text-xs sm:text-sm tracking-widest font-black leading-loose opacity-70"
          style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
        >
          コードから 現実のプロダクトへ
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 relative px-2 sm:px-4">
        <div>

          <div className="flex items-center gap-2 mb-1.5 font-mono-tech text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
            <span className="text-stone-500">/// 02</span>
            <span className="font-jp-impact text-black dark:text-white tracking-wider text-sm sm:text-base">
              作品集.
            </span>
          </div>

          <div className="relative inline-block">
            <InkText
              as="h2"
              text="Proof of Work"
              strokeWidth="1.5px"
              delay={120}
              duration={2000}
              className="font-brush text-5xl sm:text-6xl md:text-7xl lg:text-8xl italic tracking-tight text-black dark:text-white uppercase leading-none drop-shadow-sm"
            />

            <span className="absolute -left-2 -right-4 bottom-1 sm:bottom-2 md:bottom-3 h-[45%] bg-[#39FF14] -z-10 -rotate-1 skew-x-[-14deg] rounded-sm shadow-sm pointer-events-none" />
          </div>

          <div className="mt-4 inline-block">
            <div className="font-mono-tech text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 uppercase tracking-wider space-y-0.5">
              <div>Real projects.</div>
              <div>Real demos.</div>
              <div>Real impact.</div>
            </div>

            <div className="w-20 h-1.5 bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-transparent rounded-full mt-1.5 transform -rotate-1" />
          </div>
        </div>

        <div className="self-end md:mr-12 lg:mr-24 flex flex-col items-center select-none transform rotate-[-3deg]">
          <div className="font-handwriting text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 font-bold tracking-wide flex items-center gap-2">
            <span>Click to watch</span>
          </div>
          <div className="font-handwriting text-xl sm:text-2xl text-stone-600 dark:text-stone-300 -mt-1 font-bold">
            real demos
          </div>

          <svg
            className="w-12 h-10 text-stone-800 dark:text-stone-200 transform translate-x-3 -rotate-12 mt-1 stroke-current"
            viewBox="0 0 60 40"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 8 Q 38 4, 46 28" />
            <path d="M38 24 L 46 28 L 46 18" />
          </svg>
        </div>
      </div>

      <div className="relative pt-6 pb-4">

        <div className="hidden md:flex items-center justify-center relative w-full min-h-[580px] overflow-visible">
          {PROJECTS_DATA.map((project, idx) => {
            const isCenter = idx === 2;
            const style = getCardStyle(idx);

            return (
              <div
                key={project.id}
                style={{
                  ...style,
                  marginLeft: idx === 0 ? '0' : '-3.5rem',
                  transition: 'all 0.35s cubic-bezier(0.34, 1.4, 0.64, 1)'
                }}
                className="flex-shrink-0"
              >
                <UnfoldPanel
                  direction="right"
                  duration={1000}
                  delay={80 + idx * 85}
                  className="rounded-xl overflow-hidden"
                >
                  <div
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-[270px] lg:w-[285px] xl:w-[305px] bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-xl overflow-hidden cursor-pointer transition-shadow duration-300 relative ${isCenter || activeIndex === idx
                        ? 'shadow-[8px_8px_0px_#000000] dark:shadow-[8px_8px_0px_#000000,0_0_20px_rgba(190,242,100,0.2)]'
                        : 'shadow-[5px_5px_0px_#000000] hover:shadow-[8px_8px_0px_#000000]'
                      }`}
                  >

                    <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24]">
                      <div className="flex items-center gap-2">
                        <span className="bg-black text-white font-mono-tech font-bold text-xs px-2 py-0.5 rounded-sm">
                          {project.num}
                        </span>
                        <span className="font-mono-tech text-[10px] sm:text-xs font-bold text-stone-800 dark:text-stone-300 tracking-wider">
                          {project.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-[2px] opacity-75">
                        <span className="w-[1.5px] h-4 bg-black dark:bg-white" />
                        <span className="w-[3px] h-4 bg-black dark:bg-white" />
                        <span className="w-[1px] h-4 bg-black dark:bg-white" />
                        <span className="w-[2px] h-4 bg-black dark:bg-white" />
                        <span className="w-[1px] h-4 bg-black dark:bg-white" />
                        <span className="w-[3px] h-4 bg-black dark:bg-white" />
                        <span className="w-[1.5px] h-4 bg-black dark:bg-white" />
                      </div>
                    </div>

                    <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-black dark:border-stone-700 bg-stone-900 group">
                      <img
                        src={project.img}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVideoModal(project);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors"
                      >
                        <button
                          aria-label={`Play demo for ${project.title}`}
                          className="w-11 h-11 rounded-full bg-black/80 hover:bg-[#39FF14] border-2 border-white text-white hover:text-black flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 active:scale-95"
                        >
                          <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 flex flex-col justify-between h-[235px]">
                      <div>

                        <div className="flex items-center justify-between gap-1 mb-1">
                          <InkText
                            as="h3"
                            text={project.title}
                            strokeWidth="1.2px"
                            delay={250 + idx * 80}
                            duration={1600}
                            className="font-bold text-lg sm:text-xl font-heading text-black dark:text-white tracking-tight"
                          />
                          {renderBadgeIcon(project.badgeType)}
                        </div>

                        <div className="text-[11px] font-mono-tech font-bold text-stone-600 dark:text-stone-400 mb-2 leading-tight">
                          {project.subtitle}
                        </div>

                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-3 mb-3">
                          {project.desc}
                        </p>
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono-tech text-[10px] font-bold px-2 py-0.5 bg-white dark:bg-stone-900 border border-black/30 dark:border-stone-700 text-stone-800 dark:text-stone-300 rounded shadow-[1px_1px_0px_#000]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveVideoModal(project);
                            }}
                            className="flex items-center gap-1.5 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-mono-tech font-bold text-[11px] px-2.5 py-1.5 border border-black rounded shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition-transform cursor-pointer"
                          >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            <span>WATCH DEMO</span>
                          </button>

                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Open live project"
                              className="flex items-center gap-1 text-[11px] font-mono-tech font-bold text-stone-800 dark:text-stone-200 hover:text-black dark:hover:text-[#39FF14] border border-black/20 dark:border-stone-700 hover:border-black dark:hover:border-[#39FF14] px-2 py-1 rounded transition-colors"
                            >
                              <span>LIVE SITE</span>
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </UnfoldPanel>
              </div>
            );
          })}
        </div>

        <div className="flex md:hidden items-center gap-4 overflow-x-auto pb-6 pt-2 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {PROJECTS_DATA.map((project, idx) => (
            <UnfoldPanel
              key={project.id}
              direction="right"
              duration={900}
              delay={80 + idx * 60}
              className="flex-shrink-0 w-[275px] rounded-xl overflow-hidden snap-center"
            >
              <div
                onClick={() => setActiveIndex(idx)}
                className="w-full bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-xl overflow-hidden shadow-[5px_5px_0px_#000]"
              >

                <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24]">
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white font-mono-tech font-bold text-xs px-2 py-0.5 rounded-sm">
                      {project.num}
                    </span>
                    <span className="font-mono-tech text-[10px] font-bold text-stone-800 dark:text-stone-300">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-black dark:border-stone-700 bg-stone-900">
                  <img
                    src={project.img}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoModal(project);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20"
                  >
                    <button className="w-10 h-10 rounded-full bg-black/80 text-white border-2 border-white flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <InkText
                      as="h3"
                      text={project.title}
                      strokeWidth="1.2px"
                      delay={200 + idx * 60}
                      duration={1600}
                      className="font-bold text-lg font-heading text-black dark:text-white"
                    />
                    {renderBadgeIcon(project.badgeType)}
                  </div>
                  <div className="text-[11px] font-mono-tech font-bold text-stone-600 dark:text-stone-400 mb-1.5 leading-tight">
                    {project.subtitle}
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-2 mb-3">
                    {project.desc}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono-tech text-[9px] font-bold px-1.5 py-0.5 bg-white dark:bg-stone-900 border border-black/30 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideoModal(project);
                      }}
                      className="flex items-center gap-1 bg-[#39FF14] text-black font-mono-tech font-bold text-[10px] px-2.5 py-1 border border-black rounded shadow-[2px_2px_0px_#000]"
                    >
                      ▶ WATCH DEMO
                    </button>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono-tech font-bold text-stone-800 dark:text-stone-200 hover:text-black dark:hover:text-[#39FF14]"
                      >
                        LIVE DEMO ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </UnfoldPanel>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
          <button
            onClick={prevCard}
            aria-label="Previous card"
            className="w-8 h-8 rounded-full border border-black dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-[#39FF14] hover:text-black transition-colors"
          >
            &lt;
          </button>

          <div className="flex items-center gap-2">
            {PROJECTS_DATA.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${idx === activeIndex
                    ? 'w-3 h-3 bg-black dark:bg-[#39FF14] scale-110 shadow-sm'
                    : 'w-2 h-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-500'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            aria-label="Next card"
            className="w-8 h-8 rounded-full border border-black dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-[#39FF14] hover:text-black transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-2 pr-4 sm:pr-12 lg:pr-24 select-none">
        <div className="font-handwriting text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 font-bold tracking-wide transform rotate-[-4deg] text-right">
          <div>From Ideas</div>
          <div className="text-stone-600 dark:text-stone-400">to Impact.</div>
        </div>
      </div>

      {activeVideoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="bg-[#faf8f5] dark:bg-[#16161a] border-2 border-black dark:border-stone-700 w-full max-w-4xl rounded-xl overflow-hidden shadow-[10px_10px_0px_#000] relative"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between px-4 py-2.5 bg-black text-white font-mono-tech text-xs sm:text-sm font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-ping" />
                <span>
                  DEMO STREAM // {activeVideoModal.num} {activeVideoModal.title.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="hover:text-[#ef4444] px-2 py-0.5 border border-white/30 rounded transition-colors"
              >
                [ ESC / ✕ ]
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                src={activeVideoModal.video}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black dark:border-stone-700">
              <div>
                <h4 className="font-bold font-heading text-lg text-black dark:text-white">
                  {activeVideoModal.title} — {activeVideoModal.subtitle}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  {activeVideoModal.desc}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeVideoModal.codeUrl && (
                  <a
                    href={activeVideoModal.codeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-black dark:text-white px-3 py-1.5 rounded font-mono-tech text-xs font-bold border border-black dark:border-stone-700"
                  >
                    GitHub Source
                  </a>
                )}
                {activeVideoModal.liveUrl && (
                  <a
                    href={activeVideoModal.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#39FF14] hover:bg-[#7CFF5E] text-black px-3.5 py-1.5 rounded font-mono-tech text-xs font-bold border border-black shadow-[2px_2px_0px_#000]"
                  >
                    Launch App ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
