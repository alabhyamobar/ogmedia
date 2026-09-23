import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 draft-board-grid opacity-50 pointer-events-none"></div>
      <div className="absolute inset-0 manga-halftone opacity-20 pointer-events-none"></div>

      <div className="relative z-10 max-w-xl w-full bg-[#fcfcf9] dark:bg-[#131317] border-3 border-black dark:border-stone-700 p-8 manga-shadow-lg text-center space-y-6">
        <div className="inline-block bg-[#ef4444] text-white font-mono-tech font-bold text-xs px-3 py-1 tracking-widest border border-black shadow-sm uppercase">
          ERROR 404 // SIGNAL LOST IN TRANSMISSION
        </div>

        <div>
          <div className="font-comic-title text-8xl sm:text-9xl text-black dark:text-white leading-none tracking-tight">
            404
          </div>
          <div className="font-kr-impact text-2xl sm:text-3xl text-red-600 dark:text-red-500 mt-1">
            경로 이탈 // SECTOR UNCHARTED
          </div>
        </div>

        {/* Comic Dialogue Balloon */}
        <div className="relative bg-white dark:bg-[#1e1e24] text-black dark:text-white p-4 border-2 border-black manga-shadow-sm font-sans text-sm font-semibold">
          <p>
            "Attention Operative: The archive coordinate you requested does not exist or has been redacted by high command."
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#bef264] hover:bg-[#a3e635] text-black font-mono-tech font-bold text-sm px-6 py-3 border-2 border-black manga-shadow transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>←</span>
            <span>RETURN TO ARCHIVE HEADQUARTERS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
