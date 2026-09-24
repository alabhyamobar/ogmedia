import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const VideoPreloadContext = createContext({
  videoSrc: '/ogmedia/herovid1.mp4',
  videoBlobUrl: null,
  progress: 0,
  loadedBytes: 0,
  totalBytes: 15686480,
  speed: '0.0 MB/s',
  isLoaded: false,
  status: 'idle', // 'idle' | 'loading' | 'ready' | 'fallback'
  retryPreload: () => {}
});

export const useVideoPreload = () => useContext(VideoPreloadContext);

export function VideoPreloadProvider({ children }) {
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(15686480);
  const [speed, setSpeed] = useState('0.0 MB/s');
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState('idle');

  const xhrRef = useRef(null);
  const blobUrlRef = useRef(null);

  const startPreload = () => {
    // If already loaded or in progress
    if (xhrRef.current) {
      xhrRef.current.abort();
    }

    setStatus('loading');
    setProgress(0);
    setLoadedBytes(0);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    // Use full path with base
    const videoUrl = '/ogmedia/herovid1.mp4';
    xhr.open('GET', videoUrl, true);
    xhr.responseType = 'blob';

    let startTime = performance.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    xhr.onprogress = (event) => {
      const now = performance.now();
      const timeDeltaSec = (now - lastTime) / 1000;

      if (timeDeltaSec >= 0.25) {
        const bytesDelta = event.loaded - lastLoaded;
        const currentBps = bytesDelta / timeDeltaSec;
        const speedMbps = (currentBps / (1024 * 1024)).toFixed(1);
        setSpeed(`${speedMbps} MB/s`);
        lastLoaded = event.loaded;
        lastTime = now;
      }

      setLoadedBytes(event.loaded);

      if (event.lengthComputable && event.total > 0) {
        setTotalBytes(event.total);
        const pct = Math.min(100, Math.round((event.loaded / event.total) * 100));
        setProgress(pct);
      } else {
        // Fallback to estimated progress against known 15.68MB
        const knownTotal = 15686480;
        setTotalBytes(knownTotal);
        const pct = Math.min(99, Math.round((event.loaded / knownTotal) * 100));
        setProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
        try {
          const blob = xhr.response;
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setVideoBlobUrl(url);
          setProgress(100);
          setIsLoaded(true);
          setStatus('ready');
        } catch {
          // Fallback if Blob URL creation fails
          setProgress(100);
          setIsLoaded(true);
          setStatus('fallback');
        }
      } else {
        // If HTTP status is error or range issue, fallback gracefully
        setProgress(100);
        setIsLoaded(true);
        setStatus('fallback');
      }
    };

    xhr.onerror = () => {
      // Gracefully fallback so the user is never blocked
      setProgress(100);
      setIsLoaded(true);
      setStatus('fallback');
    };

    xhr.ontimeout = () => {
      setProgress(100);
      setIsLoaded(true);
      setStatus('fallback');
    };

    // Safety timeout: 45 seconds maximum for slow connections
    xhr.timeout = 45000;

    xhr.send();
  };

  useEffect(() => {
    startPreload();

    return () => {
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const videoSrc = videoBlobUrl || '/ogmedia/herovid1.mp4';

  const value = {
    videoSrc,
    videoBlobUrl,
    progress,
    loadedBytes,
    totalBytes,
    speed,
    isLoaded,
    status,
    retryPreload: startPreload
  };

  return (
    <VideoPreloadContext.Provider value={value}>
      {children}
    </VideoPreloadContext.Provider>
  );
}
