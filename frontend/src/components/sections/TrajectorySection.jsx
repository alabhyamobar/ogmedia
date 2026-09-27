import React, { useState, useEffect, useRef, useCallback } from 'react';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

/**
 * Story Pillars Data Configuration
 * Titles: INFLUENCER MARKETING, MEME MARKETING, META ADS, PREMIUM BRANDS, SCALE STAGE
 */
const STORY_PILLARS = [
  {
    id: 'influencer-marketing',
    title: 'INFLUENCER MARKETING',
    code: 'PILLAR 01 // CREATOR NETWORK',
    subtitle: 'HIGH-AFFINITY CREATOR ALLIANCES',
    description: 'We orchestrate high-affinity creator networks, bespoke talent integrations, and viral ambassador campaigns that build authentic audience trust and explosive conversion velocity.',
    videoSrc: '/ogmedia/videos/service_influencer.mp4',
    poster: '/ogmedia/assets/service_influencer.jpg',
    sfxBadge: 'VIRAL IMPACT',
    dialogueTag: 'DIRECTOR // TALENT STRATEGY',
    dialogueQuote: '"CREATORS DON’T JUST ENDORSE — THEY IGNITE CULTURAL CONVERSATION."',
    statLabel: 'VIRAL REACH',
    statValue: '+450% ENGAGEMENT',
    resolution: '3840 x 2160 // 120 FPS',
    accentColor: '#38bdf8'
  },
  {
    id: 'meme-marketing',
    title: 'MEME MARKETING',
    code: 'PILLAR 02 // VIRAL VELOCITY',
    subtitle: 'CULTURE-FIRST SOCIAL DOMINANCE',
    description: 'Rapid-response trend engineering, high-share format iteration, and relatable humor designed to hack social algorithms and spark organic repost cascades across millions of feeds.',
    videoSrc: '/ogmedia/videos/service_meme.mp4',
    poster: '/ogmedia/assets/service_meme.jpg',
    sfxBadge: 'ALGORITHM BREAK',
    dialogueTag: 'CULTURE LEAD // TREND LAB',
    dialogueQuote: '"IF A CAMPAIGN CAN BE MEMED, IT DOMINATES THE INTERNET."',
    statLabel: 'ORGANIC REACH',
    statValue: '10M+ IMPRESSIONS',
    resolution: '1920 x 1080 // 60 FPS',
    accentColor: '#bef264'
  },
  {
    id: 'meta-ads',
    title: 'META ADS',
    code: 'PILLAR 03 // PERFORMANCE FUNNELS',
    subtitle: 'PRECISION ROAS ARCHITECTURE',
    description: 'Data-driven paid media frameworks, AI-assisted creative testing, and high-converting performance funnels across Instagram, Facebook, and TikTok engineered for sustainable customer acquisition.',
    videoSrc: '/ogmedia/videos/service_meta_ads.mp4',
    poster: '/ogmedia/assets/service_meta_ads.jpg',
    sfxBadge: 'MAX ROAS',
    dialogueTag: 'HEAD OF GROWTH // MEDIA BUYING',
    dialogueQuote: '"HIGH-VELOCITY CREATIVE ITERATION MEETS MATHEMATICAL ROAS PRECISION."',
    statLabel: 'PERFORMANCE',
    statValue: '4.8X AVG ROAS',
    resolution: '4K ULTRA-HD // 60 FPS',
    accentColor: '#ef4444'
  },
  {
    id: 'premium-brands',
    title: 'PREMIUM BRANDS',
    code: 'PILLAR 04 // LUXURY WORLD CRAFT',
    subtitle: 'ELEVATED BRAND IMMERSION',
    description: 'High-end visual identity, bespoke 3D brand worldbuilding, and cinematic art direction that elevates market positioning to tier-one global prestige.',
    videoSrc: '/ogmedia/videos/service_premium_brands.mp4',
    poster: '/ogmedia/assets/service_premium_brands.jpg',
    sfxBadge: 'TIER-1 LUXURY',
    dialogueTag: 'EXECUTIVE CREATIVE DIRECTOR',
    dialogueQuote: '"BUILDING WORLDS SO IMMERSIVE THAT YOUR BRAND BECOMES UNFORGETTABLE."',
    statLabel: 'POSITIONING',
    statValue: 'TIER-1 STATUS',
    resolution: '3840 x 2160 // MASTER CUT',
    accentColor: '#c084fc'
  },
  {
    id: 'scale-stage',
    title: 'SCALE STAGE',
    code: 'PILLAR 05 // GLOBAL EXPANSION',
    subtitle: 'ENTERPRISE DISTRIBUTION ENGINE',
    description: 'Enterprise-grade omnichannel amplification, global audience expansion, and automated growth flywheels that transform breakout brands into category leaders.',
    videoSrc: '/ogmedia/videos/service_scale_stage.mp4',
    poster: '/ogmedia/assets/service_scale_stage.jpg',
    sfxBadge: 'HYPER SCALE',
    dialogueTag: 'CHIEF STRATEGY OFFICER',
    dialogueQuote: '"FROM INITIAL PRODUCT TRACTION TO WORLDWIDE MARKET DOMINATION."',
    statLabel: 'EXPANSION',
    statValue: 'OMNICHANNEL SCALE',
    resolution: '4K CINEMATIC // HDR',
    accentColor: '#f59e0b'
  }
];

