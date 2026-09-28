import React, { useState } from 'react';
import InkText from '../ui/InkText';
import UnfoldPanel from '../ui/UnfoldPanel';

const SERVICE_OPTIONS = [
  'Creators & Influencers',
  'Meta Ads & Paid Media',
  'Meme Culture & Viral',
  'Luxury Brand Direction',
  '3D Web & App Design',
  'Full Growth Strategy'
];

export default function ContactTransmissionSection() {
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedServices, setSelectedServices] = useState(['Creators & Influencers']);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const toggleService = (srv) => {
    setSelectedServices((prev) =>
      prev.includes(srv)
        ? prev.length > 1
          ? prev.filter((s) => s !== srv)
          : prev
        : [...prev, srv]
    );
  };

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('dispatch@ogmedia.agency').then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 6000);
  };

  return (
    <section id="contact" className="relative px-3 sm:px-6 py-16 sm:py-24 max-w-[1440px] mx-auto select-none">
      {/* Soft Manga Atmospheric Backdrop with Floating Sakura Petals */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe]/45 via-[#fce7f3]/25 to-transparent dark:from-[#0c1829]/50 dark:via-[#1e1029]/30 dark:to-transparent" />
        {/* Floating Sakura Blossom Petals */}
        <div className="absolute top-8 left-[18%] w-3 h-3 bg-pink-300/80 rounded-full blur-[0.4px] transform rotate-45" />
        <div className="absolute top-24 right-[22%] w-4 h-2 bg-pink-400/70 rounded-full blur-[0.4px] transform rotate-12" />
        <div className="absolute top-1/2 left-[6%] w-3 h-2 bg-pink-300/80 rounded-full transform -rotate-45" />
        <div className="absolute bottom-16 right-[14%] w-3.5 h-2 bg-pink-300/80 rounded-full transform rotate-30" />
      </div>

      {/* Manga Left Sign: お問い合わせ (Contact) */}
      <div className="hidden 2xl:flex absolute left-4 top-28 flex-col items-center pointer-events-none z-10">
        <div className="w-8 py-4 bg-[#7f1d1d]/90 text-pink-200 border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center font-jp-impact text-xs font-black tracking-widest leading-loose">
          <span>連</span>
          <span>絡</span>
          <span>窓</span>
          <span>口</span>
        </div>
        <div className="w-0.5 h-16 bg-black dark:bg-stone-600 mt-0.5" />
      </div>

      {/* Japanese Vertical Text on Right Edge: いつでもお気軽にどうぞ */}
      <div className="hidden 2xl:block absolute right-4 top-20 pointer-events-none z-10 text-stone-500 dark:text-stone-400 select-none">
        <div
          className="font-jp-impact text-xs sm:text-sm tracking-widest font-black leading-loose opacity-70"
          style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
        >
          いつでもお気軽にどうぞ
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12 relative px-2 sm:px-4">
        <div>
          {/* Prefix Tag */}
          <div className="flex items-center gap-2 mb-2 font-mono-tech text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
            <span className="text-stone-500">/// 03</span>
            <span className="font-jp-impact text-black dark:text-white tracking-wider text-sm sm:text-base">
              連絡.
            </span>
            <span className="bg-[#ef4444] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-0.5 border border-black dark:border-stone-800 uppercase shadow-sm">
              CONTACT US // GET IN TOUCH
            </span>
          </div>

          {/* Main Title: Let's Work Together */}
          <div className="relative inline-block">
            <InkText
              as="h2"
              text="Let's Work Together"
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
              <div>Tokyo • Seoul • San Francisco.</div>
              <div>Have a project in mind? We'd love to hear from you.</div>
              <div>Let's create something unforgettable together.</div>
            </div>
            {/* Pink brush stroke */}
            <div className="w-20 h-1.5 bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-transparent rounded-full mt-1.5 transform -rotate-1" />
          </div>
        </div>

        {/* Hand-Drawn Annotation on Top Right with Curved Pointing Arrow */}
        <div className="self-end md:mr-8 lg:mr-16 flex flex-col items-center select-none transform rotate-[-2.5deg]">
          <div className="font-handwriting text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 font-bold tracking-wide">
            <span>Send us a</span>
          </div>
          <div className="font-handwriting text-xl sm:text-2xl text-stone-600 dark:text-stone-400 -mt-1 font-bold">
            quick message
          </div>
          <svg
            className="w-11 h-9 text-stone-800 dark:text-stone-200 transform translate-x-3 -rotate-12 mt-0.5 stroke-current"
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

      {/* DUAL CARDS GRID: 01 DIRECT CONTACT + 02 SEND A MESSAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* CARD 01: DIRECT CONTACT & OFFICES (Left Column - 5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <UnfoldPanel direction="right" duration={1000} delay={100} className="w-full h-full rounded-2xl">
            <div className="w-full h-full bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl overflow-hidden shadow-[6px_6px_0px_#000000] hover:shadow-[10px_10px_0px_#000000] transition-all duration-300 flex flex-col justify-between">
              
              <div>
                {/* Top Card Header Strip */}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24]">
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white font-mono-tech font-bold text-xs px-2 py-0.5 rounded-sm">
                      01
                    </span>
                    <span className="font-mono-tech text-[10px] sm:text-xs font-bold text-stone-800 dark:text-stone-300 tracking-wider">
                      // DIRECT EMAIL & OFFICES
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

                {/* Artwork Thumbnail Box */}
                <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-black dark:border-stone-700 bg-stone-900 group">
                  <img
                    src="/ogmedia/assets/cover_protocol.jpg"
                    alt="Direct Contact Office"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (e.target.src !== '/ogmedia/assets/hero_city.jpg') {
                        e.target.src = '/ogmedia/assets/hero_city.jpg';
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dark Gradient Overlay for Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                  {/* Subtle Halftone Overlay */}
                  <div className="absolute inset-0 manga-halftone-light opacity-15 pointer-events-none" />

                  {/* Top-Left Status Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <div className="bg-black/90 border border-white/30 text-white font-mono-tech text-[9px] sm:text-[10px] font-bold px-2 py-0.5">
                      GLOBAL STUDIOS // ONLINE
                    </div>
                  </div>

                  {/* Bottom-Right Coordinates */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="bg-[#bef264] text-black font-mono-tech text-[9px] sm:text-[10px] font-bold px-2 py-0.5 border border-black shadow-sm">
                      TOKYO • SEOUL • SF
                    </span>
                  </div>
                </div>

                {/* Information Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Title & Japanese Seal */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-black text-xl sm:text-2xl text-black dark:text-white uppercase tracking-tight">
                        Our Contact Info
                      </h3>
                      <div className="font-mono-tech text-[11px] font-bold text-stone-500 dark:text-stone-400">
                        EMAIL & GLOBAL LOCATIONS
                      </div>
                    </div>

                    {/* Red Stamped Japanese Seal */}
                    <div className="border-2 border-[#ef4444] text-[#ef4444] font-jp-impact text-[10px] font-bold px-2 py-1 rotate-[-6deg] tracking-wider select-none shadow-sm">
                      迅速対応
                    </div>
                  </div>

                  {/* Direct Email Box */}
                  <div className="bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 p-3.5 rounded-xl shadow-[2px_2px_0px_#000]">
                    <div className="flex items-center justify-between text-[10px] font-mono-tech font-bold text-stone-500 uppercase mb-1">
                      <span>[ OUR DIRECT EMAIL ]</span>
                      <span className="text-[#16a34a] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping" />
                        AVAILABLE
                      </span>
                    </div>

                    <div className="font-mono-tech font-bold text-sm sm:text-base text-black dark:text-white break-all">
                      dispatch@ogmedia.agency
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                      <button
                        onClick={handleCopyEmail}
                        className="bg-stone-100 hover:bg-[#bef264] hover:text-black dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-mono-tech font-bold px-3 py-1 border border-black rounded transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{copiedEmail ? '✓ COPIED!' : '📋 COPY EMAIL'}</span>
                      </button>

                      <a
                        href="mailto:dispatch@ogmedia.agency"
                        className="bg-black hover:bg-stone-900 text-white text-xs font-mono-tech font-bold px-3 py-1 border border-black rounded transition-all flex items-center gap-1"
                      >
                        <span>✉ SEND EMAIL</span>
                      </a>
                    </div>
                  </div>

                  {/* Global Hub Timezones */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white dark:bg-[#1a1a20] border border-black/30 dark:border-stone-700 p-2 text-center rounded shadow-[1px_1px_0px_#000]">
                      <div className="font-mono-tech text-[9px] text-stone-500 uppercase">TOKYO</div>
                      <div className="font-mono-tech text-xs font-black text-black dark:text-white">JST // 09:00</div>
                    </div>
                    <div className="bg-white dark:bg-[#1a1a20] border border-black/30 dark:border-stone-700 p-2 text-center rounded shadow-[1px_1px_0px_#000]">
                      <div className="font-mono-tech text-[9px] text-stone-500 uppercase">SEOUL</div>
                      <div className="font-mono-tech text-xs font-black text-black dark:text-white">KST // 09:00</div>
                    </div>
                    <div className="bg-white dark:bg-[#1a1a20] border border-black/30 dark:border-stone-700 p-2 text-center rounded shadow-[1px_1px_0px_#000]">
                      <div className="font-mono-tech text-[9px] text-stone-500 uppercase">SAN FRANCISCO</div>
                      <div className="font-mono-tech text-xs font-black text-black dark:text-white">PST // 17:00</div>
                    </div>
                  </div>

                  {/* Response Guarantee SLA */}
                  <div className="bg-[#bef264]/20 border border-[#bef264] p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono-tech font-bold text-stone-800 dark:text-stone-200">
                    <span className="text-[#16a34a] text-base">⚡</span>
                    <span>WE TYPICALLY REPLY WITHIN 24 HOURS</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer: Social Channels */}
              <div className="px-4 py-3 bg-white dark:bg-[#1e1e24] border-t-2 border-black dark:border-stone-700 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono-tech text-[10px] font-bold text-stone-500 uppercase">
                  OUR CHANNELS:
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono-tech text-[10px] font-bold px-2 py-0.5 bg-stone-100 dark:bg-stone-800 border border-black text-stone-800 dark:text-stone-200 hover:bg-[#bef264] hover:text-black rounded"
                  >
                    X
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono-tech text-[10px] font-bold px-2 py-0.5 bg-stone-100 dark:bg-stone-800 border border-black text-stone-800 dark:text-stone-200 hover:bg-[#bef264] hover:text-black rounded"
                  >
                    IG
                  </a>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono-tech text-[10px] font-bold px-2 py-0.5 bg-stone-100 dark:bg-stone-800 border border-black text-stone-800 dark:text-stone-200 hover:bg-[#bef264] hover:text-black rounded"
                  >
                    DISCORD
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono-tech text-[10px] font-bold px-2 py-0.5 bg-stone-100 dark:bg-stone-800 border border-black text-stone-800 dark:text-stone-200 hover:bg-[#bef264] hover:text-black rounded"
                  >
                    YOUTUBE
                  </a>
                </div>
              </div>

            </div>
          </UnfoldPanel>
        </div>

        {/* CARD 02: SIMPLE CONTACT FORM (Right Column - 7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <UnfoldPanel direction="right" duration={1000} delay={180} className="w-full h-full rounded-2xl">
            <div className="w-full h-full bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-7 shadow-[6px_6px_0px_#000000] hover:shadow-[10px_10px_0px_#000000] transition-all duration-300 flex flex-col justify-between">
              
              <div>
                {/* Top Card Header Strip */}
                <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24] rounded-lg mb-5">
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white font-mono-tech font-bold text-xs px-2 py-0.5 rounded-sm">
                      02
                    </span>
                    <span className="font-mono-tech text-[10px] sm:text-xs font-bold text-stone-800 dark:text-stone-300 tracking-wider">
                      // SEND US A MESSAGE
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

                {/* Form Title Callout */}
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <InkText
                      as="h3"
                      text="Start a Project."
                      strokeWidth="1.2px"
                      delay={200}
                      duration={1800}
                      className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white uppercase tracking-tight"
                    />
                    <div className="bg-[#bef264] text-black font-mono-tech font-extrabold text-[10px] sm:text-xs px-3 py-1 border border-black rounded shadow-[2px_2px_0px_#000]">
                      AVAILABLE FOR WORK
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-mono-tech">
                    Tell us what you're looking to build. We'll get back to you shortly.
                  </p>
                </div>

                {/* Form or Submitted State */}
                {submitted ? (
                  <div className="p-6 sm:p-8 bg-[#bef264] border-2 border-black text-black font-mono-tech text-center my-6 rounded-xl shadow-[4px_4px_0px_#000] animate-fade-in space-y-3">
                    <div className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase shadow-sm">
                      [ MESSAGE RECEIVED ]
                    </div>
                    <div className="font-heading font-black text-xl sm:text-2xl tracking-tight">
                      THANK YOU FOR REACHING OUT!
                    </div>
                    <div className="text-xs sm:text-sm font-medium max-w-md mx-auto">
                      We have received your message. Our creative team will review your inquiry and get back to you within 24 hours.
                    </div>
                    <div className="pt-2">
                      <span className="bg-black text-white text-[11px] font-bold px-3 py-1 rounded">
                        TALK SOON!
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    
                    {/* Services Selector */}
                    <div>
                      <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-2">
                        1. What services do you need?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICE_OPTIONS.map((srv) => {
                          const isSelected = selectedServices.includes(srv);
                          return (
                            <button
                              key={srv}
                              type="button"
                              onClick={() => toggleService(srv)}
                              className={`font-mono-tech text-[11px] font-bold px-3 py-1.5 border rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-black text-[#bef264] border-black shadow-[2px_2px_0px_#bef264]'
                                  : 'bg-white dark:bg-[#1a1a20] text-stone-700 dark:text-stone-300 border-black/30 dark:border-stone-700 hover:border-black shadow-[1px_1px_0px_#000]'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {srv}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Email Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                          2. Your Name or Company
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Alex Rivera or Studio Name"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:ring-2 focus:ring-[#bef264] transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                          3. Your Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@company.com"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:ring-2 focus:ring-[#bef264] transition-all"
                        />
                      </div>
                    </div>

                    {/* Message Textarea (Budget Field Removed) */}
                    <div>
                      <label className="block font-mono-tech text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                        4. Your Message
                      </label>
                      <textarea
                        rows="4"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your project, your goals, or any timeline in mind..."
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:ring-2 focus:ring-[#bef264] resize-y transition-all"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-[#bef264] hover:bg-[#a3e635] text-black font-mono-tech font-black text-xs sm:text-sm py-4 px-6 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 uppercase tracking-wider"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                      <span>SEND MESSAGE →</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Status Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-5 pt-3 border-t border-stone-200 dark:border-stone-800 font-mono-tech text-[10px] text-stone-600 dark:text-stone-400">
                <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-black/20">
                  🔒 SECURE & CONFIDENTIAL
                </span>
                <span className="font-bold text-black dark:text-white">
                  DIRECT TO OUR CORE TEAM
                </span>
                <span className="text-[#16a34a] font-bold">
                  ✓ FAST 24H REPLY
                </span>
              </div>

            </div>
          </UnfoldPanel>
        </div>

      </div>

      {/* Bottom Right Handwritten Tag */}
      <div className="flex justify-end mt-4 pr-4 sm:pr-12 lg:pr-24 select-none">
        <div className="font-handwriting text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 font-bold tracking-wide transform rotate-[-4deg] text-right">
          <div>From idea</div>
          <div className="text-stone-600 dark:text-stone-400">to reality.</div>
        </div>
      </div>
    </section>
  );
}
