import React, { createContext, useContext, useState, useEffect } from 'react';

const VideoPreloadContext = createContext({
  videoSrc: '/ogmedia/herovid1.mp4',
  videoBlobUrl: null,
  progress: 100,
  loadedBytes: 15686480,
  totalBytes: 15686480,
  speed: 'INSTANT // READY',
  isLoaded: true,
  status: 'ready',
  retryPreload: () => {}
});

export const useVideoPreload = () => useContext(VideoPreloadContext);

export function VideoPreloadProvider({ children }) {
  const [videoBlobUrl] = useState(null);
  const [progress] = useState(100);
  const [loadedBytes] = useState(15686480);
  const [totalBytes] = useState(15686480);
  const [speed] = useState('FAST // NATIVE STREAM');
  const [isLoaded] = useState(true);
  const [status] = useState('ready');

  // Lightweight non-blocking warmup during browser idle time
  // Allows the browser to cache video metadata/headers without blocking FCP or network
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const warmUpVideo = () => {
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = '/ogmedia/herovid1.mp4';
        link.type = 'video/mp4';
        document.head.appendChild(link);
      } catch {
        // Fallback gracefully
      }
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warmUpVideo, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(warmUpVideo, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const videoSrc = '/ogmedia/herovid1.mp4';

  const value = {
    videoSrc,
    videoBlobUrl,
    progress,
    loadedBytes,
    totalBytes,
    speed,
    isLoaded,
    status,
    retryPreload: () => {}
  };

  return (
    <VideoPreloadContext.Provider value={value}>
      {children}
    </VideoPreloadContext.Provider>
  );
}
