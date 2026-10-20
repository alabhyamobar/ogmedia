import React, { useState, useEffect, useRef, useCallback } from 'react';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

export { default as WhoWeAreSection } from './WhoWeAreSection';

const STORY_PILLARS = [
  {
    id: 'influencer-marketing',
    title: 'INFLUENCER MARKETING',
    code: 'STAGE 01 // CREATOR PARTNERSHIPS',
    subtitle: 'GET YOUR BRAND IN FRONT OF THE RIGHT AUDIENCE',
    description:
      'We find and partner with relevant creators who introduce your products to audiences that already trust them—helping you build awareness, credibility, and sales.',
    videoSrc: '/ogmedia/videos/service_influencer.mp4',
    poster: '/ogmedia/assets/service_influencer.webp',
    sfxBadge: 'REAL TRUST',
    dialogueTag: 'CREATOR STRATEGY',
    dialogueQuote:
      '"People trust creators they follow—and that trust can drive real buying decisions."',
    statLabel: 'RESULTS',
    statValue: '4X HIGHER ENGAGEMENT',
    resolution: 'FULL HD // 60 FPS',
    accentColor: '#38bdf8'
  },

  {
    id: 'meme-marketing',
    title: 'MEME MARKETING',
    code: 'STAGE 02 // VIRAL CONTENT',
    subtitle: 'TURN YOUR BRAND INTO CONTENT PEOPLE WANT TO SHARE',
    description:
      'We create memes and social content built around your brand that feels native to internet culture—helping you earn attention, shares, and organic reach.',
    videoSrc: '/ogmedia/videos/service_meme.mp4',
    poster: '/ogmedia/assets/service_meme.webp',
    sfxBadge: 'VIRAL BUZZ',
    dialogueTag: 'SOCIAL CONTENT LEAD',
    dialogueQuote:
      '"The best marketing does not feel like marketing—it feels worth sharing."',
    statLabel: 'EXPOSURE',
    statValue: '10M+ NATURAL VIEWS',
    resolution: 'FULL HD // 60 FPS',
    accentColor: '#39FF14'
  },

  {
    id: 'meta-ads',
    title: 'META ADS',
    code: 'STAGE 03 // TARGETED ADS',
    subtitle: 'TURN INSTAGRAM & FACEBOOK INTO SALES CHANNELS',
    description:
      'We create, launch, test, and optimize Meta ad campaigns to reach the right customers and turn your advertising budget into measurable results.',
    videoSrc: '/ogmedia/videos/service_meta_ads.mp4',
    poster: '/ogmedia/assets/service_meta_ads.webp',
    sfxBadge: 'PROFITABLE ADS',
    dialogueTag: 'PAID ADS SPECIALIST',
    dialogueQuote:
      '"We test what works, cut what does not, and scale campaigns that deliver."',
    statLabel: 'AVERAGE RETURN',
    statValue: '4.8X AD RETURN',
    resolution: 'FULL HD // 60 FPS',
    accentColor: '#ef4444'
  },

  {
    id: 'premium-brands',
    title: 'PREMIUM BRANDS',
    code: 'STAGE 04 // BRAND DESIGN',
    subtitle: 'BUILD A BRAND THAT LOOKS WORTH BUYING',
    description:
      'We design your brand identity, website, packaging, and visual content to create a consistent, premium look that makes your business stand out and feel trustworthy.',
    videoSrc: '/ogmedia/videos/service_premium_brands.mp4',
    poster: '/ogmedia/assets/service_premium_brands.webp',
    sfxBadge: 'PREMIUM LOOK',
    dialogueTag: 'CREATIVE DESIGNER',
    dialogueQuote:
      '"Strong brands make a powerful first impression before a customer reads a single word."',
    statLabel: 'PERCEPTION',
    statValue: 'TOP-TIER QUALITY',
    resolution: 'FULL HD // MASTER CUT',
    accentColor: '#c084fc'
  },

  {
    id: 'scale-stage',
    title: 'SCALE STAGE',
    code: 'STAGE 05 // FAST GROWTH',
    subtitle: 'TURN WHAT WORKS INTO SUSTAINABLE GROWTH',
    description:
      'Found the winning move? We run it everywhere. More platforms, more audiences, more customers, and the momentum never drops. This is where a brand stops climbing and starts ruling.',
    videoSrc: '/ogmedia/videos/service_scale_stage.mp4',
    poster: '/ogmedia/assets/service_scale_stage.webp',
    sfxBadge: 'LEVEL MAXED',
    dialogueTag: 'GROWTH STRATEGIST',
    dialogueQuote:
      '"Once we find what works, we don\'t guess. We scale it."',
    statLabel: 'EXPANSION',
    statValue: 'STEADY GROWTH',
    resolution: 'FULL HD // MASTER CUT',
    accentColor: '#f59e0b'
  },

  {
    id: 'website-app-design',
    title: 'WEBSITE & APP DESIGN',
    code: 'STAGE 06 // DIGITAL EXPERIENCES',
    subtitle: 'BUILD A DIGITAL EXPERIENCE PEOPLE REMEMBER',
    description:
      'We design and build modern websites and apps that look impressive, work smoothly on every device, and make it easy for visitors to understand your business and take action.',
    videoSrc: '/ogmedia/videos/service_web_app_design.mp4',
    poster: '/ogmedia/assets/service_web_app_design.webp',
    sfxBadge: 'MAX SPEED',
    dialogueTag: 'DIGITAL EXPERIENCE',
    dialogueQuote:
      '"Your website is often the first experience people have with your brand—make it count."',
    statLabel: 'PERFORMANCE',
    statValue: '<0.4S LOAD TIME',
    resolution: 'ULTRA-RESPONSIVE // 120HZ',
    accentColor: '#10b981'
  }
];