export default function TrajectorySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [timerProgress, setTimerProgress] = useState(0);
  const videoRef = useRef(null);

  const currentPillar = STORY_PILLARS[currentIndex];
  const slideDuration = 6000; // 6 seconds per slide

  // Navigation callbacks
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % STORY_PILLARS.length);
    setTimerProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + STORY_PILLARS.length) % STORY_PILLARS.length);
    setTimerProgress(0);
  }, []);

  const handleSelect = useCallback((index) => {
    setCurrentIndex(index);
    setTimerProgress(0);
  }, []);

  // Auto change timer logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const intervalTime = 50;
    const step = (intervalTime / slideDuration) * 100;

    const interval = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isAutoPlaying, handleNext, slideDuration]);

  // Restart video playback when slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <section id="story" className="relative px-3 sm:px-6 py-16 sm:py-20 max-w-[1440px] mx-auto select-none">
      {/* Section Header: Matching the website manga/anime theme */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12 relative px-2">
        <div>
          {/* Prefix Tag: /// 00 物語. */}
          <div className="flex items-center gap-2 mb-2 font-mono-tech text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
            <span className="text-stone-500">/// 00</span>
            <span className="font-jp-impact text-black dark:text-white tracking-wider text-sm sm:text-base">
              物語.
            </span>
            <span className="bg-[#ef4444] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-0.5 border border-black dark:border-stone-800 uppercase shadow-sm">
              CHAPTER 01 // THE TRAJECTORY
            </span>
          </div>

          {/* Main Title: The Story — Beyond Static Pixels with InkText and brushed font */}
          <div className="relative inline-block">
            <InkText
              as="h2"
              text="The Story — Beyond Static Pixels"
              strokeWidth="1.5px"
              delay={120}
              duration={2000}
              className="font-brush text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic tracking-tight text-black dark:text-white uppercase leading-none drop-shadow-sm"
            />
            {/* Vivid Neon Brushed Highlighter */}
            <span className="absolute -left-2 -right-4 bottom-1 sm:bottom-2 h-[45%] bg-[#bef264] -z-10 -rotate-1 skew-x-[-14deg] rounded-sm shadow-sm pointer-events-none" />
          </div>

          {/* Subtitle with Pink Energetic Brush Underline */}
          <div className="mt-4 inline-block">
            <div className="font-mono-tech text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider space-y-0.5">
              <div>Interactive Video Capabilities Pipeline.</div>
              <div>05 Core Growth Trajectory Stages.</div>
              <div>Cinematic Storyboards In Motion.</div>
            </div>
            {/* Pink stroke */}
            <div className="w-20 h-1.5 bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-transparent rounded-full mt-1.5 transform -rotate-1" />
          </div>
        </div>

        {/* Hand-Drawn Annotation on Top Right */}
        <div className="self-end md:mr-6 flex flex-col items-center select-none transform rotate-[-2deg]">
          <div className="font-handwriting text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 font-bold tracking-wide">
            <span>Watch interactive</span>
          </div>
          <div className="font-handwriting text-xl sm:text-2xl text-stone-600 dark:text-stone-400 -mt-1 font-bold">
            story trajectory
          </div>
          <svg
            className="w-10 h-8 text-stone-800 dark:text-stone-200 transform translate-x-2 -rotate-12 stroke-current"
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

      {/* Comic Panels Grid with UnfoldPanel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Landscape Video Showcase + Dynamic Pillar Narrative          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Main Panel 01-A Landscape Video Player */}
          <UnfoldPanel direction="right" duration={1100} delay={150} className="rounded-3xl">
            <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-3 sm:p-4 rounded-3xl manga-shadow hover:manga-shadow-lg transition-all">
              
              {/* Panel Top Info Strip */}
              <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-2 mb-2 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24] px-3 py-1.5 rounded-lg text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0284c7] dark:text-[#38bdf8]">
                    PANEL 01-A // {currentPillar.code}
                  </span>
                  <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(STORY_PILLARS.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Status & Auto-play indicator */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`text-[9px] font-bold font-mono-tech px-2.5 py-1 border border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer transition-colors ${
                      isAutoPlaying ? 'bg-[#bef264] text-black' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                    title={isAutoPlaying ? 'Click to Pause auto-slide' : 'Click to Resume auto-slide'}
                  >
                    {isAutoPlaying ? '⚡ AUTO-ROTATING' : '⏸ PAUSED'}
                  </button>
                </div>
              </div>

              {/* Panel Video Container */}
              <div 
                className="relative border-2 border-black dark:border-stone-800 rounded-2xl overflow-hidden bg-black aspect-[16/10] sm:aspect-[16/9] group select-none shadow-inner"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {/* Active Video Player */}
                <video
                  ref={videoRef}
                  key={currentPillar.id}
                  src={currentPillar.videoSrc}
                  poster={currentPillar.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover object-center transition-opacity duration-300"
                />

                {/* Halftone / Screentone Texture Overlay */}
                <div className="absolute inset-0 manga-halftone-light opacity-15 pointer-events-none" />

                {/* Top-Left English SFX Badge */}
                <div className="absolute top-3 left-3 z-20 group/sfx">
                  <div 
                    className="border-2 border-black px-3 py-1 manga-shadow-sm rounded transform -rotate-3 transition-transform group-hover/sfx:scale-105"
                    style={{ backgroundColor: currentPillar.accentColor }}
                  >
                    <span className="font-heading text-lg sm:text-xl text-black font-black tracking-wider">
                      {currentPillar.sfxBadge}!
                    </span>
                  </div>
                </div>

                {/* Top-Right Resolution Tag */}
                <div className="absolute top-3 right-3 z-20">
                  <span className="bg-black/85 text-white border border-stone-700 font-mono-tech text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded shadow-md">
                    {currentPillar.statValue}
                  </span>
                </div>

                {/* Center Playback Controls: FORWARD & REVERSE BUTTONS */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 z-30 pointer-events-none">
                  {/* REVERSE / PREV BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="pointer-events-auto bg-black/80 hover:bg-[#bef264] text-white hover:text-black border-2 border-white hover:border-black w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm sm:text-base manga-shadow-sm transition-all duration-150 transform hover:-translate-x-0.5 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    title="Previous: Reverse Video"
                  >
                    ◀
                  </button>

                  {/* FORWARD / NEXT BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="pointer-events-auto bg-black/80 hover:bg-[#bef264] text-white hover:text-black border-2 border-white hover:border-black w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm sm:text-base manga-shadow-sm transition-all duration-150 transform hover:translate-x-0.5 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    title="Next: Forward Video"
                  >
                    ▶
                  </button>
                </div>

                {/* Bottom Dialogue Box Overlay */}
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20">
                  <div className="bg-black/90 backdrop-blur-xs text-white border-2 border-[#38bdf8] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono-tech manga-shadow shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                    <div className="text-[#38bdf8] text-[9px] sm:text-[10px] font-bold">
                      [ {currentPillar.dialogueTag} ]
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm tracking-wide mt-0.5 font-heading">
                      {currentPillar.dialogueQuote}
                    </div>
                  </div>
                </div>

                {/* Video Timeline Progress Strip (for auto-slide) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-30 overflow-hidden">
                  <div
                    className="h-full bg-[#bef264] transition-all duration-75"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              </div>

              {/* Panel Footer Specs & Slide Dots */}
              <div className="flex items-center justify-between font-mono-tech text-[9px] sm:text-[10px] pt-2 mt-2 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5">
                  {STORY_PILLARS.map((pillar, idx) => (
                    <button
                      key={pillar.id}
                      onClick={() => handleSelect(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'bg-[#bef264] w-6 border border-black'
                          : 'bg-stone-300 dark:bg-stone-700 w-2 hover:bg-stone-400'
                      }`}
                      title={`Jump to ${pillar.title}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-stone-500">RES: {currentPillar.resolution}</span>
                  <span className="font-bold text-[#38bdf8] uppercase">{currentPillar.title}</span>
                </div>
              </div>
            </div>
          </UnfoldPanel>

          {/* Dynamic Content Panel 01-C: Title + Short Description Below Video */}
          <UnfoldPanel direction="right" duration={1000} delay={250} className="rounded-3xl">
            <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-5 sm:p-6 rounded-3xl manga-shadow">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="bg-black text-[#bef264] font-mono-tech text-[10px] font-bold px-2.5 py-0.5 rounded border border-stone-800 shadow-sm">
                  PANEL 01-C [ {currentPillar.code} ]
                </span>
                <span className="text-[10px] font-mono-tech font-bold text-stone-500 dark:text-stone-400">
                  {currentPillar.subtitle}
                </span>
              </div>

              {/* Dynamic Pillar Title with InkText */}
              <div className="mb-2">
                <InkText
                  as="h3"
                  key={`title-${currentIndex}`}
                  text={currentPillar.title}
                  strokeWidth="1.2px"
                  delay={100}
                  duration={1600}
                  className="text-2xl sm:text-3xl font-black font-heading text-black dark:text-white uppercase tracking-tight"
                />
              </div>

              {/* Dynamic Short Description */}
              <p 
                key={`desc-${currentIndex}`}
                className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 min-h-[3.5em] animate-fade-in font-medium"
              >
                {currentPillar.description}
              </p>

              {/* Quick Interactive Pillar Selector Tabs */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                <div className="text-[9px] font-mono-tech text-stone-500 uppercase font-bold mb-2">
                  SELECT STAGE TO PREVIEW VIDEO:
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {STORY_PILLARS.map((pillar, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={pillar.id}
                        onClick={() => handleSelect(idx)}
                        className={`font-mono-tech text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#bef264] text-black border-black manga-shadow-sm font-black scale-105'
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-black/30 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        {pillar.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </UnfoldPanel>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Panel 01-B Solo Leveling Core Focus                         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Main Panel 01-B Frame with Canvas Unroll */}
          <UnfoldPanel direction="right" duration={1100} delay={200} className="rounded-3xl">
            <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-3 sm:p-4 rounded-3xl manga-shadow hover:manga-shadow-lg transition-all">
              
              {/* Panel Top Info Strip */}
              <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-2 mb-2 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24] px-3 py-1.5 rounded-lg text-stone-700 dark:text-stone-300">
                <span className="font-bold text-[#ef4444]">
                  PANEL 01-B // HARD CUT FOCUS
                </span>
                <span className="bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-bold px-2 py-0.5 rounded border border-black dark:border-stone-800 text-[9px] shadow-sm">
                  CORE // 02
                </span>
              </div>

              {/* Panel Image Container */}
              <div className="relative border-2 border-black dark:border-stone-800 rounded-2xl overflow-hidden bg-stone-950 aspect-[4/5] shadow-inner">
                <img
                  src="/ogmedia/assets/akashhero.jpg"
                  alt="Akash hero illustration"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />

                {/* Top-Right Badge: Solo Leveling Aesthetic */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <div className="bg-gradient-to-r from-[#bef264] to-[#10b981] text-black border border-black font-mono-tech text-[9px] font-black px-2.5 py-1 rounded manga-shadow-sm shadow-[0_0_10px_rgba(190,242,100,0.4)]">
                    SOLO LEVELING AESTHETIC // LV.99
                  </div>
                </div>

                {/* Bottom Dialogue Box with InkText */}
                <div className="absolute bottom-3 left-3 right-3 z-20">
                  <div className="bg-white/95 dark:bg-[#18181c]/95 text-black dark:text-white border-2 border-[#ef4444] dark:border-[#f43f5e] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono-tech manga-shadow shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                    <div className="text-[#ef4444] text-[10px] font-bold">[ DIALOGUE 01-B // LEAD ARTIST ]</div>
                    <InkText
                      as="div"
                      strokeWidth="1.2px"
                      delay={300}
                      duration={2000}
                      className="font-bold text-black dark:text-white text-sm sm:text-base tracking-tight font-heading mt-0.5"
                      text='"WE BUILD WORLDS."'
                    />
                  </div>
                </div>
              </div>

              {/* Panel Footer Specs */}
              <div className="flex items-center justify-between font-mono-tech text-[9px] sm:text-[10px] pt-2 mt-2 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                <span>ENERGY: CORE OVERDRIVE</span>
                <span className="font-bold text-[#ef4444]">STATUS: MAXIMUM FOCUS</span>
              </div>
            </div>
          </UnfoldPanel>

          {/* Under-Panel Dialogue Box with UnfoldPanel & InkText */}
          <UnfoldPanel direction="right" duration={1000} delay={300} className="rounded-3xl">
            <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-5 sm:p-6 rounded-3xl manga-shadow">
              <div className="text-stone-500 dark:text-stone-400 font-mono-tech text-[10px] font-bold mb-1">
                [ SECONDARY REPORT // ARCHIVE - 02 ]
              </div>
              <InkText
                as="h3"
                strokeWidth="1.2px"
                delay={200}
                duration={2000}
                className="text-lg sm:text-xl font-bold font-heading text-black dark:text-white mb-2"
                text='"WE TURN IDEAS INTO UNFORGETTABLE EXPERIENCES."'
              />
              <TypewriterText
                speed={14}
                delay={400}
                className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed min-h-[3em]"
                text="From brand worldbuilding to global cultural footprint, our creative frameworks merge comic-paced storytelling with high-converting marketing velocity."
              />
            </div>
          </UnfoldPanel>
        </div>
      </div>

      {/* Storyboard Engine Footer Strip */}
      <div className="mt-8 border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[10px] sm:text-xs manga-shadow">
        <div className="text-stone-600 dark:text-stone-400">
          L/R: 05 GROWTH STAGES // DYNAMIC VIDEO PIPELINE
        </div>
        <div className="text-stone-900 dark:text-stone-200 font-bold">
          STORYBOARDING ENGINE // CELL NO. 23 // TOTAL CELLS: 104 LOADED
        </div>
        <div className="bg-[#bef264] text-black font-bold px-3 py-1 rounded border border-black uppercase text-[10px] shadow-[1px_1px_0px_#000]">
          READY TO LINK
        </div>
      </div>
    </section>
  );
}
