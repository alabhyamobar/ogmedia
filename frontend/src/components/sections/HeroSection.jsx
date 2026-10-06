import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../context/ThemeContext';
import { useVideoPreload } from '../../context/VideoPreloadContext';

import {
  HeroStructuredData,
  HeroBgCanvas,
  HeroPrologueBar,
  HeroOgEffectSticker,
  HeroMangaPanel,
  HeroTitleCard,
  HeroActionFooter,
  HeroTelemetryBar,
  HeroVideoPortal
} from './hero';

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
      {/* Schema.org Structured Data for Search Engine Optimization */}
      <HeroStructuredData />

      {/* Full-screen 4K interactive video portal */}
      <HeroVideoPortal
        isVideoMounted={isVideoMounted}
        videoContainerRef={videoContainerRef}
        videoRef={videoRef}
        videoSrc={videoSrc}
        videoBlobUrl={videoBlobUrl}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onReverseCamera={triggerReverseCamera}
        videoProgress={videoProgress}
        isHeroVideoLoaded={isHeroVideoLoaded}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      />

      {/* Fixed scroll trigger pin wrapper */}
      <div ref={pinWrapperRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        <div
          ref={cameraRigRef}
          className="w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
        >
          <section
            ref={heroRef}
            aria-label="OG Media Hero Showcase"
            className="relative w-full px-2 xs:px-3 sm:px-6 py-2 xs:py-3 sm:py-6 max-w-[1300px] mx-auto overflow-x-hidden sm:overflow-x-visible"
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
              {/* Background drafting rays and viewfinder corner marks */}
              <HeroBgCanvas
                bgRaysRef={bgRaysRef}
                cornerMarksRef={cornerMarksRef}
                isDark={isDark}
              />

              {/* Narrative dialogue prologue and vision typewriter badge */}
              <HeroPrologueBar
                prologueRef={prologueRef}
                limeBoxRef={limeBoxRef}
                isDark={isDark}
              />

              {/* Central Drafting Window & Brand Title Anchor */}
              <div
                ref={windowWrapperRef}
                className="relative z-10 max-w-4xl mx-auto w-full my-2 sm:my-8 px-1 sm:px-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Visual Comic Frame */}
                <HeroMangaPanel
                  panelFrameRef={panelFrameRef}
                  comicImageRef={comicImageRef}
                  frameBadgesRef={frameBadgesRef}
                  onDive={handleDiveIntoWindow}
                  isDark={isDark}
                />

                {/* 3D Tilted Sticker: IMPACT */}
                <HeroOgEffectSticker ref={boomStickerRef} />

                {/* Main Brand Title Card & SEO Value Proposition */}
                <HeroTitleCard
                  titleCardRef={titleCardRef}
                  descRef={descRef}
                  isDark={isDark}
                />

                {/* Action Footer: Comic SFX & Window Dive CTA */}
                <HeroActionFooter
                  swooshRef={swooshRef}
                  ctaRef={ctaRef}
                  onDive={handleDiveIntoWindow}
                  isDark={isDark}
                />
              </div>

              {/* Scene Timestamp & Chapter Telemetry */}
              <HeroTelemetryBar telemetryRef={telemetryRef} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
