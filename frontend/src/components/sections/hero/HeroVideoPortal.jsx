import React from 'react';
import { createPortal } from 'react-dom';

/**
 * HeroVideoPortal
 * Renders the full-screen 4K interactive video stream portal into document.body.
 * Includes live feed telemetry, audio controls, camera reversal triggers, and playback progress.
 */
export default function HeroVideoPortal({
  isVideoMounted,
  videoContainerRef,
  videoRef,
  videoSrc,
  videoBlobUrl,
  isMuted,
  onToggleMute,
  onReverseCamera,
  videoProgress,
  isHeroVideoLoaded,
  onTimeUpdate,
  onEnded
}) {
  if (!isVideoMounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      ref={videoContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label="OG Media 4K Visual Showcase Video Stream"
      className="fixed inset-0 z-50 opacity-0 pointer-events-none bg-black flex items-center justify-center"
    >
      <video
        ref={videoRef}
        src={videoBlobUrl || videoSrc}
        playsInline
        preload="auto"
        muted={isMuted}
        aria-label="OG Media 4K visual reel"
        className="w-full h-full object-cover"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top telemetry and control bar */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-6 flex items-center justify-between z-40 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono-tech text-[10px] sm:text-xs text-[#39FF14]">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" aria-hidden="true" />
          <span className="font-bold">LIVE FEED // HEROVID1.MP4</span>
          <span className="text-stone-400 hidden md:inline">
            | {isHeroVideoLoaded ? 'MEMORY BUFFERED // ZERO LAG' : '4K ARCHIVE TRANSMISSION'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            className="bg-black/80 hover:bg-black text-[#39FF14] border border-[#39FF14] px-2.5 sm:px-3 py-1 font-mono-tech text-[10px] sm:text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <span aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'UNMUTE' : 'MUTED'}</span>
          </button>

          <button
            type="button"
            onClick={onReverseCamera}
            title="Reverse camera back to comic desk"
            aria-label="Reverse camera back to comic desk"
            className="bg-[#ef4444] hover:bg-red-600 text-white border border-white px-2.5 sm:px-3 py-1 font-mono-tech text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 shadow-lg"
          >
            <span aria-hidden="true">↺</span>
            <span className="hidden sm:inline">REVERSE CAMERA</span>
            <span className="sm:hidden">EXIT</span>
          </button>
        </div>
      </div>

      {/* Bottom video playback telemetry bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="font-mono-tech text-xs text-white/80">LIVE</span>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(videoProgress)} aria-valuemin="0" aria-valuemax="100">
            <div
              className="h-full bg-[#ef4444] transition-all duration-100"
              style={{ width: `${videoProgress}%` }}
            />
          </div>
          <span className="font-mono-tech text-xs text-[#39FF14] font-bold">
            {Math.round(videoProgress)}%
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
