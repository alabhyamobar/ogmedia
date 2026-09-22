import React, { useState, useEffect } from 'react';

export default function TopTechnicalBar({ onOpenGame }) {
  const [time, setTime] = useState('11:27:14');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
    };
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#111111] dark:bg-[#070709] text-[#bef264] text-[10px] sm:text-[11px] font-mono-tech border-b-2 border-black dark:border-stone-800 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none tracking-wider transition-colors duration-300">
      {/* Left side telemetry */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-white">
        <span className="text-[#bef264] font-bold flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-[#bef264] rounded-full animate-ping"></span>
          + 2026.09.22 [ {time} UTC ]
        </span>
        <span className="hidden md:inline text-stone-500">|</span>
        <span className="hidden sm:inline text-[#38bdf8] font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] inline-block" />
          SYSTEM: OPERATIONAL
        </span>
        <span className="hidden lg:inline text-stone-500">|</span>
        <span className="hidden lg:inline text-amber-400 font-medium">LAT: 37.5665 / LON: 126.9780 [SEOUL]</span>
      </div>

      {/* Center Protocol Badges & Mini Game Launcher */}
      <div className="flex items-center gap-2">
        {onOpenGame && (
          <button
            onClick={onOpenGame}
            className="bg-black hover:bg-[#bef264] text-[#bef264] hover:text-black border border-[#bef264] px-2.5 py-0.5 font-mono-tech text-[10px] sm:text-[11px] font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95"
            title="Launch Flappy Manga Mini-Game"
          >
            <span>🎮</span>
            <span>FLAPPY CROW GAME</span>
          </button>
        )}
        <span className="hidden md:inline bg-[#1e1b4b] text-[#a855f7] border border-[#a855f7]/40 px-2 py-0.5 rounded font-bold">
          [ ARCHIVE PROTOCOL // V2.0 ]
        </span>
        <span className="hidden sm:inline bg-[#bef264] text-black font-bold px-2 py-0.5 rounded shadow-sm">
          LEVEL 04 CLEARANCE
        </span>
      </div>

      {/* Right side metrics */}
      <div className="flex items-center gap-2 sm:gap-3 text-stone-300">
        <span className="hidden xl:inline text-purple-300 font-mono">PG. 01 / 06</span>
        <span className="text-[#38bdf8] font-bold bg-[#082f49] px-1.5 py-0.2 border border-[#0284c7]/50 rounded">FPS: 60</span>
        <span className="text-[#f43f5e] font-bold hidden md:inline">AUDIO: STEREO</span>
        <span className="text-white font-bold bg-[#262626] dark:bg-[#1c1c20] px-1.5 py-0.5 border border-stone-600 dark:border-stone-700">
          ARCH-01
        </span>
        <div className="w-5 h-5 bg-gradient-to-br from-[#bef264] to-[#38bdf8] text-black font-black flex items-center justify-center text-[11px] rounded-sm font-heading shadow-sm">
          4
        </div>
      </div>
    </div>
  );
}

