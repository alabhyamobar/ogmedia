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
  const portalGlowRef = useRef(null);
  const frameBadgesRef = useRef(null);
  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);
  const cameraTlRef = useRef(null);
  const stRef = useRef(null);
  const idleTweenRef = useRef(null);
  const isVideoActiveRef = useRef(false);
  const isReversedRef = useRef(false);
  const isZoomingRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const isScrollLockedRef = useRef(false);
  const touchStartYRef = useRef(0);

  const lockScrollingSystem = () => {
    isScrollLockedRef.current = true;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const unlockScrollingSystem = () => {
    isScrollLockedRef.current = false;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  const [_scrollProgress, setScrollProgress] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [_videoEnded, setVideoEnded] = useState(false);
  const [isVideoMounted, setIsVideoMounted] = useState(true);

  const setHeroZoomActive = (active) => {
    isZoomingRef.current = active;
    setIsZooming(active);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('hero-zoom-active', active);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('og:hero-zoom-change', { detail: { active } }));
    }
  };

  useEffect(() => {
    // If user arrived with a specific anchor hash (e.g. #arsenal, #trajectory), skip hero pin
    if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#hero') {
      hasCompletedRef.current = true;
      unlockScrollingSystem();
      setHeroZoomActive(false);
      return;
    }

    // Set scrollRestoration to manual so reloading starts at top
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Ensure clean start at top for landing experience
    window.scrollTo({ top: 0, behavior: 'instant' });
    hasCompletedRef.current = false;
    unlockScrollingSystem();
    setHeroZoomActive(false);

    return () => {
      unlockScrollingSystem();
      setHeroZoomActive(false);
    };
  }, []);

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

    const setupCameraTimeline = (isMobile = false) => {
      // Calculate dynamic transform origin and translate vector to keep panelFrame dead-center on screen
      const getZoomTarget = () => {
        if (!cameraRig || !panelFrame) {
          return { origin: 'center center', x: 0, y: 0, scale: isMobile ? 5.2 : 4.4 };
        }

        // Temporarily reset board rotation to 0 to accurately measure panelFrame center without tilt distortion
        const currRotX = gsap.getProperty(board, 'rotateX') || 0;
        const currRotY = gsap.getProperty(board, 'rotateY') || 0;
        const currRotZ = gsap.getProperty(board, 'rotateZ') || 0;
        gsap.set(board, { rotateX: 0, rotateY: 0, rotateZ: 0 });
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
        const coverScale = Math.max(scaleX, scaleY) * (isMobile ? 1.08 : 1.15);
        const targetScale = Math.max(coverScale, isMobile ? 5.2 : 4.4);

        // Restore board rotation
        gsap.set(board, { rotateX: currRotX, rotateY: currRotY, rotateZ: currRotZ });

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

      // 1. Camera Zoom into the Manga Window (Normalized 1.0 duration for ScrollTrigger scrub)
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
          duration: 1.0
        },
        0
      );

      // 2. Smoothly level board tilt to 0 immediately so zooming is orthogonal and clean
      cameraTl.to(
        board,
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          duration: 0.35,
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
      const boomX = isMobile ? 320 : 550;
      const boomY = isMobile ? 220 : 320;
      const titleY = isMobile ? 320 : 480;
      const swooshY = isMobile ? 260 : 380;

      // 3. Peripheral HUD & stickers fly past the camera with 3D parallax
      if (prologueRef.current) {
        cameraTl.to(prologueRef.current, { x: -dispX, y: -dispY, opacity: 0, scale: 1.8, duration: 0.65, ease: 'power2.in' }, 0);
      }
      if (limeBoxRef.current) {
        cameraTl.to(limeBoxRef.current, { x: dispX, y: -dispY, opacity: 0, scale: 1.8, duration: 0.65, ease: 'power2.in' }, 0);
      }
      if (boomStickerRef.current) {
        cameraTl.to(boomStickerRef.current, { x: boomX, y: -boomY, z: 85, rotation: -6, opacity: 0, scale: 2.5, duration: 0.7, ease: 'power2.in' }, 0);
      }
      if (titleCardRef.current) {
        cameraTl.to(titleCardRef.current, { y: titleY, z: 95, opacity: 0, scale: 2.4, duration: 0.7, ease: 'power2.in' }, 0);
      }
      if (descRef.current) {
        cameraTl.to(descRef.current, { y: 300, opacity: 0, scale: 1.5, duration: 0.6, ease: 'power2.in' }, 0);
      }
      if (swooshRef.current) {
        cameraTl.to(swooshRef.current, { x: -dispX, y: swooshY, opacity: 0, scale: 1.8, duration: 0.65, ease: 'power2.in' }, 0);
      }
      if (ctaRef.current) {
        cameraTl.to(ctaRef.current, { x: dispX, y: swooshY, opacity: 0, scale: 1.8, duration: 0.65, ease: 'power2.in' }, 0);
      }
      if (bgRaysRef.current) {
        cameraTl.to(bgRaysRef.current, { scale: 4, opacity: 0, duration: 0.75, ease: 'power2.in' }, 0);
      }
      if (cornerMarksRef.current) {
        cameraTl.to(cornerMarksRef.current, { scale: 2, opacity: 0, duration: 0.75, ease: 'power2.in' }, 0);
      }
      if (telemetryRef.current) {
        cameraTl.to(telemetryRef.current, { opacity: 0, y: 180, duration: 0.75, ease: 'power2.in' }, 0);
      }
      if (frameBadgesRef.current) {
        cameraTl.to(frameBadgesRef.current, { opacity: 0, duration: 0.45, ease: 'power2.in' }, 0);
      }

      // 4. Panel Frame borders dissolve into viewport edges
      cameraTl.to(
        panelFrame,
        {
          borderWidth: 0,
          boxShadow: '0px 0px 0px rgba(0,0,0,0)',
          duration: 0.5,
          ease: 'power1.inOut'
        },
        0.25
      );

      // 5. WINDOW PENETRATION PORTAL APERTURE FLARE (The dimensional gate breach!)
      if (portalGlowRef.current) {
        // Ignite flare as camera gets close to window pane
        cameraTl.to(
          portalGlowRef.current,
          {
            opacity: 0.95,
            scale: 1.15,
            duration: 0.26,
            ease: 'power2.in'
          },
          0.40
        );
        // Expand and dissipate flare as camera pierces through into video
        cameraTl.to(
          portalGlowRef.current,
          {
            opacity: 0,
            scale: 1.6,
            duration: 0.28,
            ease: 'power2.out'
          },
          0.66
        );
      }

      // 6. Comic Illustration dissolves as camera passes through the glass plane
      cameraTl.to(
        comicImg,
        {
          opacity: 0,
          scale: 1.25,
          duration: 0.24,
          ease: 'power2.inOut'
        },
        0.54
      );

      // 7. Video Container reveals seamlessly as living canvas emerges
      cameraTl.to(
        videoContainer,
        {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.24,
          ease: 'power2.inOut'
        },
        0.64
      );


      let st = null;
      if (!isMobile && !hasCompletedRef.current) {
        st = ScrollTrigger.create({
          trigger: pinWrapper,
          start: 'top top',
          end: '+=1500',
          pin: true,
          animation: cameraTl,
          scrub: 1.0,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (hasCompletedRef.current) return;
            const p = self.progress;

            if (p > 0.02) {
              if (!isZoomingRef.current) {
                setHeroZoomActive(true);
              }
            } else if (p <= 0.02 && !isVideoActiveRef.current) {
              if (isZoomingRef.current) {
                setHeroZoomActive(false);
              }
            }

            if (p >= 0.85) {
              if (!isVideoActiveRef.current) {
                isVideoActiveRef.current = true;
                setIsVideoPlaying(true);
                setHeroZoomActive(true);
                lockScrollingSystem();

                if (cameraTlRef.current) {
                  cameraTlRef.current.tweenTo(cameraTlRef.current.duration(), {
                    duration: 0.35,
                    ease: 'power1.out'
                  });
                }
                if (video && video.paused) {
                  video.play().catch(() => {});
                }
              }
            }
          }
        });
        stRef.current = st;
      }

      const handleResize = () => {
        if (!isVideoActiveRef.current && !isZoomingRef.current && !isScrollLockedRef.current) {
          const updated = getZoomTarget();
          gsap.set(cameraRig, { transformOrigin: updated.origin });
          ScrollTrigger.refresh();
        }
      };

      window.addEventListener('resize', handleResize, { passive: true });

      return () => {
        window.removeEventListener('resize', handleResize);
        if (st) {
          st.kill();
        }
        stRef.current = null;
        if (cameraTl) {
          cameraTl.kill();
        }
        cameraTlRef.current = null;
      };
    };

    mm.add('(min-width: 1024px)', () => {
      return setupCameraTimeline(false);
    });

    mm.add('(max-width: 1023px)', () => {
      return setupCameraTimeline(true);
    });

    return () => mm.revert();
  }, [isDark]);

  // Scrolling system lock listeners:
  // Intercepts all wheel, touch, and keyboard scrolling while isScrollLockedRef.current is true!
  // Completely pins the Hero section and locks the scrolling system while video is playing
  // and while the reverse camera animation is running!
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrollLockedRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isScrollLockedRef.current) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      if (isScrollLockedRef.current) {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) {
          if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
            e.preventDefault();
          }
        }
        if (e.key === 'Escape') {
          runReverseCameraAnimation();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const finishHeroAnimation = () => {
    // 1. Permanently mark completed once so animation will NEVER loop or re-trigger
    hasCompletedRef.current = true;
    isVideoActiveRef.current = false;
    setIsVideoPlaying(false);
    setHeroZoomActive(false);

    // 2. Unpin and kill ScrollTrigger completely so pin-spacer is cleanly removed
    if (stRef.current) {
      stRef.current.kill(true);
      stRef.current = null;
    }

    // 3. Clear any leftover pin transform/styles on pinWrapper
    if (pinWrapperRef.current) {
      gsap.set(pinWrapperRef.current, { clearProps: 'transform,top,left,position,width,height' });
    }

    // 4. Reset camera timeline to initial state (0)
    if (cameraTlRef.current) {
      cameraTlRef.current.seek(0);
    }

    // 5. Set scroll cleanly to top of unpinned desk
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 6. UNLOCK the scrolling system now that reverse camera animation is completed!
    unlockScrollingSystem();

    // 7. Refresh ScrollTrigger for subsequent page sections
    ScrollTrigger.refresh();
  };

  const runReverseCameraAnimation = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }

    // Ensure scroll lock remains active during reverse animation
    lockScrollingSystem();

    // Fade out video container
    if (videoContainerRef.current) {
      gsap.to(videoContainerRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.4,
        ease: 'power2.out'
      });
    }

    // Smoothly reverse camera rig back to comic desk while STILL PINNED & SCROLL LOCKED!
    if (cameraTlRef.current) {
      cameraTlRef.current.tweenTo(0, {
        duration: 1.4,
        ease: 'power2.inOut',
        onComplete: () => {
          finishHeroAnimation();
        }
      });
    } else {
      finishHeroAnimation();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setVideoProgress((current / duration) * 100);
  };

  const handleVideoEnded = () => {
    // Video completed: smoothly reverse camera back to comic desk and unlock scroll on completion!
    runReverseCameraAnimation();
  };

  const triggerReverseCamera = () => {
    runReverseCameraAnimation();
  };

  const handleDiveIntoWindow = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isVideoActiveRef.current || isScrollLockedRef.current) return;

    // Immediately lock scrolling system so hero remains pinned and scroll is locked
    lockScrollingSystem();
    setHeroZoomActive(true);

    if (cameraTlRef.current) {
      cameraTlRef.current.tweenTo(cameraTlRef.current.duration(), {
        duration: 1.4,
        ease: 'power2.inOut',
        onComplete: () => {
          isVideoActiveRef.current = true;
          setIsVideoPlaying(true);
          setHeroZoomActive(true);
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

    if (isZoomingRef.current || isScrollLockedRef.current) {
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
    idleTweenRef.current = idleTween;

    const updateTilt = (clientX, clientY) => {
      const rect = hero.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

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
    };

    let ticking = false;

    const handleMouseMove = (e) => {
      if (isZoomingRef.current || isScrollLockedRef.current) return;

      isHovered = true;
      idleTween.pause();

      if (!ticking) {
        requestAnimationFrame(() => {
          updateTilt(e.clientX, e.clientY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleTouchMove = (e) => {
      if (isZoomingRef.current || isScrollLockedRef.current || !e.touches || !e.touches[0]) return;

      isHovered = true;
      idleTween.pause();

      if (!ticking) {
        requestAnimationFrame(() => {
          if (e.touches && e.touches[0]) {
            updateTilt(e.touches[0].clientX, e.touches[0].clientY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseLeave = () => {
      isHovered = false;
      if (isZoomingRef.current || isScrollLockedRef.current) return;

      gsap.to(board, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => {
          if (!isHovered && !isZoomingRef.current) idleTween.play();
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

    const handleTouchEnd = () => {
      handleMouseLeave();
    };

    hero.addEventListener('mousemove', handleMouseMove, { passive: true });
    hero.addEventListener('mouseleave', handleMouseLeave);
    hero.addEventListener('touchmove', handleTouchMove, { passive: true });
    hero.addEventListener('touchend', handleTouchEnd, { passive: true });
    hero.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      idleTween.kill();
      idleTweenRef.current = null;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
      hero.removeEventListener('touchmove', handleTouchMove);
      hero.removeEventListener('touchend', handleTouchEnd);
      hero.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDark]);

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

      {/* Fixed scroll trigger pin wrapper (desktop pinned; fluid on mobile) */}
      <div ref={pinWrapperRef} className="relative w-full min-h-[auto] lg:min-h-screen flex items-center justify-center overflow-hidden py-4 sm:py-6 lg:py-0">
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
                  portalGlowRef={portalGlowRef}
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
