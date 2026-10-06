import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../context/ThemeContext';
import { useVideoPreload } from '../../context/VideoPreloadContext';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const { isDark } = useTheme();
  const { videoSrc, videoBlobUrl, isLoaded: isHeroVideoLoaded } = useVideoPreload();

  const pinWrapperRef = useRef(null);
  const cameraRigRef = useRef(null);
  const heroRef = useRef(null);
  const boardRef = useRef(null);
  const bgRaysRef = useRef(null);
  const prologueRef = useRef(null);
  const limeBoxRef = useRef(null);
  const boomStickerRef = useRef(null);
  const titleCardRef = useRef(null);
  const descRef = useRef(null);
  const swooshRef = useRef(null);
  const ctaRef = useRef(null);
  const cornerMarksRef = useRef(null);
  const telemetryRef = useRef(null);

  const windowWrapperRef = useRef(null);
  const panelFrameRef = useRef(null);
  const comicImageRef = useRef(null);
  const frameBadgesRef = useRef(null);
  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);
  const cameraTlRef = useRef(null);
  const isVideoActiveRef = useRef(false);
  const isReversedRef = useRef(false);
  const isZoomingRef = useRef(false);

  const [_scrollProgress, setScrollProgress] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [_videoEnded, setVideoEnded] = useState(false);
  const [isVideoMounted, setIsVideoMounted] = useState(true);
  const stRef = useRef(null);

  useEffect(() => {
    const pinWrapper = pinWrapperRef.current;
    const cameraRig = cameraRigRef.current;
    const board = boardRef.current;
    const panelFrame = panelFrameRef.current;
    const comicImg = comicImageRef.current;
    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;

    if (!pinWrapper || !cameraRig || !board || !panelFrame || !comicImg || !videoContainer) return;

    const mm = gsap.matchMedia();

    const setupCameraTimeline = (isMobile) => {
      // Calculate dynamic transform origin and translate vector to keep panelFrame dead-center on screen
      const getZoomTarget = () => {
        if (!cameraRig || !panelFrame) {
          return { origin: 'center center', x: 0, y: 0, scale: isMobile ? 5.4 : 4.2 };
        }

        gsap.set(cameraRig, { scale: 1, x: 0, y: 0, xPercent: 0, yPercent: 0 });

        const rigRect = cameraRig.getBoundingClientRect();
        const panelRect = panelFrame.getBoundingClientRect();

        const panelCenterX = panelRect.left + panelRect.width / 2;
        const panelCenterY = panelRect.top + panelRect.height / 2;

        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;

        const originX = panelCenterX - rigRect.left;
        const originY = panelCenterY - rigRect.top;

        const moveX = screenCenterX - panelCenterX;
        const moveY = screenCenterY - panelCenterY;

        const scaleX = window.innerWidth / Math.max(panelRect.width, 1);
        const scaleY = window.innerHeight / Math.max(panelRect.height, 1);
        const coverScale = Math.max(scaleX, scaleY) * 1.15;
        const targetScale = isMobile ? Math.max(coverScale, 5.2) : Math.max(coverScale, 4.2);

        return {
          origin: `${originX}px ${originY}px`,
          x: moveX,
          y: moveY,
          scale: targetScale
        };
      };

      const zoomTarget = getZoomTarget();
      gsap.set(cameraRig, { transformOrigin: zoomTarget.origin });

      const cameraTl = gsap.timeline({ paused: true });
      cameraTlRef.current = cameraTl;
      isVideoActiveRef.current = false;
      isReversedRef.current = false;

      cameraTl.to(
        cameraRig,
        {
          scale: zoomTarget.scale,
          x: zoomTarget.x,
          y: zoomTarget.y,
          xPercent: 0,
          yPercent: 0,
          transformOrigin: zoomTarget.origin,
          ease: 'power1.inOut',
          duration: 1
        },
        0
      );

      // Level board tilt to 0 immediately so zooming is orthogonal and clean
      cameraTl.to(
        board,
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          duration: 0.3,
          ease: 'power1.out'
        },
        0
      );

      if (boomStickerRef.current) {
        gsap.set(boomStickerRef.current, { z: 85, rotation: -6, transformStyle: 'preserve-3d' });
      }
      if (titleCardRef.current) {
        gsap.set(titleCardRef.current, { z: 95, transformStyle: 'preserve-3d' });
      }
      if (descRef.current) {
        gsap.set(descRef.current, { z: 30, transformStyle: 'preserve-3d' });
      }
      if (prologueRef.current) {
        gsap.set(prologueRef.current, { z: 45, rotation: -1, transformStyle: 'preserve-3d' });
      }
      if (limeBoxRef.current) {
        gsap.set(limeBoxRef.current, { z: 45, rotation: 1, transformStyle: 'preserve-3d' });
      }
      if (swooshRef.current) {
        gsap.set(swooshRef.current, { z: 60, transformStyle: 'preserve-3d' });
      }
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { z: 60, transformStyle: 'preserve-3d' });
      }

      const dispX = isMobile ? 320 : 540;
      const dispY = isMobile ? 260 : 380;
      const boomX = isMobile ? 300 : 550;
      const boomY = isMobile ? 240 : 320;
      const titleY = isMobile ? 320 : 480;
      const swooshY = isMobile ? 260 : 380;

      if (prologueRef.current) {
        cameraTl.to(prologueRef.current, { x: -dispX, y: -dispY, opacity: 0, scale: isMobile ? 1.3 : 1.8, duration: 0.75, ease: 'power1.in' }, 0);
      }
      if (limeBoxRef.current) {
        cameraTl.to(limeBoxRef.current, { x: dispX, y: -dispY, opacity: 0, scale: isMobile ? 1.3 : 1.8, duration: 0.75, ease: 'power1.in' }, 0);
      }
      if (boomStickerRef.current) {
        cameraTl.to(boomStickerRef.current, { x: boomX, y: -boomY, z: 85, rotation: -6, opacity: 0, scale: isMobile ? 1.6 : 2.5, duration: 0.75, ease: 'power1.in' }, 0);
      }
      if (titleCardRef.current) {
        cameraTl.to(titleCardRef.current, { y: titleY, z: 95, opacity: 0, scale: isMobile ? 1.6 : 2.4, duration: 0.75, ease: 'power1.in' }, 0);
      }
      if (descRef.current) {
        cameraTl.to(descRef.current, { y: isMobile ? 200 : 300, opacity: 0, scale: isMobile ? 1.2 : 1.5, duration: 0.65, ease: 'power1.in' }, 0);
      }
      if (swooshRef.current) {
        cameraTl.to(swooshRef.current, { x: -dispX, y: swooshY, opacity: 0, scale: isMobile ? 1.3 : 1.8, duration: 0.75, ease: 'power1.in' }, 0);
      }
      if (ctaRef.current) {
        cameraTl.to(ctaRef.current, { x: dispX, y: swooshY, opacity: 0, scale: isMobile ? 1.3 : 1.8, duration: 0.75, ease: 'power1.in' }, 0);
      }
      if (bgRaysRef.current) {
        cameraTl.to(bgRaysRef.current, { scale: isMobile ? 3 : 4, opacity: 0, duration: 0.8, ease: 'power1.in' }, 0);
      }
      if (cornerMarksRef.current) {
        cameraTl.to(cornerMarksRef.current, { scale: 2, opacity: 0, duration: 0.8, ease: 'power1.in' }, 0);
      }
      if (telemetryRef.current) {
        cameraTl.to(telemetryRef.current, { opacity: 0, y: isMobile ? 120 : 180, duration: 0.8, ease: 'power1.in' }, 0);
      }
      if (frameBadgesRef.current) {
        cameraTl.to(frameBadgesRef.current, { opacity: 0, duration: 0.5, ease: 'power1.in' }, 0);
      }

      cameraTl.to(
        panelFrame,
        {
          borderWidth: 0,
          boxShadow: '0px 0px 0px rgba(0,0,0,0)',
          duration: 0.8,
          ease: 'power1.inOut'
        },
        0
      );

      cameraTl.to(
        comicImg,
        {
          opacity: 0,
          scale: 1.15,
          duration: 0.28,
          ease: 'power2.inOut'
        },
        0.58
      );

      cameraTl.to(
        videoContainer,
        {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.28,
          ease: 'power2.inOut'
        },
        0.65
      );

      const scrollDistance = isMobile ? '+=1250' : '+=2000';
      const triggerThreshold = isMobile ? 0.68 : 0.75;

      const st = ScrollTrigger.create({
        trigger: pinWrapper,
        start: 'top top',
        end: scrollDistance,
        pin: true,
        scrub: isMobile ? 0.35 : 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (isReversedRef.current) return;

          const p = self.progress;
          setScrollProgress(p);

          if (p > 0.05) {
            setIsZooming(true);
            isZoomingRef.current = true;
          } else {
            setIsZooming(false);
            isZoomingRef.current = false;
          }

          if (!isVideoActiveRef.current) {
            gsap.to(cameraTl, {
              progress: p,
              duration: isMobile ? 0.45 : 0.8,
              ease: 'power2.out',
              overwrite: 'auto'
            });

            if (p >= triggerThreshold) {
              isVideoActiveRef.current = true;
              gsap.to(cameraTl, {
                progress: 1,
                duration: 0.45,
                ease: 'power2.out',
                overwrite: 'auto'
              });
              setIsVideoPlaying(true);
              if (video && video.paused && !video.ended) {
                video.play().catch(() => { });
              }
            }
          }
        }
      });
      stRef.current = st;

      const handleScrollReset = () => {
        if (window.scrollY <= 10 && !isReversedRef.current) {
          isReversedRef.current = false;
          isVideoActiveRef.current = false;
          setIsVideoPlaying(false);
          setVideoEnded(false);
          setIsZooming(false);
          isZoomingRef.current = false;
          cameraTl.progress(0);
        }
      };
      const handleResize = () => {
        if (!isVideoActiveRef.current && !isZoomingRef.current) {
          const updated = getZoomTarget();
          gsap.set(cameraRig, { transformOrigin: updated.origin });
        }
      };
      window.addEventListener('resize', handleResize, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScrollReset);
        window.removeEventListener('resize', handleResize);
        st.kill();
        stRef.current = null;
      };
    };

    mm.add('(min-width: 1024px)', () => setupCameraTimeline(false));
    mm.add('(max-width: 1023px)', () => setupCameraTimeline(true));

    return () => mm.revert();
  }, [isDark]);

  useEffect(() => {
    if (isVideoPlaying) {
      const preventScroll = (e) => {
        e.preventDefault();
      };
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      return () => {
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isVideoPlaying]);

  const runReverseCameraAnimation = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsVideoPlaying(false);
    isReversedRef.current = true;
    isVideoActiveRef.current = false;

    if (cameraTlRef.current) {
      cameraTlRef.current.tweenTo(0, {
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          setIsVideoMounted(false);
          setVideoEnded(true);
          setIsZooming(false);
          isZoomingRef.current = false;
          setScrollProgress(0);

          const elementsToReset = [
            cameraRigRef.current,
            boardRef.current,
            panelFrameRef.current,
            comicImageRef.current,
            prologueRef.current,
            limeBoxRef.current,
            boomStickerRef.current,
            titleCardRef.current,
            descRef.current,
            swooshRef.current,
            ctaRef.current,
            bgRaysRef.current,
            cornerMarksRef.current,
            telemetryRef.current,
            frameBadgesRef.current
          ].filter(Boolean);

          gsap.set(elementsToReset, { clearProps: 'x,y,scale,opacity' });
          if (cameraRigRef.current) {
            gsap.set(cameraRigRef.current, { scale: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, transformOrigin: 'center center' });
          }
          if (comicImageRef.current) {
            gsap.set(comicImageRef.current, { opacity: 1, scale: 1 });
          }

          if (boomStickerRef.current) {
            boomStickerRef.current.style.transform = 'translateZ(85px) rotate(-6deg)';
            boomStickerRef.current.style.transformStyle = 'preserve-3d';
            boomStickerRef.current.style.zIndex = '40';
            boomStickerRef.current.style.opacity = '1';
          }
          if (titleCardRef.current) {
            titleCardRef.current.style.transform = 'translateZ(95px)';
            titleCardRef.current.style.transformStyle = 'preserve-3d';
            titleCardRef.current.style.zIndex = '50';
            titleCardRef.current.style.opacity = '1';
          }
          if (descRef.current) {
            descRef.current.style.transform = 'translateZ(30px)';
            descRef.current.style.transformStyle = 'preserve-3d';
            descRef.current.style.opacity = '1';
          }
          if (prologueRef.current) {
            prologueRef.current.style.transform = 'translateZ(45px) rotate(-1deg)';
            prologueRef.current.style.transformStyle = 'preserve-3d';
            prologueRef.current.style.opacity = '1';
          }
          if (limeBoxRef.current) {
            limeBoxRef.current.style.transform = 'translateZ(45px) rotate(1deg)';
            limeBoxRef.current.style.transformStyle = 'preserve-3d';
            limeBoxRef.current.style.opacity = '1';
          }
          if (swooshRef.current) {
            swooshRef.current.style.transform = 'translateZ(60px)';
            swooshRef.current.style.transformStyle = 'preserve-3d';
            swooshRef.current.style.opacity = '1';
          }
          if (ctaRef.current) {
            ctaRef.current.style.transform = 'translateZ(60px)';
            ctaRef.current.style.transformStyle = 'preserve-3d';
            ctaRef.current.style.opacity = '1';
          }
          if (panelFrameRef.current) {
            panelFrameRef.current.style.borderWidth = '3px';
            panelFrameRef.current.style.boxShadow = isDark
              ? '8px 8px 0px #000000, 16px 16px 0px rgba(0,0,0,0.4)'
              : '8px 8px 0px #000000, 16px 16px 0px rgba(0,0,0,0.14)';
          }
          if (frameBadgesRef.current) {
            frameBadgesRef.current.style.opacity = '1';
          }
          if (telemetryRef.current) {
            telemetryRef.current.style.opacity = '1';
          }
          if (bgRaysRef.current) {
            bgRaysRef.current.style.opacity = '1';
          }
          if (cornerMarksRef.current) {
            cornerMarksRef.current.style.opacity = '1';
          }

          setTimeout(() => {
            if (stRef.current) {
              try {
                stRef.current.kill(true);
              } catch { }
              stRef.current = null;
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
            ScrollTrigger.refresh();
          }, 80);
        }
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setVideoProgress((current / duration) * 100);
  };

  const handleVideoEnded = () => {
    runReverseCameraAnimation();
  };

  const triggerReverseCamera = () => {
    runReverseCameraAnimation();
  };

  const handleDiveIntoWindow = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isVideoActiveRef.current) return;

    if (stRef.current) {
      const targetScroll = stRef.current.start + (stRef.current.end - stRef.current.start) * 0.78;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    } else if (cameraTlRef.current) {
      gsap.to(cameraTlRef.current, {
        progress: 1,
        duration: 1.1,
        ease: 'power2.inOut',
        onComplete: () => {
          setIsVideoPlaying(true);
          if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
          }
        }
      });
    }
  };

  useEffect(() => {
    const hero = heroRef.current;
    const board = boardRef.current;
    if (!hero || !board) return;

    if (isZooming) {
      gsap.to(board, { rotateX: 0, rotateY: 0, duration: 0.3, overwrite: 'auto' });
      return;
    }

    let isHovered = false;

    const idleTween = gsap.to(board, {
      rotateX: 1.5,
      rotateY: -1.5,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      paused: false
    });

    const handleMouseMove = (e) => {
      if (isZooming) return;

      isHovered = true;
      idleTween.pause();

      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          gsap.to(board, {
            rotateY: x * 12,
            rotateX: -y * 10,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 1200,
            transformOrigin: 'center center',
            overwrite: 'auto'
          });

          if (bgRaysRef.current) {
            gsap.to(bgRaysRef.current, { x: -x * 20, y: -y * 15, duration: 0.7, ease: 'power2.out', overwrite: 'auto' });
          }
          if (prologueRef.current) {
            gsap.to(prologueRef.current, { x: x * 15, y: y * 10, rotateZ: -1 + x * 3, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
          }
          if (limeBoxRef.current) {
            gsap.to(limeBoxRef.current, { x: x * 16, y: y * 12, rotateZ: 1 + x * 3, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
          }
          if (boomStickerRef.current) {
            gsap.to(boomStickerRef.current, { x: x * 28, y: y * 20, z: 85, rotateZ: -6 + x * 6, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
          }
          if (titleCardRef.current) {
            gsap.to(titleCardRef.current, { x: x * 20, y: y * 14, z: 95, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
            const shadowX = 8 - x * 20;
            const shadowY = 12 - y * 16;
            titleCardRef.current.style.boxShadow = isDark
              ? `${shadowX}px ${shadowY}px 0px #000000, ${shadowX * 1.5}px ${shadowY * 1.5}px 12px rgba(168,85,247,0.3)`
              : `${shadowX}px ${shadowY}px 0px #000000, ${shadowX * 1.5}px ${shadowY * 1.5}px 8px rgba(56,189,248,0.25)`;
          }
          if (descRef.current) {
            gsap.to(descRef.current, { x: x * 10, y: y * 8, z: 30, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
          }
          if (swooshRef.current) {
            gsap.to(swooshRef.current, { x: x * 18, y: y * 14, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
          }
          if (ctaRef.current) {
            gsap.to(ctaRef.current, { x: x * 14, y: y * 10, duration: 0.55, ease: 'power2.out', overwrite: 'auto' });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    let ticking = false;

    const handleMouseLeave = () => {
      isHovered = false;
      if (isZooming) return;

      gsap.to(board, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => {
          if (!isHovered && !isZooming) idleTween.play();
        }
      });

      if (bgRaysRef.current) gsap.to(bgRaysRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      if (prologueRef.current) gsap.to(prologueRef.current, { x: 0, y: 0, rotateZ: -1, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      if (limeBoxRef.current) gsap.to(limeBoxRef.current, { x: 0, y: 0, rotateZ: 1, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      if (boomStickerRef.current) gsap.to(boomStickerRef.current, { x: 0, y: 0, z: 85, rotateZ: -6, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      if (titleCardRef.current) {
        gsap.to(titleCardRef.current, { x: 0, y: 0, z: 95, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        titleCardRef.current.style.boxShadow = isDark
          ? '8px 12px 0px #000000, 16px 20px 16px rgba(168,85,247,0.3)'
          : '8px 12px 0px #000000, 16px 20px 10px rgba(56,189,248,0.2)';
      }
      if (descRef.current) gsap.to(descRef.current, { x: 0, y: 0, z: 30, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      if (swooshRef.current) gsap.to(swooshRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      if (ctaRef.current) gsap.to(ctaRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
    };

    hero.addEventListener('mousemove', handleMouseMove, { passive: true });
    hero.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      idleTween.kill();
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDark, isZooming]);

  return (
    <>
      {isVideoMounted && typeof document !== 'undefined' && createPortal(
        <div
          ref={videoContainerRef}
          className="fixed inset-0 z-50 opacity-0 pointer-events-none bg-black flex items-center justify-center"
        >
          <video
            ref={videoRef}
            src={videoBlobUrl || videoSrc}
            playsInline
            preload="auto"
            muted={isMuted}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

          <div className="absolute top-0 left-0 right-0 p-3 sm:p-6 flex items-center justify-between z-40 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono-tech text-[10px] sm:text-xs text-[#bef264]">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
              <span className="font-bold">LIVE FEED // HEROVID1.MP4</span>
              <span className="text-stone-400 hidden md:inline">
                | {isHeroVideoLoaded ? 'MEMORY BUFFERED // ZERO LAG' : '4K ARCHIVE TRANSMISSION'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="bg-black/80 hover:bg-black text-[#bef264] border border-[#bef264] px-2.5 sm:px-3 py-1 font-mono-tech text-[10px] sm:text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{isMuted ? '🔇' : '🔊'}</span>
                <span>{isMuted ? 'UNMUTE' : 'MUTED'}</span>
              </button>

              <button
                onClick={triggerReverseCamera}
                title="Reverse camera back to comic desk"
                className="bg-[#ef4444] hover:bg-red-600 text-white border border-white px-2.5 sm:px-3 py-1 font-mono-tech text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 shadow-lg"
              >
                <span>↺</span>
                <span className="hidden sm:inline">REVERSE CAMERA</span>
                <span className="sm:hidden">EXIT</span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <span className="font-mono-tech text-xs text-white/80">LIVE</span>
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ef4444] transition-all duration-100"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              <span className="font-mono-tech text-xs text-[#bef264] font-bold">
                {Math.round(videoProgress)}%
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div ref={pinWrapperRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">

        <div
          ref={cameraRigRef}
          className="w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
        >
          <section
            ref={heroRef}
            className="relative w-full px-2 xs:px-3 sm:px-6 py-2 xs:py-3 sm:py-6 max-w-[1300px] mx-auto"
            style={{ perspective: '1400px' }}
          >
            <div
              ref={boardRef}
              className="relative border-2 border-black dark:border-[#38383e] p-3 sm:p-8 min-h-0 sm:min-h-[680px] flex flex-col justify-between transition-colors duration-300"
              style={{
                transformStyle: 'preserve-3d',
                backgroundColor: isDark ? '#121215' : '#fafaf6',
                boxShadow: isDark
                  ? '6px 6px 0px #000000, 12px 12px 0px rgba(0,0,0,0.5)'
                  : '6px 6px 0px #000000, 12px 12px 0px rgba(0,0,0,0.08)'
              }}
            >
              <div ref={cornerMarksRef} className="contents">
                <div
                  className="absolute top-1.5 left-2 sm:top-2 sm:left-3 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-600 dark:text-stone-400 select-none z-20 pointer-events-none"
                  style={{ transform: 'translateZ(15px)' }}
                >
                  + C_01
                </div>
                <div
                  className="absolute top-1.5 right-2 sm:top-2 sm:right-3 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-600 dark:text-stone-400 select-none z-20 pointer-events-none"
                  style={{ transform: 'translateZ(15px)' }}
                >
                  C_02 +
                </div>
                <div
                  className="absolute bottom-1.5 left-2 sm:bottom-2 sm:left-3 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-600 dark:text-stone-400 select-none z-20 pointer-events-none"
                  style={{ transform: 'translateZ(15px)' }}
                >
                  + C_03
                </div>
                <div
                  className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-3 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-600 dark:text-stone-400 select-none z-20 pointer-events-none"
                  style={{ transform: 'translateZ(15px)' }}
                >
                  C_04 +
                </div>
              </div>

              <div
                ref={bgRaysRef}
                className="absolute inset-0 overflow-hidden pointer-events-none z-0"
                style={{ transform: 'translateZ(-15px)' }}
              >
                <svg
                  className="w-full h-full opacity-25 dark:opacity-15"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.75" />
                  <line x1="100%" y1="0" x2="0" y2="100%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.75" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.75" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.75" />
                  <line x1="25%" y1="0" x2="50%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="75%" y1="0" x2="50%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="25%" x2="50%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="100%" y1="25%" x2="50%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" strokeDasharray="3 3" />
                </svg>
              </div>

              <div
                className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pt-1 sm:pt-4 px-1 sm:px-4 mb-3 sm:mb-6"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  ref={prologueRef}
                  className="border-2 border-black dark:border-[#38383e] p-2.5 sm:p-4 max-w-full sm:max-w-sm transition-colors duration-300 cursor-default"
                  style={{
                    backgroundColor: isDark ? '#18181c' : '#ffffff',
                    transform: 'translateZ(45px) rotate(-1deg)',
                    boxShadow: isDark
                      ? '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.3)'
                      : '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.12)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="flex items-center gap-1.5 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-800 dark:text-stone-300 uppercase mb-0.5 sm:mb-1">
                    <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#ef4444]"></span>
                    <span>NARRATIVE PROLOGUE:</span>
                  </div>
                  <InkText
                    as="div"
                    strokeColor={isDark ? '#ffffff' : '#000000'}
                    fillColor={isDark ? '#ffffff' : '#000000'}
                    strokeWidth="1.2px"
                    delay={200}
                    duration={1800}
                    className="font-heading font-bold text-xs sm:text-base md:text-lg tracking-tight text-black dark:text-white"
                    text='"THIS IS NOT JUST A WEBSITE."'
                  />
                </div>

                <div
                  ref={limeBoxRef}
                  className="bg-[#bef264] border-2 border-black px-3 py-1.5 sm:px-4 sm:py-2 font-mono-tech font-bold text-[11px] sm:text-sm text-black flex items-center gap-1.5 flex-wrap cursor-default self-start sm:self-auto"
                  style={{
                    transform: 'translateZ(45px) rotate(1deg)',
                    boxShadow: isDark
                      ? '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.35)'
                      : '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.12)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <TypewriterText
                    as="span"
                    speed={14}
                    delay={200}
                    cursor={false}
                    text="IT'S A STORY YOU SCROLL THROUGH."
                  />
                  <span className="hidden sm:inline">//</span>
                  <span className="font-heading font-black tracking-wider text-black hidden sm:inline">
                    NEVER STOP SCROLLING.
                  </span>
                </div>
              </div>

              <div
                ref={windowWrapperRef}
                className="relative z-10 max-w-4xl mx-auto w-full my-2 sm:my-8 px-1 sm:px-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="relative z-10"
                  style={{
                    transform: 'translateZ(25px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <UnfoldPanel direction="right" duration={1.2} delay={0.15}>
                    <div
                      ref={panelFrameRef}
                      onClick={handleDiveIntoWindow}
                      role="button"
                      tabIndex={0}
                      title="Tap or scroll down to dive into window"
                      className="relative border-3 border-black dark:border-[#38383e] overflow-hidden bg-black aspect-[16/10] sm:aspect-[2.35/1] w-full transition-shadow duration-300 cursor-pointer group"
                      style={{
                        boxShadow: isDark
                          ? '6px 6px 0px #000000, 12px 12px 0px rgba(0,0,0,0.4)'
                          : '6px 6px 0px #000000, 12px 12px 0px rgba(0,0,0,0.14)'
                      }}
                    >
                      <img
                        ref={comicImageRef}
                        src="/ogmedia/assets/hero_city.webp"
                        alt="Neo-Seoul Manga Overview"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover object-center scale-100 transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 manga-halftone-light opacity-20 pointer-events-none" />

                      <div ref={frameBadgesRef} className="contents">
                        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20">
                          <div className="bg-white/95 dark:bg-black/90 text-black dark:text-white border border-black dark:border-stone-700 px-2 py-0.5 sm:px-2.5 sm:py-0.5 font-mono-tech font-bold text-[8px] sm:text-[11px] shadow-sm">
                            <span className="sm:hidden">FRAME: 001_A</span>
                            <span className="hidden sm:inline">FRAME: ARCHIVE_001_A // OVERVIEW PERSPECTIVE</span>
                          </div>
                        </div>

                        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20">
                          <span className="bg-[#bef264] text-black font-mono-tech font-bold text-[8px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 border border-black shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
                            <span>▶</span>
                            <span className="hidden sm:inline">WATCH 4K STREAM</span>
                            <span className="sm:hidden">4K PLAY</span>
                          </span>
                        </div>

                        <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-3 z-20">
                          <span className="bg-black/85 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[#bef264] font-mono-tech font-bold text-[8px] sm:text-xs tracking-wider border border-black/40">
                            SEOUL GRID: SECTOR 07
                          </span>
                        </div>
                      </div>
                    </div>
                  </UnfoldPanel>
                </div>

                <div
                  ref={boomStickerRef}
                  className="absolute -top-7 sm:-top-14 right-2 sm:right-6 z-40 flex flex-col items-center select-none group cursor-help"
                  style={{
                    transform: 'translateZ(85px) rotate(-6deg)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <span className="font-heading text-4xl sm:text-7xl text-[#ef4444] font-black tracking-tighter drop-shadow-[3px_3px_0px_#000] sm:drop-shadow-[4px_4px_0px_#000] drop-shadow-[6px_6px_0px_rgba(0,0,0,0.4)]">
                    BOOM!
                  </span>
                  <div
                    className="bg-black text-white font-mono-tech font-extrabold text-[9px] sm:text-xs px-2.5 py-0.5 border border-black transform rotate-3 -mt-2 sm:-mt-3"
                    style={{
                      boxShadow: '2px 2px 0px #ef4444'
                    }}
                  >
                    INTRO
                  </div>
                </div>

                <div
                  ref={titleCardRef}
                  className="relative z-50 text-center -mt-4 sm:-mt-14"
                  style={{
                    transform: 'translateZ(95px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div
                    className="inline-block border-3 border-black dark:border-[#38383e] px-6 sm:px-14 py-1.5 sm:py-3.5 transition-colors duration-300 cursor-default"
                    style={{
                      backgroundColor: isDark ? '#16161a' : '#ffffff',
                      boxShadow: isDark
                        ? '6px 8px 0px #000000, 12px 14px 0px rgba(0,0,0,0.5)'
                        : '6px 8px 0px #000000, 12px 14px 0px rgba(0,0,0,0.18)'
                    }}
                  >
                    <InkText
                      as="h1"
                      strokeColor={isDark ? '#ffffff' : '#000000'}
                      fillColor={isDark ? '#ffffff' : '#000000'}
                      strokeWidth="1.4px"
                      delay={200}
                      duration={2400}
                      className="text-4xl sm:text-7xl md:text-8xl font-bold font-comic-title tracking-wider leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)] select-none text-black dark:text-white"
                      text="OG MEDIA"
                    />
                  </div>

                  <div className="block -mt-1 sm:-mt-2">
                    <div
                      className="inline-block bg-black text-[#bef264] px-3 sm:px-6 py-1 sm:py-1.5 font-mono-tech font-extrabold text-[10px] sm:text-sm md:text-base tracking-wider sm:tracking-widest uppercase border border-stone-800 dark:border-stone-700 cursor-default"
                      style={{
                        boxShadow: '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.3)'
                      }}
                    >
                      <InkText
                        as="span"
                        strokeColor="#bef264"
                        fillColor="#bef264"
                        strokeWidth="1px"
                        delay={500}
                        duration={2000}
                        text="CINEMATIC IP // KOREAN MANHWA ARCHIVE"
                      />
                    </div>
                  </div>
                </div>

                <div ref={descRef} style={{ transform: 'translateZ(30px)' }}>
                  <TypewriterText
                    delay={750}
                    speed={12}
                    className="max-w-2xl mx-auto text-stone-800 dark:text-stone-300 font-medium text-xs sm:text-sm md:text-base leading-relaxed text-center mt-3 sm:mt-8 mb-3 sm:mb-6 px-2 sm:px-4"
                    text="We forge brand worldbuilding, dynamic digital experiences, and high-impact intellectual properties with the relentless momentum and visual intensity of premier webtoons."
                  />
                </div>

                <div
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 pt-1 sm:pt-2 px-1 sm:px-4"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    ref={swooshRef}
                    className="flex flex-col items-center sm:items-start select-none group cursor-help"
                    style={{
                      transform: 'translateZ(60px)',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <InkText
                      as="div"
                      strokeColor={isDark ? '#ffffff' : '#000000'}
                      fillColor={isDark ? '#ffffff' : '#000000'}
                      strokeWidth="1.2px"
                      delay={400}
                      duration={1800}
                      className="font-heading text-2xl sm:text-5xl text-black dark:text-white font-black tracking-tight leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
                      text="SWOO-OOSH!"
                    />
                    <div
                      className="bg-[#bef264] text-black font-mono-tech font-extrabold text-[9px] sm:text-[11px] px-1.5 py-0.5 border border-black -mt-0.5 sm:-mt-1"
                      style={{
                        boxShadow: '2px 2px 0px #000000, 4px 4px 0px rgba(0,0,0,0.15)'
                      }}
                    >
                      [SWOOSH: SPEED VECTOR]
                    </div>
                  </div>

                  <div
                    ref={ctaRef}
                    className="w-full sm:w-auto flex items-center justify-center gap-3"
                    style={{
                      transform: 'translateZ(50px)',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleDiveIntoWindow}
                      className="w-full sm:w-auto justify-center bg-black dark:bg-[#18181c] hover:bg-stone-900 dark:hover:bg-black text-white font-mono-tech font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 border-2 border-black dark:border-stone-700 flex items-center gap-2 transition-all duration-200 active:translate-x-1 active:translate-y-1 cursor-pointer shadow-[4px_4px_0px_#000] sm:shadow-[5px_5px_0px_#000]"
                    >
                      <span>SCROLL OR TAP TO DIVE INTO WINDOW</span>
                      <span className="text-[#bef264]">↓</span>
                    </button>
                    <div
                      className="bg-white dark:bg-[#18181c] text-stone-600 dark:text-stone-400 font-mono-tech text-xs px-3 py-2.5 border border-stone-300 dark:border-stone-700 hidden lg:block"
                      style={{
                        boxShadow: '3px 3px 0px rgba(0,0,0,0.15)'
                      }}
                    >
                      [SYS_PROMPT: 24 FRAMES LOADED]
                    </div>
                  </div>
                </div>
              </div>

              <div
                ref={telemetryRef}
                className="relative z-10 border-t border-black dark:border-stone-800 pt-2 sm:pt-2.5 mt-2 sm:mt-4 flex items-center justify-between font-mono-tech text-[9px] sm:text-xs text-stone-600 dark:text-stone-400 px-1"
                style={{ transform: 'translateZ(15px)' }}
              >
                <div>00:00:01 // SCENE_INIT</div>
                <div className="flex items-center gap-2">
                  <span className="tracking-widest text-black dark:text-white font-bold">•••</span>
                  <div className="w-12 sm:w-16 h-1.5 bg-[#bef264] border border-black dark:border-stone-700"></div>
                </div>
                <div>CHAPTER 00 : PROLOGUE FINISHED</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