export default function TrajectorySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [timerProgress, setTimerProgress] = useState(0);
  const videoRef = useRef(null);

  const currentPillar = STORY_PILLARS[currentIndex];
  const slideDuration = 8000;

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <section
      id="trajectory"
      className="relative px-3 sm:px-6 py-16 sm:py-20 max-w-[1440px] mx-auto select-none overflow-x-hidden sm:overflow-x-visible"
    >
      <div id="what-we-do" className="absolute -top-24 left-0 pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12 relative px-2">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono-tech text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
            <span className="text-stone-500">/// 01</span>
            <span className="font-jp-impact text-black dark:text-white tracking-wider text-sm sm:text-base">
              物語.
            </span>
            <span className="bg-[#ef4444] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-0.5 border border-black dark:border-stone-800 uppercase shadow-sm">
              CHAPTER 01 // THE TRAJECTORY
            </span>
          </div>

          <div className="relative inline-block">
            <InkText
              as="h2"
              text="The Story — What We Do ?"
              strokeWidth="0.4px"
              fontWeight={400}
              delay={120}
              duration={2000}
              className="font-brush text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic tracking-wide text-black dark:text-white uppercase leading-none drop-shadow-sm font-normal"
            />
            <span className="absolute -left-2 -right-4 bottom-1 sm:bottom-2 h-[45%] bg-[#39FF14] -z-10 -rotate-1 skew-x-[-14deg] rounded-sm shadow-sm pointer-events-none" />
          </div>

          <div className="mt-4 block max-w-2xl">
            <TypewriterText
              speed={10}
              delay={300}
              className="font-mono-tech text-xs sm:text-sm font-normal text-stone-800 dark:text-stone-200 uppercase tracking-wider leading-relaxed"
              text="Every brand has a storyline. We take yours from the first post to the front page: content that spreads, creators that convert, ads that hit the target, press that makes noise, and the backend work that keeps it all running. You pick the mission. We run the whole campaign."
            />
            <div className="w-20 h-1.5 bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-transparent rounded-full mt-2.5 transform -rotate-1" />
          </div>
        </div>

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

      {/* Grid: Panel 01-A (Video Showcase) on Left, Panel 01-C (Details & Stages) on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Panel 01-A Video Showcase */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <UnfoldPanel direction="right" duration={1100} delay={150} className="rounded-3xl">
            <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-3 sm:p-4 rounded-3xl manga-shadow hover:manga-shadow-lg transition-all">
              <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-2 mb-2 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24] px-3 py-1.5 rounded-lg text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0284c7] dark:text-[#38bdf8]">
                    PANEL 01-A // {currentPillar.code}
                  </span>
                  <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(STORY_PILLARS.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`text-[9px] font-bold font-mono-tech px-2.5 py-1 border border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer transition-colors ${
                      isAutoPlaying ? 'bg-[#39FF14] text-black' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                    title={isAutoPlaying ? 'Click to Pause auto-slide' : 'Click to Resume auto-slide'}
                  >
                    {isAutoPlaying ? '⚡ AUTO-ROTATING' : '⏸ PAUSED'}
                  </button>
                </div>
              </div>

              <div 
                className="relative border-2 border-black dark:border-stone-800 rounded-2xl overflow-hidden bg-black aspect-[16/10] sm:aspect-[16/9] group select-none shadow-inner"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
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

                <div className="absolute inset-0 manga-halftone-light opacity-15 pointer-events-none" />

                {/* Top-left badge: hidden on mobile */}
                <div className="hidden sm:block absolute top-3 left-3 z-20 group/sfx">
                  <div 
                    className="border-2 border-black px-3 py-1 manga-shadow-sm rounded transform -rotate-3 transition-transform group-hover/sfx:scale-105"
                    style={{ backgroundColor: currentPillar.accentColor }}
                  >
                    <span className="font-heading text-lg sm:text-xl text-black font-black tracking-wider">
                      {currentPillar.sfxBadge}!
                    </span>
                  </div>
                </div>

                {/* Top-right stat: hidden on mobile */}
                <div className="hidden sm:block absolute top-3 right-3 z-20">
                  <span className="bg-black/85 text-white border border-stone-700 font-mono-tech text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded shadow-md">
                    {currentPillar.statValue}
                  </span>
                </div>

                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 z-30 pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="pointer-events-auto bg-black/80 hover:bg-[#39FF14] text-white hover:text-black border-2 border-white hover:border-black w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm sm:text-base manga-shadow-sm transition-all duration-150 transform hover:-translate-x-0.5 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    title="Previous: Reverse Video"
                  >
                    ◀
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="pointer-events-auto bg-black/80 hover:bg-[#39FF14] text-white hover:text-black border-2 border-white hover:border-black w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm sm:text-base manga-shadow-sm transition-all duration-150 transform hover:translate-x-0.5 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    title="Next: Forward Video"
                  >
                    ▶
                  </button>
                </div>

                {/* Bottom dialogue card: hidden on mobile */}
                <div className="hidden sm:block absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20">
                  <div className="bg-black/90 backdrop-blur-xs text-white border-2 border-[#38bdf8] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono-tech manga-shadow shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                    <div className="text-[#38bdf8] text-[9px] sm:text-[10px] font-bold">
                      [ {currentPillar.dialogueTag} ]
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm tracking-wide mt-0.5 font-heading">
                      {currentPillar.dialogueQuote}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-30 overflow-hidden">
                  <div
                    className="h-full bg-[#39FF14] transition-all duration-75"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between font-mono-tech text-[9px] sm:text-[10px] pt-2 mt-2 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5">
                  {STORY_PILLARS.map((pillar, idx) => (
                    <button
                      key={pillar.id}
                      onClick={() => handleSelect(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'bg-[#39FF14] w-6 border border-black'
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
        </div>

        {/* Right Column: Panel 01-C Stage Details & Buttons */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <UnfoldPanel direction="right" duration={1000} delay={250} className="rounded-3xl">
            <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-5 sm:p-6 rounded-3xl manga-shadow">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="bg-black text-[#39FF14] font-mono-tech text-[10px] font-bold px-2.5 py-0.5 rounded border border-stone-800 shadow-sm">
                  PANEL 01-C [ {currentPillar.code} ]
                </span>
                <span className="text-[10px] font-mono-tech font-bold text-stone-500 dark:text-stone-400">
                  {currentPillar.subtitle}
                </span>
              </div>

              <div className="mb-2">
                <InkText
                  as="h3"
                  key={`title-${currentIndex}`}
                  text={currentPillar.title}
                  strokeWidth="0.4px"
                  fontWeight={400}
                  delay={100}
                  duration={1600}
                  className="text-2xl sm:text-3xl font-normal font-heading text-black dark:text-white uppercase tracking-wide"
                />
              </div>

              <p 
                key={`desc-${currentIndex}`}
                className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 min-h-[3.5em] animate-fade-in font-normal"
              >
                {currentPillar.description}
              </p>

              {/* Mobile-only info card */}
              <div className="sm:hidden mb-4 p-3 bg-white dark:bg-[#18181c] border-2 border-black dark:border-stone-700 rounded-xl space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-mono-tech">
                  <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] uppercase">
                    [ {currentPillar.dialogueTag} ]
                  </span>
                  <span className="font-bold bg-[#39FF14] text-black px-2 py-0.5 rounded border border-black text-[9px]">
                    {currentPillar.statValue}
                  </span>
                </div>
                <div className="text-xs italic text-stone-800 dark:text-stone-200 font-medium pt-0.5">
                  {currentPillar.dialogueQuote}
                </div>
              </div>

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
                            ? 'bg-[#39FF14] text-black border-black manga-shadow-sm font-black scale-105'
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
      </div>

      {/* Bottom Features Banner */}
      <div className="mt-8 border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[10px] sm:text-xs manga-shadow">
        <div className="text-stone-600 dark:text-stone-400">
          5 PROVEN SERVICES TO SCALE YOUR BRAND
        </div>
        <div className="text-stone-900 dark:text-stone-200 font-bold">
          TAILORED STRATEGY FOR EVERY STAGE OF GROWTH
        </div>
        <div className="bg-[#39FF14] text-black font-bold px-3 py-1 rounded border border-black uppercase text-[10px] shadow-[1px_1px_0px_#000]">
          GROW WITH US
        </div>
      </div>
    </section>
  );
}
