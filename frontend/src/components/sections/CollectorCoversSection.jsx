import React from 'react';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

export default function CollectorCoversSection() {
  const covers = [
    {
      vol: 'VOL. 01',
      type: 'TECH-IP TITLE // ISSUE 01',
      badge: 'NEO TOKYO',
      badgeColor: 'bg-black text-white',
      spine: 'NEO-SEOUL',
      sfx: '*CLACK!*',
      img: '/assets/cover_seoul.jpg',
      subTag: 'TARGET: GEN-Z DIGITAL',
      title: 'NEO-SEOUL CHRONICLES',
      subtitle: 'BRAND LAUNCH // 3D WEB PORTAL & DIGITAL COMIC',
      desc: 'Immersive episodic launch portal for a modern digital webtoon platform. World-gen site architecture, sound design, and specialized dynamic comic reader UI across 100+ issues.',
      metricHeader: 'CLIENT METRICS // SEOUL, TOKYO, NYC',
      metricBody: 'Redefined how people consume digital webtoon serialized content with over 2.4M unique users in first 48 hours.',
      linkText: 'ACCESS COLLECTOR ARCHIVE FILE'
    },
    {
      vol: 'VOL. 02',
      type: 'PROD // SPEED RUN',
      badge: '0.78s LATENCY',
      badgeColor: 'bg-[#ef4444] text-white',
      spine: 'WARP TUNNEL',
      sfx: '*FLASH!*',
      img: '/assets/cover_tunnel.jpg',
      subTag: 'FRAME RATE: 120',
      title: 'CYBER HYPER-TUNNEL',
      subtitle: 'HYPER SPEED PERFORMANCE RACING EXPERIENCE',
      desc: 'Real-time dynamic WebGL experience designed for modern automotive launch. Hyper-speed particle shaders, audio-reactive sound design, and custom 3D web showcase.',
      metricHeader: 'TOTAL TESTED USERS',
      metricBody: 'Over 1.5M interactive sessions with average page duration exceeding 4 minutes 30 seconds.',
      linkText: 'ACCESS SIMULATION ARCHIVE FILE'
    },
    {
      vol: 'VOL. 03',
      type: 'WEB // MANHWA ART',
      badge: 'SURVEILLANCE',
      badgeColor: 'bg-[#bef264] text-black',
      spine: 'PROTOCOL',
      sfx: '*DOOM!*',
      img: '/assets/cover_protocol.jpg',
      subTag: 'STATUS: DEPLOYED',
      title: 'GHOST PROTOCOL',
      subtitle: 'SECRET CLASSIFIED IP & DIGITAL COMIC SERIES',
      desc: 'Creative direction and dark atmospheric webtoon lore site for an international media franchise. Dark mode visual system, secret interactive dossiers, and encrypted stylized cipher reveals.',
      metricHeader: 'COMMUNITY ENGAGEMENT',
      metricBody: 'Generated 80,000 fan fanarts and created viral footprint within 72 hours of first release drop.',
      linkText: 'ACCESS PROTOCOL DOSSIER FILE'
    }
  ];

  return (
    <section id="covers" className="relative px-3 sm:px-6 py-12 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6 pb-2 border-b-2 border-black dark:border-[#38383e]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="bg-[#bef264] text-black font-mono-tech text-xs font-bold px-2.5 py-0.5 border border-black uppercase">
            CHAPTER 03 // ARCHIVED WORK
          </span>
          <InkText
            as="h2"
            strokeWidth="1.2px"
            delay={150}
            duration={2200}
            className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading tracking-tight text-black dark:text-white"
            text="CASE FILES : COLLECTOR COVERS"
          />
        </div>

        <div className="text-right font-mono-tech text-[10px] sm:text-xs text-stone-600 dark:text-stone-400 hidden md:block">
          <div>ARCHIVE CLEARANCE: UNRESTRICTED</div>
          <div className="font-bold text-black dark:text-white">EDITION: COLLECTOR MANHWA 2026</div>
        </div>
      </div>

      {/* 3 Collector Covers Grid with Canvas Unroll Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {covers.map((c, idx) => (
          <UnfoldPanel
            key={idx}
            direction="right"
            duration={1100}
            delay={120 + idx * 130}
            className="border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] manga-shadow hover:-translate-y-1.5 transition-transform flex flex-col justify-between p-3.5 group"
          >
            <div>
              {/* Card Header Strip */}
              <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-2 mb-2 border-b border-black dark:border-[#27272a]">
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white font-bold px-1.5 py-0.2">
                    {c.vol}
                  </span>
                  <span className="text-stone-600 dark:text-stone-400 font-medium">[{c.type}]</span>
                </div>
                <span className={`font-mono-tech font-bold text-[9px] px-1.5 py-0.2 border border-black dark:border-stone-700 ${c.badgeColor}`}>
                  {c.badge}
                </span>
              </div>

              {/* Artwork Box with Vertical Spine Title on Left */}
              <div className="relative border-2 border-black dark:border-stone-800 overflow-hidden bg-stone-950 aspect-square flex">
                {/* Vertical Spine Banner */}
                <div className="w-8 sm:w-9 bg-white dark:bg-[#1c1c21] border-r-2 border-black dark:border-stone-800 z-20 flex flex-col items-center justify-center py-2 select-none">
                  <span
                    className="font-heading text-[11px] sm:text-xs font-black tracking-widest uppercase"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'upright',
                      color: idx === 0 ? '#38bdf8' : idx === 1 ? '#ef4444' : '#bef264'
                    }}
                  >
                    {c.spine}
                  </span>
                </div>

                {/* Cover Image with lazy loading & async decoding */}
                <div className="relative flex-1 h-full overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Halftone Screentone overlay */}
                  <div className="absolute inset-0 manga-halftone-light opacity-20 pointer-events-none" />

                  {/* Sub-tag in bottom left of image */}
                  <div className="absolute bottom-2 left-2 z-20">
                    <span className="bg-black text-[#bef264] font-mono-tech text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 border border-black dark:border-stone-700">
                      {c.subTag}
                    </span>
                  </div>

                  {/* SFX sticker in bottom right of image */}
                  <div className="absolute bottom-2 right-2 z-20">
                    <div className="bg-white/95 dark:bg-black/95 border border-black dark:border-stone-700 px-2 py-0.5 manga-shadow-sm transform -rotate-6 shadow-sm">
                      <span className="font-heading text-xs sm:text-sm text-[#ef4444] font-black tracking-wider">
                        {c.sfx}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-3.5 mb-2">
                <InkText
                  as="h3"
                  strokeWidth="1.2px"
                  delay={180 + idx * 80}
                  duration={2000}
                  className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-black dark:text-white group-hover:text-[#ef4444] transition-colors"
                  text={c.title}
                />
                <TypewriterText
                  speed={15}
                  delay={300 + idx * 60}
                  cursor={false}
                  className="text-[10px] font-mono-tech font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2"
                  text={c.subtitle}
                />
                <TypewriterText
                  speed={12}
                  delay={380 + idx * 60}
                  className="text-stone-700 dark:text-stone-300 text-xs leading-relaxed min-h-[3.8em]"
                  text={c.desc}
                />
              </div>

              {/* Metric Callout Box */}
              <div className="bg-stone-100 dark:bg-[#18181c] border border-black dark:border-stone-800 p-2.5 my-3 text-[11px] font-mono-tech">
                <div className="text-stone-500 dark:text-stone-400 font-bold text-[9px] uppercase tracking-wider mb-1">
                  [ {c.metricHeader} ]
                </div>
                <div className="text-stone-900 dark:text-stone-200 font-medium leading-tight">
                  "{c.metricBody}"
                </div>
              </div>
            </div>

            {/* Access Link Button */}
            <div className="pt-2 border-t border-black dark:border-[#27272a]">
              <a
                href="#contact"
                className="w-full bg-black dark:bg-[#18181c] hover:bg-stone-800 dark:hover:bg-stone-900 text-white font-mono-tech font-bold text-[10px] sm:text-[11px] py-2 px-3 flex items-center justify-between transition-colors cursor-pointer border border-transparent dark:border-stone-800"
              >
                <span>[ {c.linkText} ]</span>
                <span className="text-[#bef264]">→</span>
              </a>
            </div>
          </UnfoldPanel>
        ))}
      </div>
    </section>
  );
}

