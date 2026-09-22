import React from 'react';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

export default function ArsenalSection() {
  const capabilities = [
    {
      slot: 'SLOT 01',
      type: 'TYPE: BRANDING CORE',
      badge: '*THUD!*',
      title: 'BRAND WORLDBUILDING',
      desc: 'From background lore and whole visual mythologies for modern labels. We write the rules, look books, tone-of-voice, and visual foundations from ground zero.',
      statLabel: 'IMPACT CAPACITY',
      statVal: '99.8% READY',
      progress: '98%',
      color: '#38bdf8',
      accentBg: 'bg-[#38bdf8]',
      accentText: 'text-[#38bdf8]',
      isDark: false
    },
    {
      slot: 'SLOT 02',
      type: 'TYPE: REALITY WARP',
      badge: '*CLACK!*',
      title: 'DIGITAL EXPERIENCES',
      desc: 'Cutting-edge interactive platforms, bespoke interactive micro-sites, WebGL dimensions, and gamified web experiences engineered to break conventions.',
      statLabel: 'VELOCITY STAT',
      statVal: '120 FPS NATIVE',
      progress: '95%',
      color: '#a855f7',
      accentBg: 'bg-[#a855f7]',
      accentText: 'text-[#a855f7]',
      isDark: false
    },
    {
      slot: 'SLOT 03',
      type: 'TYPE: VISUAL CRAFT',
      badge: '*SPARK!*',
      title: 'VISUAL STORYTELLING',
      desc: 'Graphic sprawling sequential storytelling, cinematic character key-art, and editorial manhwa-edge brand comics that connect at an emotional level.',
      statLabel: 'RESONANCE LEVEL',
      statVal: 'LV.5 CRITICAL',
      progress: '90%',
      color: '#ef4444',
      accentBg: 'bg-[#ef4444]',
      accentText: 'text-[#ef4444]',
      isDark: false
    },
    {
      slot: 'SLOT 04',
      type: 'TYPE: FAST RENDER',
      badge: '*SURGE!*',
      title: 'CREATIVE PRODUCTION',
      desc: 'Full apple-grade execution: cinematic animation, sound engineering, 3D asset generation, and specialized artisanal digital hybrid deliverables.',
      statLabel: 'PROD SPEED',
      statVal: '48H PRODUCTION TURN',
      progress: '92%',
      color: '#f59e0b',
      accentBg: 'bg-[#f59e0b]',
      accentText: 'text-[#f59e0b]',
      isDark: false
    },
    {
      slot: 'SLOT 05',
      type: 'TYPE: MASS IMPACT',
      badge: '*SLASH!*',
      title: 'SOCIAL TRANSMISSIONS',
      desc: 'High-velocity episodic episodes, motion memes, vertical comic serials, and algorithmic viral visual spikes that dominate community feeds and virality.',
      statLabel: 'VIRALITY COEFFICIENT',
      statVal: '9.8X AVG ROI',
      progress: '96%',
      color: '#10b981',
      accentBg: 'bg-[#10b981]',
      accentText: 'text-[#10b981]',
      isDark: false
    },
    {
      slot: 'SLOT 06',
      type: 'DOMAIN: HYPER-CAMPAIGN',
      badge: '*OVERDRIVE!*',
      title: 'HIGH-IMPACT CAMPAIGNS',
      desc: 'Synchronized multi-channel launches that mobilize fanatic audiences, establish IP dominance, and generate undeniable cultural gravity.',
      statLabel: 'STATUS: MAXIMUM',
      statVal: 'DEPLOYMENT: ACTIVE',
      progress: '100%',
      color: '#bef264',
      accentBg: 'bg-[#bef264]',
      accentText: 'text-[#bef264]',
      isDark: true
    }
  ];

  return (
    <section id="arsenal" className="relative px-3 sm:px-6 py-12 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6 pb-2 border-b-2 border-black dark:border-[#38383e]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-mono-tech text-xs font-bold px-2.5 py-0.5 border border-black dark:border-stone-700 uppercase shadow-sm">
            CHAPTER 02 // WEAPONS & CAPABILITIES ARCHIVE
          </span>
          <InkText
            as="h2"
            strokeWidth="1.5px"
            delay={100}
            duration={2000}
            className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-black dark:text-white uppercase"
            text="THE CREATIVE ARSENAL"
          />
        </div>

        <div className="font-mono-tech text-xs text-stone-600 dark:text-stone-400 font-bold">
          [ 06 PROTOCOL MODULES DEPLOYED ]
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map((item, idx) => {
          if (item.isDark) {
            return (
              <UnfoldPanel
                key={idx}
                direction="right"
                duration={1000}
                delay={100 + idx * 90}
                className="bg-black dark:bg-[#0e0e12] text-white border-2 border-black dark:border-[#38383e] p-5 flex flex-col justify-between manga-shadow hover:-translate-y-1 transition-transform relative overflow-hidden group shadow-[0_0_20px_rgba(190,242,100,0.15)]"
              >
                {/* Diagonal hatch pattern in corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#bef264]/20 to-transparent pointer-events-none" />

                <div>
                  {/* Top card strip */}
                  <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-2 mb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#bef264] text-black font-bold px-1.5 py-0.2">
                        {item.slot}
                      </span>
                      <span className="text-stone-400 font-medium">[{item.type}]</span>
                    </div>
                    <span className="font-heading text-sm text-[#bef264] font-black tracking-wider">
                      {item.badge}
                    </span>
                  </div>

                  <InkText
                    as="h3"
                    strokeColor="#bef264"
                    fillColor="#bef264"
                    strokeWidth="1.2px"
                    delay={150 + idx * 80}
                    duration={2000}
                    className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-[#bef264] mb-3 group-hover:text-white transition-colors"
                    text={item.title}
                  />

                  <TypewriterText
                    speed={12}
                    delay={250 + idx * 60}
                    className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium min-h-[4.5em]"
                    text={item.desc}
                  />
                </div>

                {/* Bottom Dual Badges */}
                <div className="pt-3 border-t border-stone-800 flex items-center justify-between font-mono-tech text-[10px]">
                  <span className="bg-[#bef264] text-black font-bold px-2.5 py-1">
                    {item.statLabel}
                  </span>
                  <span className="bg-[#bef264] text-black font-bold px-2.5 py-1">
                    {item.statVal}
                  </span>
                </div>
              </UnfoldPanel>
            );
          }

          return (
            <UnfoldPanel
              key={idx}
              direction="right"
              duration={1000}
              delay={100 + idx * 90}
              className="bg-white dark:bg-[#131316] text-black dark:text-white border-2 border-black dark:border-[#38383e] p-5 flex flex-col justify-between manga-shadow hover:-translate-y-1 transition-transform group"
            >
              <div>
                {/* Top card strip */}
                <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-2 mb-3 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-white font-bold px-1.5 py-0.2 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.slot}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 font-medium">[{item.type}]</span>
                  </div>
                  <span
                    className="font-heading text-sm font-black tracking-wider"
                    style={{ color: item.color }}
                  >
                    {item.badge}
                  </span>
                </div>

                <InkText
                  as="h3"
                  strokeWidth="1.2px"
                  delay={150 + idx * 80}
                  duration={2000}
                  className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-black dark:text-white mb-3 transition-colors"
                  text={item.title}
                />

                <TypewriterText
                  speed={12}
                  delay={250 + idx * 60}
                  className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed mb-6 min-h-[4.5em]"
                  text={item.desc}
                />
              </div>

              {/* Progress Meter */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between font-mono-tech text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-400 mb-1 font-bold">
                  <span>{item.statLabel}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.statVal}</span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 border border-black dark:border-stone-700 overflow-hidden p-0.5">
                  <div
                    className="h-full border border-black"
                    style={{ width: item.progress, backgroundColor: item.color }}
                  />
                </div>
              </div>
            </UnfoldPanel>
          );
        })}
      </div>
    </section>
  );
}
