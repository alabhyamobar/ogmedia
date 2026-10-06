import React from 'react';
import { useNavigate } from 'react-router-dom';
import InkText from '../ui/InkText';
import UnfoldPanel from '../ui/UnfoldPanel';

const ARSENAL_CARDS = [
  {
    id: 'influencer-marketing',
    slug: 'influencer-marketing',
    num: '01',
    tag: 'CREATORS',
    title: 'Influencer Marketing',
    desc: 'Creator partnerships built on audience fit and performance, not follower count alone.',
    img: '/ogmedia/assets/service_influencer.webp',
    fallbackImg: '/ogmedia/assets/service_influencer.webp',
    colSpan: 'col-span-12 lg:col-span-7',
    minHeight: 'min-h-[380px] sm:min-h-[420px]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    )
  },
  {
    id: 'meta-ads',
    slug: 'meta-ads',
    num: '02',
    tag: 'PAID MEDIA',
    title: 'Meta Ads Management',
    desc: 'Full-funnel paid media on Facebook and Instagram, optimized against real business metrics, not vanity clicks.',
    img: '/ogmedia/assets/service_meta_ads.webp',
    colSpan: 'col-span-12 lg:col-span-5',
    minHeight: 'min-h-[380px] sm:min-h-[420px]',
    hasRadar: true,
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    )
  },
  {
    id: 'meme-marketing',
    slug: 'meme-marketing',
    num: '03',
    tag: 'CULTURE',
    title: 'Meme Marketing',
    desc: 'Culturally fluent, fast-moving content that earns attention organically and travels on its own.',
    img: '/ogmedia/assets/service_meme.webp',
    colSpan: 'col-span-12 md:col-span-4',
    minHeight: 'min-h-[370px] sm:min-h-[400px]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
      </svg>
    )
  },
  {
    id: 'premium-brands',
    slug: 'premium-brands',
    num: '04',
    tag: 'BRAND',
    title: 'Premium Brand Positioning',
    desc: 'Sharpening how a brand looks, sounds, and is perceived at the top of its category.',
    img: '/ogmedia/assets/service_premium_brands.webp',
    colSpan: 'col-span-12 md:col-span-4',
    minHeight: 'min-h-[370px] sm:min-h-[400px]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z" />
      </svg>
    )
  },
  {
    id: 'scale-stage',
    slug: 'scale-stage',
    num: '05',
    tag: 'SYSTEMS',
    title: 'End-to-End Growth Systems',
    desc: 'A connected system of creators, paid media, and conversion assets built to scale a business, not just a campaign.',
    img: '/ogmedia/assets/service_scale_stage.webp',
    colSpan: 'col-span-12 md:col-span-4',
    minHeight: 'min-h-[370px] sm:min-h-[400px]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.5s4 4 4 10c0 4-4 9-4 9s-4-5-4-9c0-6 4-10 4-10zm0 6a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
      </svg>
    )
  },
  {
    id: 'website-app-design',
    slug: 'website-app-design',
    num: '06',
    tag: 'DESIGN & TECH',
    title: 'Website & App Design',
    desc: 'Immersive digital experiences, 3D web portals, and conversion-optimized architectures built to captivate modern audiences.',
    img: '/ogmedia/assets/service_web_app_design.webp',
    colSpan: 'col-span-12 lg:col-span-7',
    minHeight: 'min-h-[380px] sm:min-h-[420px]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z" />
      </svg>
    )
  },
  {
    id: 'custom-brief',
    isCta: true,
    num: '07',
    tag: 'DEPLOYMENT',
    title: 'Custom Protocol Sprint',
    desc: 'Need an integrated multi-discipline rollout or exclusive brand campaign? Transmit your requirements directly to our lab.',
    colSpan: 'col-span-12 lg:col-span-5',
    minHeight: 'min-h-[380px] sm:min-h-[420px]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    )
  }
];

