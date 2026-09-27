import React, { useState } from 'react';
import InkText from '../ui/InkText';
import UnfoldPanel from '../ui/UnfoldPanel';

export default function ContactTransmissionSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4500);
  };

  return (
    <section id="contact" className="relative px-3 sm:px-6 py-16 sm:py-24 max-w-[1440px] mx-auto select-none">
      {/* Section Header: Matching the website manga/anime theme */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12 relative px-2">
        <div>
          {/* Prefix Tag: /// 03 通信. */}
          <div className="flex items-center gap-2 mb-2 font-mono-tech text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
            <span className="text-stone-500">/// 03</span>
            <span className="font-jp-impact text-black dark:text-white tracking-wider text-sm sm:text-base">
              通信.
            </span>
            <span className="bg-[#ef4444] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-0.5 border border-black dark:border-stone-800 uppercase shadow-sm">
              CHAPTER 04 // TRANSMISSION CHANNELS
            </span>
          </div>

          {/* Main Title: Contact Transmission with InkText and brushed font */}
          <div className="relative inline-block">
            <InkText
              as="h2"
              text="Contact Transmission"
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
              <div>Coordinates: Tokyo // Seoul // SF.</div>
              <div>Direct Dispatch & Encrypted Cloud Transmission.</div>
              <div>Let's Build Something Worth Remembering.</div>
            </div>
            {/* Pink stroke */}
            <div className="w-20 h-1.5 bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-transparent rounded-full mt-1.5 transform -rotate-1" />
          </div>
        </div>

        {/* Hand-Drawn Annotation on Top Right */}
        <div className="self-end md:mr-6 flex flex-col items-center select-none transform rotate-[-2deg]">
          <div className="font-handwriting text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 font-bold tracking-wide">
            <span>Transmit your</span>
          </div>
          <div className="font-handwriting text-xl sm:text-2xl text-stone-600 dark:text-stone-400 -mt-1 font-bold">
            mission brief
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

      {/* Main Drafting Board Box with UnfoldPanel */}
      <UnfoldPanel direction="right" duration={1100} delay={150} className="rounded-3xl">
        <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-4 sm:p-8 rounded-3xl manga-shadow hover:manga-shadow-lg transition-all relative overflow-hidden">
          
          {/* Top Panel Strip: Slot + Barcode */}
          <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24] rounded-xl mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white font-mono-tech font-bold text-xs px-2 py-0.5 rounded-sm">
                SEC_07
              </span>
              <span className="font-mono-tech text-[10px] sm:text-xs font-bold text-stone-800 dark:text-stone-300 tracking-wider">
                // DIRECT FREQUENCY DISPATCH
              </span>
            </div>

            {/* Barcode Graphic SVG */}
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

          {/* Center Form Container */}
          <div className="relative z-10 max-w-3xl mx-auto bg-white dark:bg-[#121216] border-2 border-black dark:border-[#38383e] p-6 sm:p-10 rounded-2xl manga-shadow">
            
            {/* Box Header Callout */}
            <div className="text-center mb-8">
              <span className="font-mono-tech text-[10px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest bg-stone-100 dark:bg-[#1c1c22] px-3 py-1 rounded border border-stone-300 dark:border-stone-700">
                [ PROJECT // TRANSMISSION CALL ]
              </span>

              <div className="block mt-3 mb-1">
                <InkText
                  as="h3"
                  strokeWidth="1.2px"
                  delay={200}
                  duration={2000}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading tracking-tight text-black dark:text-white"
                  text='"YOUR STORY STARTS HERE."'
                />
              </div>

              <div className="bg-[#bef264] text-black font-mono-tech font-bold text-xs sm:text-sm px-4 py-1.5 inline-block border-2 border-black rounded shadow-[2px_2px_0px_#000] mt-2">
                LET'S MAKE SOMETHING WORTH REMEMBERING.
              </div>
            </div>

            {/* Submission State or Form */}
            {submitted ? (
              <div className="p-6 sm:p-8 bg-[#bef264] border-2 border-black text-black font-mono-tech text-center my-6 rounded-xl manga-shadow animate-fade-in">
                <div className="font-black text-base sm:text-lg mb-1">
                  TRANSMISSION RECEIVED // DISPATCH ENCRYPTED
                </div>
                <div className="text-xs sm:text-sm font-medium">
                  Our creative directors in Seoul, Tokyo & SF have logged your frequency. Response incoming within 24 hours.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Input 1: Name / Codename */}
                  <div>
                    <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1.5">
                      [ IDENTIFIER / CODENAME ]
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Director Jin / Nova Corp"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-[#1a1a1f] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:bg-white dark:focus:bg-[#222228] focus:ring-2 focus:ring-[#38bdf8] transition-all"
                    />
                  </div>

                  {/* Input 2: Digital Frequency / Email */}
                  <div>
                    <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1.5">
                      [ DIGITAL FREQUENCY / EMAIL ]
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="frequency@domain.com"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-[#1a1a1f] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:bg-white dark:focus:bg-[#222228] focus:ring-2 focus:ring-[#38bdf8] transition-all"
                    />
                  </div>
                </div>

                {/* Input 3: Scope of Work */}
                <div>
                  <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1.5">
                    [ MISSION BRIEF / SCOPE OF WORK ]
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe the campaign, 3D experience, brand world, or digital manhwa platform you need created..."
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-[#1a1a1f] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:bg-white dark:focus:bg-[#222228] focus:ring-2 focus:ring-[#38bdf8] resize-y transition-all"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full bg-[#bef264] hover:bg-[#a3e635] text-black font-mono-tech font-extrabold text-xs sm:text-sm py-4 px-6 border-2 border-black rounded-xl manga-shadow transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  <span>START A PROJECT → [ DISPATCH SIGNAL ]</span>
                </button>
              </form>
            )}

            {/* Micro Status Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 font-mono-tech text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-400">
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-black/20">
                TYPICAL RES: UNDER 24HR
              </span>
              <div className="font-bold text-black dark:text-white">STATUS: OPEN FOR COMMISSIONS</div>
              <div className="text-[#ef4444] font-bold">SECURITY: ENCRYPTED CLOUD</div>
            </div>
          </div>
        </div>
      </UnfoldPanel>
    </section>
  );
}
