import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SERVICES_DATA, getServiceBySlug } from '../data/servicesData';
import InkText from '../components/ui/InkText';
import TypewriterText from '../components/ui/TypewriterText';
import UnfoldPanel from '../components/ui/UnfoldPanel';
import OgLogo from '../components/ui/OgLogo';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const service = getServiceBySlug(slug) || SERVICES_DATA[0];
  const currentIndex = SERVICES_DATA.findIndex((s) => s.id === service.id);
  const prevService = SERVICES_DATA[(currentIndex - 1 + SERVICES_DATA.length) % SERVICES_DATA.length];
  const nextService = SERVICES_DATA[(currentIndex + 1) % SERVICES_DATA.length];

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [slug]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative min-h-screen px-3 sm:px-6 py-6 max-w-[1300px] mx-auto space-y-8 animate-fade-in">
      {/* Top Header Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black dark:border-[#38383e]">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/#arsenal"
            className="bg-black hover:bg-[#bef264] text-white hover:text-black font-mono-tech font-bold text-xs px-3 py-1.5 border-2 border-black manga-shadow-sm transition-all hover:-translate-x-0.5 cursor-pointer flex items-center gap-1.5"
          >
            <span>←</span>
            <span>BACK TO MAIN ARCHIVE</span>
          </Link>

          <span className="font-mono-tech text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">
            //
          </span>

          <span 
            className="font-mono-tech text-xs font-bold px-2 py-1 border border-black dark:border-stone-800 text-black shadow-sm"
            style={{ backgroundColor: service.color }}
          >
            {service.slot} // {service.type}
          </span>
        </div>

        <div className="font-mono-tech text-xs text-stone-600 dark:text-stone-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-ping inline-block" />
          <span className="font-bold text-black dark:text-white">PROTOCOL DEPLOYED</span>
        </div>
      </div>

      {/* Hero Service Title & Intro */}
      <div className="space-y-2">
        <div className="inline-block bg-black text-[#bef264] font-mono-tech text-xs font-bold px-2.5 py-0.5 border border-stone-800 uppercase tracking-widest mb-1">
          CAPABILITY SPECIFICATION // 0{currentIndex + 1}
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-black dark:text-white uppercase leading-none">
          {service.title}
        </h1>
        <p className="font-mono-tech text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 max-w-3xl">
          {service.subtitle}
        </p>
      </div>

      {/* Main Grid: Video Showcase Panel (Left) + Overview & Key Metrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Video Player Showcase Panel */}
        <div className="lg:col-span-7">
          <UnfoldPanel direction="right" duration={1000} delay={100} className="border-3 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] p-2.5 manga-shadow-lg">
            
            {/* Video Top Strip */}
            <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-2 mb-2 border-b border-black dark:border-stone-800 text-stone-700 dark:text-stone-300">
              <span className="font-bold flex items-center gap-1.5" style={{ color: service.color }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: service.color }} />
                SHOWCASE FEED // {service.title}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 px-2 py-0.5 border border-black dark:border-stone-700 font-mono-tech text-[10px] font-bold cursor-pointer transition-colors"
                >
                  {isMuted ? '🔇 MUTED' : '🔊 UNMUTED'}
                </button>
                <button
                  onClick={togglePlay}
                  className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 px-2 py-0.5 border border-black dark:border-stone-700 font-mono-tech text-[10px] font-bold cursor-pointer transition-colors"
                >
                  {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                </button>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="relative border-2 border-black dark:border-stone-800 overflow-hidden bg-black aspect-[16/9] group">
              <video
                ref={videoRef}
                key={service.id}
                src={service.videoSrc}
                poster={service.poster}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover object-center"
              />

              {/* Halftone / Screentone Texture */}
              <div className="absolute inset-0 manga-halftone-light opacity-15 pointer-events-none" />

              {/* Top-Left Manga SFX Badge */}
              <div className="absolute top-3 left-3 z-20">
                <div 
                  className="border-2 border-black px-3 py-0.5 manga-shadow-sm transform -rotate-3 text-black font-black font-heading text-lg sm:text-xl tracking-wider shadow-md"
                  style={{ backgroundColor: service.color }}
                >
                  {service.sfxBadge}!
                </div>
              </div>

              {/* Top-Right Resolution Tag */}
              <div className="absolute top-3 right-3 z-20">
                <span className="bg-black/90 text-white font-mono-tech text-[10px] font-bold px-2.5 py-1 border border-stone-700 shadow-lg">
                  {service.resolution}
                </span>
              </div>

              {/* Bottom Dialogue Box Overlay */}
              <div className="absolute bottom-3 left-3 right-3 z-20">
                <div className="bg-black/90 backdrop-blur-xs text-white border-2 border-stone-700 p-3 manga-shadow text-xs font-mono-tech">
                  <div className="text-[#38bdf8] text-[10px] font-bold mb-0.5">
                    [ {service.dialogueAuthor} ]
                  </div>
                  <div className="font-heading font-bold text-white text-xs sm:text-sm tracking-wide leading-snug">
                    {service.dialogueQuote}
                  </div>
                </div>
              </div>
            </div>

            {/* Video Footer Strip */}
            <div className="flex items-center justify-between font-mono-tech text-[10px] pt-2 mt-2 border-t border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400">
              <span>LIVE SHOWCASE RENDERING // 60 FPS</span>
              <span className="font-bold text-black dark:text-white">{service.statVal}</span>
            </div>
          </UnfoldPanel>
        </div>

        {/* RIGHT: In-Depth Overview & Key Metrics */}
        <div className="lg:col-span-5 space-y-4">
          <UnfoldPanel direction="right" duration={1000} delay={150} className="border-3 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] p-5 sm:p-6 manga-shadow-lg space-y-4">
            
            <div className="flex items-center justify-between font-mono-tech text-xs pb-2 border-b border-black dark:border-stone-800">
              <span className="font-bold text-[#ef4444]">BRIEF & PROTOCOL OVERVIEW</span>
              <span className="bg-[#bef264] text-black font-bold px-2 py-0.5 border border-black text-[10px]">
                {service.slot}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-heading text-black dark:text-white uppercase leading-tight">
              Transforming Complex Brands Into Cultural Phenomena
            </h2>

            <p className="font-sans text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {service.fullDesc}
            </p>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-stone-50 dark:bg-stone-800/60 border-2 border-black p-3 text-center manga-shadow-sm">
                <div className="font-mono-tech text-[10px] text-stone-500 uppercase font-bold">
                  {service.statLabel}
                </div>
                <div 
                  className="font-heading text-xl sm:text-2xl font-black mt-1"
                  style={{ color: service.color }}
                >
                  {service.statVal}
                </div>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/60 border-2 border-black p-3 text-center manga-shadow-sm">
                <div className="font-mono-tech text-[10px] text-stone-500 uppercase font-bold">
                  {service.secondaryStatLabel}
                </div>
                <div className="font-heading text-xl sm:text-2xl font-black text-black dark:text-white mt-1">
                  {service.secondaryStatVal}
                </div>
              </div>
            </div>

            {/* Direct Action Button */}
            <div className="pt-2">
              <Link
                to="/#contact"
                className="w-full bg-[#bef264] hover:bg-lime-400 text-black border-2 border-black py-3 font-mono-tech font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 manga-shadow hover:translate-x-0.5 hover:-translate-y-0.5"
              >
                <span>DEPLOY {service.title} NOW</span>
                <span>→</span>
              </Link>
            </div>
          </UnfoldPanel>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DETAILED BIFURCATIONS SECTION                                             */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-[#38383e] flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span 
              className="font-mono-tech text-xs font-black px-2.5 py-0.5 border border-black text-black uppercase shadow-sm"
              style={{ backgroundColor: service.color }}
            >
              MODULE BIFURCATIONS
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-black dark:text-white uppercase tracking-tight">
              EXECUTION DELIVERABLES & CORE BREAKDOWNS
            </h3>
          </div>
          <span className="font-mono-tech text-xs text-stone-500">
            [ 04 SPECIALIZED STAGES ]
          </span>
        </div>

        {/* 4 Bifurcations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {service.bifurcations.map((bif, idx) => (
            <UnfoldPanel
              key={idx}
              direction="right"
              duration={900}
              delay={100 + idx * 80}
              className="bg-white dark:bg-[#131316] border-2 border-black dark:border-[#38383e] p-5 manga-shadow-sm flex flex-col justify-between group hover:-translate-y-1 transition-transform"
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-2 mb-2.5 border-b border-stone-200 dark:border-stone-800">
                  <span 
                    className="font-bold px-2 py-0.5 text-black border border-black"
                    style={{ backgroundColor: service.color }}
                  >
                    {bif.badge}
                  </span>
                  <span className="text-stone-400 font-bold">STAGE 0{idx + 1} / 04</span>
                </div>

                <h4 className="font-heading text-lg sm:text-xl font-bold text-black dark:text-white mb-2 group-hover:text-[#38bdf8] transition-colors">
                  {bif.title}
                </h4>

                <p className="font-sans text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                  {bif.desc}
                </p>
              </div>

              {/* Tangible Output Deliverable */}
              <div className="bg-stone-50 dark:bg-stone-800/80 border border-black dark:border-stone-700 p-2.5 font-mono-tech text-[11px]">
                <span className="text-stone-500 dark:text-stone-400 font-bold block text-[9px] uppercase">
                  TANGIBLE OUTPUT DELIVERABLE:
                </span>
                <span className="font-bold text-black dark:text-white flex items-center gap-1.5 mt-0.5">
                  <span className="text-[#16a34a]">✓</span>
                  <span>{bif.deliverable}</span>
                </span>
              </div>
            </UnfoldPanel>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METHODOLOGY TIMELINE & DELIVERABLES                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        
        {/* Execution Roadmap */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#131316] border-2 border-black dark:border-[#38383e] p-5 manga-shadow-sm space-y-3">
            <div className="flex items-center justify-between font-mono-tech text-xs pb-2 border-b border-black dark:border-stone-800">
              <span className="font-bold text-[#38bdf8]">DEPLOYMENT METHODOLOGY</span>
              <span className="text-stone-500">4-STAGE PIPELINE</span>
            </div>

            <div className="space-y-2.5">
              {service.methodology.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 font-mono-tech text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-[#bef264] px-1.5 py-0.5 font-bold text-[10px]">
                      {m.phase}
                    </span>
                    <span className="font-bold text-black dark:text-white">{m.name}</span>
                  </div>
                  <span className="text-stone-500 font-bold text-[10px]">{m.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tangible Master Deliverables & Tech Stack */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#131316] border-2 border-black dark:border-[#38383e] p-5 manga-shadow-sm space-y-3">
            <div className="flex items-center justify-between font-mono-tech text-xs pb-2 border-b border-black dark:border-stone-800">
              <span className="font-bold text-[#10b981]">MASTER DELIVERABLES</span>
              <span className="text-stone-500">CORE OUTPUTS</span>
            </div>

            <ul className="space-y-2 font-mono-tech text-xs text-stone-700 dark:text-stone-300">
              {service.deliverables.map((del, i) => (
                <li key={i} className="flex items-start gap-2 bg-stone-50 dark:bg-stone-800/40 p-2 border border-stone-200 dark:border-stone-700">
                  <span className="text-[#10b981] font-bold">▶</span>
                  <span>{del}</span>
                </li>
              ))}
            </ul>

            {/* Tech Stack Pills */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
              <div className="text-[10px] font-mono-tech text-stone-500 font-bold uppercase mb-1.5">
                INTEGRATED PLATFORMS & STACK:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {service.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="bg-black text-[#bef264] font-mono-tech text-[10px] font-bold px-2 py-0.5 border border-stone-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* NEXT / PREVIOUS NAVIGATION FOOTER                                         */}
      {/* ========================================================================= */}
      <div className="border-t-2 border-black dark:border-[#38383e] pt-6 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* PREVIOUS SERVICE */}
          <Link
            to={`/service/${prevService.slug}`}
            className="w-full sm:w-auto bg-white dark:bg-[#18181c] hover:bg-stone-100 dark:hover:bg-stone-800 text-black dark:text-white border-2 border-black dark:border-stone-700 px-4 py-3 font-mono-tech text-xs font-bold manga-shadow-sm transition-all hover:-translate-x-0.5 flex items-center justify-center sm:justify-start gap-2"
          >
            <span>◀</span>
            <div className="text-left">
              <div className="text-[9px] text-stone-500 uppercase">PREVIOUS PROTOCOL</div>
              <div className="font-black text-xs sm:text-sm uppercase">{prevService.title}</div>
            </div>
          </Link>

          {/* QUICK LINKS TO ALL 6 */}
          <div className="hidden lg:flex items-center gap-1.5">
            {SERVICES_DATA.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/service/${s.slug}`)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  s.id === service.id
                    ? 'bg-[#bef264] w-7 border border-black'
                    : 'bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
                }`}
                title={s.title}
              />
            ))}
          </div>

          {/* NEXT SERVICE */}
          <Link
            to={`/service/${nextService.slug}`}
            className="w-full sm:w-auto bg-white dark:bg-[#18181c] hover:bg-stone-100 dark:hover:bg-stone-800 text-black dark:text-white border-2 border-black dark:border-stone-700 px-4 py-3 font-mono-tech text-xs font-bold manga-shadow-sm transition-all hover:translate-x-0.5 flex items-center justify-center sm:justify-end gap-2 text-right"
          >
            <div className="text-right">
              <div className="text-[9px] text-stone-500 uppercase">NEXT PROTOCOL</div>
              <div className="font-black text-xs sm:text-sm uppercase">{nextService.title}</div>
            </div>
            <span>▶</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