export default function ArsenalSection() {
  const navigate = useNavigate();

  return (
    <section id="arsenal" className="relative px-3 sm:px-6 py-16 sm:py-20 max-w-[1440px] mx-auto select-none overflow-x-hidden sm:overflow-x-visible">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12 relative px-2">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono-tech text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
            <span className="text-stone-500">/// 01</span>
            <span className="font-jp-impact text-black dark:text-white tracking-wider text-sm sm:text-base">
              作戦室.
            </span>
            <span className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-0.5 border border-black dark:border-stone-700 uppercase shadow-sm">
              CAPABILITIES ARCHIVE
            </span>
          </div>

          <div className="relative inline-block">
            <InkText
              as="h2"
              text="The Creative Arsenal"
              strokeWidth="1.5px"
              delay={120}
              duration={2000}
              className="font-brush text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic tracking-tight text-black dark:text-white uppercase leading-none drop-shadow-sm"
            />

            <span className="absolute -left-2 -right-4 bottom-1 sm:bottom-2 h-[45%] bg-[#39FF14] -z-10 -rotate-1 skew-x-[-14deg] rounded-sm shadow-sm pointer-events-none" />
          </div>

          <div className="mt-4 inline-block">
            <div className="font-mono-tech text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 uppercase tracking-wider space-y-0.5">
              <div>06 Protocol Modules Deployed.</div>
              <div>High-Impact Creative Production.</div>
              <div>Click Any Card To Inspect Dossier.</div>
            </div>

            <div className="w-20 h-1.5 bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-transparent rounded-full mt-1.5 transform -rotate-1" />
          </div>
        </div>

        <div className="self-end md:mr-6 flex flex-col items-center select-none transform rotate-[-2deg]">
          <div className="font-handwriting text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 font-bold tracking-wide">
            <span>Explore deployed</span>
          </div>
          <div className="font-handwriting text-xl sm:text-2xl text-stone-600 dark:text-stone-400 -mt-1 font-bold">
            service protocols
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

      <div className="grid grid-cols-12 gap-5 sm:gap-6">
        {ARSENAL_CARDS.map((item, idx) => {
          if (item.isCta) {

            return (
              <div key={item.id} className={`${item.colSpan} flex flex-col`}>
                <UnfoldPanel
                  direction="right"
                  duration={1100}
                  delay={100 + idx * 75}
                  className="w-full h-full rounded-3xl"
                >
                  <div
                    onClick={() => {
                      const contactEl = document.getElementById('contact');
                      if (contactEl) {
                        contactEl.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`${item.minHeight} h-full rounded-3xl border-2 border-black dark:border-[#38383e] bg-[#111115] text-white p-6 sm:p-8 flex flex-col justify-between manga-shadow hover:manga-shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden group`}
                  >

                    <div className="absolute inset-0 manga-hatch opacity-30 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#39FF14]/20 via-[#38bdf8]/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 text-[#39FF14] font-mono-tech text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        {item.icon}
                        <span>{item.tag}</span>
                      </div>
                      <span className="font-heading italic text-2xl sm:text-3xl text-stone-500 font-light">
                        {item.num}
                      </span>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <InkText
                        as="h3"
                        text={item.title}
                        strokeWidth="1.2px"
                        strokeColor="#ffffff"
                        fillColor="#ffffff"
                        delay={200 + idx * 70}
                        duration={1700}
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white tracking-tight mb-2 group-hover:text-[#39FF14] transition-colors"
                      />
                      <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-lg mb-6">
                        {item.desc}
                      </p>

                      <div className="w-full h-[1px] bg-white/20 mb-4" />

                      <div className="flex items-center justify-between font-mono-tech text-xs font-bold text-[#39FF14]">
                        <span>TRANSMIT BRIEF DOSSIER</span>
                        <div className="w-9 h-9 rounded-full bg-[#39FF14] text-black border border-black flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </UnfoldPanel>
              </div>
            );
          }

          return (
            <div key={item.id} className={`${item.colSpan} flex flex-col`}>
              <UnfoldPanel
                direction="right"
                duration={1100}
                delay={100 + idx * 75}
                className="w-full h-full rounded-3xl"
              >
                <div
                  onClick={() => navigate(`/service/${item.slug}`)}
                  className={`${item.minHeight} h-full rounded-3xl border-2 border-black dark:border-[#38383e] manga-shadow hover:manga-shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between p-6 sm:p-8`}
                >

                  <div className="absolute inset-0 -z-20 overflow-hidden bg-stone-900">
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (item.fallbackImg && e.target.src !== item.fallbackImg) {
                          e.target.src = item.fallbackImg;
                        }
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/30 pointer-events-none transition-opacity group-hover:opacity-90" />

                  <div className="absolute inset-0 -z-10 manga-halftone-light opacity-15 pointer-events-none" />

                  {item.hasRadar && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                      <div className="w-16 h-16 rounded-full border border-[#39FF14]/70 flex items-center justify-center animate-pulse">
                        <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_10px_#39FF14]" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between relative z-10">
                    <div className="bg-black/65 backdrop-blur-md border border-white/20 text-stone-200 font-mono-tech text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      {item.icon}
                      <span>{item.tag}</span>
                    </div>

                    <span className="font-heading italic text-2xl sm:text-3xl text-stone-400/90 font-light select-none tracking-tight">
                      {item.num}
                    </span>
                  </div>

                  <div className="relative z-10 mt-auto pt-16">
                    <InkText
                      as="h3"
                      text={item.title}
                      strokeWidth="1.2px"
                      strokeColor="#ffffff"
                      fillColor="#ffffff"
                      delay={200 + idx * 70}
                      duration={1700}
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white tracking-tight mb-2 group-hover:text-[#39FF14] transition-colors leading-tight"
                    />

                    <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                      {item.desc}
                    </p>

                    <div className="w-full h-[1px] bg-white/20 my-4" />

                    <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs font-bold text-stone-300 group-hover:text-white transition-colors">
                      <span>EXPLORE THE SERVICE</span>

                      <div className="w-8 h-8 rounded-full border border-white/30 bg-white/10 group-hover:bg-[#39FF14] group-hover:text-black group-hover:border-black flex items-center justify-center text-white transition-all duration-200 group-hover:scale-110">
                        <svg className="w-3.5 h-3.5 fill-current transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24">
                          <path d="M5 19L19 5M19 5H9M19 5V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </UnfoldPanel>
            </div>
          );
        })}
      </div>
    </section>
  );
}
