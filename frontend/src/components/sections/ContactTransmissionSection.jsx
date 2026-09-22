import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

export default function ContactTransmissionSection() {
  const { isDark } = useTheme();
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
    <section id="contact" className="relative px-3 sm:px-6 py-12 max-w-[1300px] mx-auto">
      {/* Top Header Tag */}
      <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs text-stone-600 dark:text-stone-400 mb-2 px-1">
        <div className="flex items-center gap-1.5 font-bold text-black dark:text-white">
          <span className="w-2 h-2 bg-[#ef4444] rounded-full"></span>
          <TypewriterText speed={15} delay={100} cursor={false} text="[ TRANSMISSION CHANNELS ]" />
        </div>
        <div>FILE: SEC_07 // READY TO SEND</div>
      </div>

      {/* Drafting Board Drawing Box with Perspective Grid, Diagonal Cross Lines, and Horizontal Map Unfold */}
      <UnfoldPanel direction="right" duration={1200} delay={150} className="border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#111114] p-4 sm:p-8 manga-shadow-lg">
        {/* SVG Perspective Guidelines mimicking comic drawing layout */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="0" x2="100%" y2="100%" stroke={isDark ? '#fff' : '#000'} strokeWidth="1" strokeDasharray="4 4" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke={isDark ? '#fff' : '#000'} strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Header Ribbon on top of board */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-6 border-b border-black dark:border-[#27272a] font-mono-tech text-[10px] sm:text-xs relative z-10">
          <div className="bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-bold px-2.5 py-1 uppercase border border-black dark:border-stone-800 manga-shadow-sm shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <InkText
              as="span"
              strokeColor="#ffffff"
              fillColor="#ffffff"
              strokeWidth="1px"
              delay={150}
              duration={1800}
              text="TRANSMIT PROTOCOL // CONNECT WITH OG MEDIA"
            />
          </div>
          <div className="text-[#38bdf8] font-bold">
            <TypewriterText speed={15} delay={250} cursor={false} text="COORDINATES: TOKYO // SEOUL // SF" />
          </div>
        </div>

        {/* Center Framed Box */}
        <div className="relative z-10 max-w-3xl mx-auto bg-white/95 dark:bg-[#141418]/95 border-2 border-black dark:border-[#38383e] p-5 sm:p-8 manga-shadow">
          {/* Box Header Tag */}
          <div className="text-center mb-6">
            <span className="font-mono-tech text-[10px] sm:text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest bg-stone-100 dark:bg-[#1c1c22] px-2 py-0.5 border border-stone-300 dark:border-stone-700">
              [ PROJECT // TRANSMISSION CALL ]
            </span>
            <div className="block mt-2 mb-1">
              <InkText
                as="h2"
                strokeWidth="1.2px"
                delay={200}
                duration={2200}
                className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading tracking-tight text-black dark:text-white"
                text='"YOUR STORY STARTS HERE."'
              />
            </div>
            <div className="bg-gradient-to-r from-[#bef264] to-[#38bdf8] text-black font-mono-tech font-bold text-xs sm:text-sm px-3.5 py-1.5 inline-block border-2 border-black mt-1 shadow-sm">
              <InkText
                as="span"
                strokeColor="#000000"
                fillColor="#000000"
                strokeWidth="1px"
                delay={400}
                duration={2000}
                text="LET'S MAKE SOMETHING WORTH REMEMBERING."
              />
            </div>
          </div>

          {/* Form */}
          {submitted ? (
            <div className="p-6 bg-gradient-to-r from-[#bef264] to-[#86efac] border-2 border-black text-black font-mono-tech text-center my-6 manga-shadow animate-fade-in">
              <div className="font-bold text-base sm:text-lg mb-1">
                TRANSMISSION RECEIVED // DISPATCH ENCRYPTED
              </div>
              <div className="text-xs">
                Our creative directors in Seoul & Tokyo have logged your frequency. Response incoming within 24 hours.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Input 1: Name */}
                <div>
                  <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    [ IDENTIFIER / CODENAME ]
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Director Jin / Nova Corp"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#1a1a1f] border-2 border-black dark:border-stone-700 font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:bg-white dark:focus:bg-[#222228] focus:ring-2 focus:ring-[#38bdf8]"
                  />
                </div>

                {/* Input 2: Email */}
                <div>
                  <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    [ DIGITAL FREQUENCY / EMAIL ]
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="frequency@domain.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#1a1a1f] border-2 border-black dark:border-stone-700 font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:bg-white dark:focus:bg-[#222228] focus:ring-2 focus:ring-[#38bdf8]"
                  />
                </div>
              </div>

              {/* Input 3: Scope of Work */}
              <div>
                <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  [ MISSION BRIEF / SCOPE OF WORK ]
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe the world, campaign, or digital manhwa platform you need created..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-[#1a1a1f] border-2 border-black dark:border-stone-700 font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:bg-white dark:focus:bg-[#222228] focus:ring-2 focus:ring-[#38bdf8] resize-y"
                ></textarea>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="w-full bg-black dark:bg-[#1c1c22] hover:bg-[#bef264] hover:text-black dark:hover:bg-[#bef264] dark:hover:text-black text-white font-mono-tech font-extrabold text-xs sm:text-sm py-3.5 px-4 border-2 border-black dark:border-stone-700 manga-shadow transition-all hover:translate-x-0.5 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>START A PROJECT →</span>
                <span className="bg-[#bef264] text-black group-hover:bg-black group-hover:text-white px-2 py-0.5 text-xs font-bold">
                  [ DISPATCH SIGNAL ]
                </span>
                <span>↳</span>
              </button>
            </form>
          )}

          {/* Micro Status Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-stone-300 dark:border-stone-800 font-mono-tech text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-400">
            <TypewriterText speed={15} delay={450} cursor={false} text="TYPICAL RES: UNDER 24HR" />
            <div className="font-bold text-black dark:text-white">STATUS: OPEN FOR COMMISSIONS</div>
            <div className="text-[#ef4444] font-bold">SECURITY: ENCRYPTED CLOUD</div>
          </div>
        </div>
      </UnfoldPanel>
    </section>
  );
}

