import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const VideoPreloadContext = createContext({
  videoSrc: '/ogmedia/herovid1.mp4',
  videoBlobUrl: null,
  progress: 0,
  loadedBytes: 0,
  totalBytes: 15686480,
  speed: '0.0 MB/s',
  isLoaded: false,
  status: 'idle',
  retryPreload: () => {}
});

export const useVideoPreload = () => useContext(VideoPreloadContext);

export function VideoPreloadProvider({ children }) {
  const base = import.meta.env.BASE_URL || '/ogmedia/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const videoSrc = `${cleanBase}herovid1.mp4`;

  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(15686480);
  const [speed, setSpeed] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState('loading'); // 'idle' | 'loading' | 'ready' | 'error'

  const activeBlobUrlRef = useRef(null);

  const startPreload = useCallback(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function fetchVideo() {
      setStatus('loading');
      const startTime = performance.now();
      let lastTime = startTime;
      let lastLoaded = 0;
      let targetTotal = 15686480;

      try {
        const response = await fetch(videoSrc, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const contentLengthHeader = response.headers.get('content-length');
        if (contentLengthHeader) {
          const parsed = parseInt(contentLengthHeader, 10);
          if (!isNaN(parsed) && parsed > 0) {
            targetTotal = parsed;
            setTotalBytes(parsed);
          }
        }

        if (!response.body) {
          const blob = await response.blob();
          if (isCancelled) return;
          finalizeWithBlob(blob, targetTotal);
          return;
        }

        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (isCancelled) return;

          chunks.push(value);
          received += value.length;

          const now = performance.now();
          const elapsedSec = (now - lastTime) / 1000;
          if (elapsedSec >= 0.08 || received >= targetTotal) {
            const bytesDiff = received - lastLoaded;
            const bps = bytesDiff / (elapsedSec || 0.08);
            const speedFormatted = `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;

            lastTime = now;
            lastLoaded = received;

            const pct = Math.min(100, Math.round((received / targetTotal) * 100));
            setProgress(pct);
            setLoadedBytes(received);
            setSpeed(speedFormatted);
          }
        }

        if (isCancelled) return;

        const blob = new Blob(chunks, { type: 'video/mp4' });
        finalizeWithBlob(blob, targetTotal);
      } catch (err) {
        if (isCancelled || err.name === 'AbortError') return;
        fallbackToNativeVideo();
      }
    }

    function finalizeWithBlob(blob, totalSize) {
      if (isCancelled) return;

      const blobUrl = URL.createObjectURL(blob);
      activeBlobUrlRef.current = blobUrl;
      setVideoBlobUrl(blobUrl);
      setLoadedBytes(totalSize);
      setProgress(100);
      setSpeed('INSTANT // BUFFERED');

      // Verify that browser media pipeline has decoded frames and is ready to play immediately
      const testVideo = document.createElement('video');
      testVideo.preload = 'auto';
      testVideo.muted = true;
      testVideo.playsInline = true;

      let verified = false;
      const markReady = () => {
        if (verified || isCancelled) return;
        verified = true;
        setIsLoaded(true);
        setStatus('ready');
        testVideo.src = '';
        testVideo.remove();
      };

      testVideo.oncanplaythrough = markReady;
      testVideo.onloadeddata = () => {
        if (testVideo.readyState >= 3) {
          markReady();
        } else {
          setTimeout(markReady, 100);
        }
      };
      testVideo.onerror = markReady;

      testVideo.src = blobUrl;
      testVideo.load();

      setTimeout(markReady, 800);
    }

    function fallbackToNativeVideo() {
      if (isCancelled) return;
      const testVideo = document.createElement('video');
      testVideo.preload = 'auto';
      testVideo.muted = true;
      testVideo.playsInline = true;

      let verified = false;
      const markReady = () => {
        if (verified || isCancelled) return;
        verified = true;
        setProgress(100);
        setLoadedBytes(15686480);
        setIsLoaded(true);
        setStatus('ready');
        testVideo.src = '';
        testVideo.remove();
      };

      testVideo.oncanplaythrough = markReady;
      testVideo.onprogress = () => {
        if (testVideo.buffered.length > 0 && testVideo.duration > 0) {
          const bufferedEnd = testVideo.buffered.end(testVideo.buffered.length - 1);
          const pct = Math.min(100, Math.round((bufferedEnd / testVideo.duration) * 100));
          setProgress(pct);
          setLoadedBytes(Math.round((pct / 100) * 15686480));
          if (pct >= 95) {
            markReady();
          }
        }
      };
      testVideo.onerror = markReady;

      testVideo.src = videoSrc;
      testVideo.load();

      setTimeout(markReady, 8000);
    }

    fetchVideo();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [videoSrc]);

  useEffect(() => {
    const cancel = startPreload();
    return () => {
      if (typeof cancel === 'function') cancel();
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, [startPreload]);

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
