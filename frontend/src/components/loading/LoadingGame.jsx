import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useVideoPreload } from '../../context/VideoPreloadContext';
import OgLogo from '../ui/OgLogo';

class SoundFx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.hasUserInteracted = false;
  }

  init() {
    if (!this.hasUserInteracted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  markUserInteraction() {
    this.hasUserInteracted = true;
    this.init();
  }

  playFlap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playScore() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(783.99, now + 0.07);
    osc.frequency.setValueAtTime(1046.5, now + 0.14);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  playStar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playShieldPickup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  playCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }
}

const sfx = new SoundFx();

export default function LoadingGame({ onComplete }) {
  const canvasRef = useRef(null);
  const {
    loadedBytes,
    totalBytes,
    speed,
    progress: videoProgress,
    isLoaded: isVideoLoaded
  } = useVideoPreload();

  const [displayProgress, setDisplayProgress] = useState(0);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [gameStateStatus, setGameStateStatus] = useState('READY');
  const [isForcedReady, setIsForcedReady] = useState(false);
  const isReady = Boolean((isVideoLoaded && displayProgress >= 100) || isForcedReady);
  const [isExiting, setIsExiting] = useState(false);
  
  const hasFinishedRef = useRef(false);
  const exitTimeoutRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('og_game_best') || '0', 10);
    } catch {
      return 0;
    }
  });

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    if (hour >= 18 && hour < 22) return 'Good evening';
    return 'Hello';
  }, []);

  const friendlyStatus = useMemo(() => {
    if (isReady) return 'Hero Video Ready // Archive Online!';
    if (displayProgress >= 70) return 'Calibrating digital archive...';
    if (displayProgress >= 30) return 'Buffering 4K hero video stream...';
    return 'Initializing creative engine...';
  }, [displayProgress, isReady]);

  const triggerEnterSite = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsForcedReady(true);
    setIsExiting(true);

    try {
      sessionStorage.setItem('og_has_entered', 'true');
    } catch {
      // ignore
    }

    setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 200);
  }, []);

  // Smoothly interpolate displayProgress towards real videoProgress
  useEffect(() => {
    let animId;
    const animate = () => {
      setDisplayProgress((curr) => {
        if (curr < videoProgress) {
          const diff = videoProgress - curr;
          const increment = Math.max(1, Math.ceil(diff * 0.15));
          return Math.min(videoProgress, curr + increment);
        }
        return curr;
      });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [videoProgress]);

  // Complete loading once hero video is fully loaded and ready
  useEffect(() => {
    if (isReady && !exitTimeoutRef.current && !hasFinishedRef.current) {
      exitTimeoutRef.current = setTimeout(() => {
        triggerEnterSite();
      }, 500);
    }
  }, [isReady, triggerEnterSite]);

  // Safety fallback timer in case of extreme connection stalls or offline state
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!hasFinishedRef.current) {
        setDisplayProgress(100);
        setIsForcedReady(true);
      }
    }, 15000);

    return () => {
      clearTimeout(safetyTimer);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const handleQuickSkip = () => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }
    triggerEnterSite();
  };

  const toggleSfx = () => {
    sfx.markUserInteraction();
    sfx.muted = sfxEnabled;
    setSfxEnabled(!sfxEnabled);
  };

  const gameStateRef = useRef({
    status: 'READY',
    drone: {
      x: 80,
      y: 190,
      vy: 0,
      radius: 12,
      rotation: 0,
      wingState: 0,
      trail: [],
      hasShield: false,
      shieldTime: 0
    },
    obstacles: [],
    items: [],
    particles: [],
    popups: [],
    score: 0,
    starsCollected: 0,
    shake: 0,
    frameCount: 0,
    lastSpawn: 0,
    hoverPhase: 0,
    bgOffset: 0
  });

  const jump = useCallback(() => {
    sfx.markUserInteraction();
    const gs = gameStateRef.current;

    if (gs.status === 'READY') {
      gs.status = 'PLAYING';
      setGameStateStatus('PLAYING');
      gs.drone.vy = -5.6;
      gs.drone.rotation = -0.4;
      sfx.playFlap();
      return;
    }

    if (gs.status === 'GAMEOVER') {
      gs.status = 'PLAYING';
      setGameStateStatus('PLAYING');
      gs.drone.y = 190;
      gs.drone.vy = -5.6;
      gs.drone.rotation = -0.4;
      gs.drone.trail = [];
      gs.drone.hasShield = false;
      setHasShield(false);
      gs.obstacles = [];
      gs.items = [];
      gs.particles = [];
      gs.popups = [];
      gs.score = 0;
      gs.lastSpawn = gs.frameCount;
      setScore(0);
      sfx.playFlap();
      return;
    }

    gs.drone.vy = -5.6;
    gs.drone.rotation = -0.4;
    sfx.playFlap();

    for (let i = 0; i < 4; i++) {
      gs.particles.push({
        x: gs.drone.x - 12,
        y: gs.drone.y + (Math.random() * 8 - 4),
        vx: -Math.random() * 2.5 - 1,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 2,
        life: 1,
        color: Math.random() > 0.5 ? '#bef264' : '#38bdf8'
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gravity = 0.27;
    const speed = 2.4;
    const gap = 120;

    const render = () => {
      const gs = gameStateRef.current;
      gs.frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      let shakeX = 0;
      let shakeY = 0;
      if (gs.shake > 0) {
        shakeX = (Math.random() - 0.5) * gs.shake;
        shakeY = (Math.random() - 0.5) * gs.shake;
        gs.shake *= 0.86;
        if (gs.shake < 0.2) gs.shake = 0;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      ctx.fillStyle = '#0a0a0e';
      ctx.fillRect(0, 0, width, height);

      gs.bgOffset = (gs.bgOffset + (gs.status === 'PLAYING' ? 0.5 : 0.2)) % 240;
      ctx.fillStyle = '#121218';
      const bgX = -gs.bgOffset;
      for (let sx = bgX; sx < width + 100; sx += 60) {
        ctx.fillRect(sx, height - 70, 38, 70);
        ctx.fillRect(sx + 20, height - 100, 26, 100);
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (gs.status === 'PLAYING') {
        if (gs.frameCount - gs.lastSpawn > 110) {
          const topH = Math.floor(Math.random() * (height - gap - 70)) + 35;
          gs.obstacles.push({
            x: width,
            topH,
            bottomY: topH + gap,
            passed: false
          });
          gs.lastSpawn = gs.frameCount;

          const rand = Math.random();
          if (rand > 0.3) {
            gs.items.push({
              x: width + 26,
              y: topH + gap / 2 + (Math.random() * 24 - 12),
              type: 'star',
              pulse: 0,
              collected: false
            });
          } else if (!gs.drone.hasShield && rand < 0.12) {
            gs.items.push({
              x: width + 26,
              y: topH + gap / 2,
              type: 'shield',
              pulse: 0,
              collected: false
            });
          }
        }
      }

      const pillarWidth = 46;
      for (let i = gs.obstacles.length - 1; i >= 0; i--) {
        const obs = gs.obstacles[i];
        if (gs.status === 'PLAYING') {
          obs.x -= speed;
        }

        ctx.fillStyle = '#181820';
        ctx.fillRect(obs.x, 0, pillarWidth, obs.topH);
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, 0, pillarWidth, obs.topH);

        ctx.fillStyle = '#bef264';
        ctx.fillRect(obs.x, obs.topH - 8, pillarWidth, 8);

        const botH = height - obs.bottomY;
        ctx.fillStyle = '#181820';
        ctx.fillRect(obs.x, obs.bottomY, pillarWidth, botH);
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.bottomY, pillarWidth, botH);

        ctx.fillStyle = '#bef264';
        ctx.fillRect(obs.x, obs.bottomY, pillarWidth, 8);

        if (!obs.passed && obs.x + pillarWidth < gs.drone.x) {
          obs.passed = true;
          gs.score++;
          setScore(gs.score);
          sfx.playScore();

          gs.popups.push({
            x: gs.drone.x + 20,
            y: gs.drone.y - 12,
            text: '+1 POINT',
            color: '#bef264',
            life: 1
          });

          if (gs.score > bestScore) {
            setBestScore(gs.score);
            try {
              localStorage.setItem('og_game_best', gs.score.toString());
            } catch {}
          }
        }

        if (
          gs.drone.x + gs.drone.radius > obs.x &&
          gs.drone.x - gs.drone.radius < obs.x + pillarWidth
        ) {
          if (
            gs.drone.y - gs.drone.radius < obs.topH ||
            gs.drone.y + gs.drone.radius > obs.bottomY
          ) {
            if (gs.drone.hasShield) {
              gs.drone.hasShield = false;
              setHasShield(false);
              gs.shake = 12;
              gs.popups.push({
                x: gs.drone.x,
                y: gs.drone.y,
                text: 'SHIELD PROTECTED!',
                color: '#c084fc',
                life: 1
              });
              gs.drone.y = obs.topH + gap / 2;
              gs.drone.vy = 0;
            } else if (gs.status === 'PLAYING') {
              gs.status = 'GAMEOVER';
              setGameStateStatus('GAMEOVER');
              gs.shake = 16;
              sfx.playCrash();
            }
          }
        }

        if (obs.x < -60) {
          gs.obstacles.splice(i, 1);
        }
      }

      for (let i = gs.items.length - 1; i >= 0; i--) {
        const item = gs.items[i];
        if (gs.status === 'PLAYING') {
          item.x -= speed;
        }
        item.pulse += 0.08;

        if (!item.collected) {
          const r = 7 + Math.sin(item.pulse) * 1.5;

          if (item.type === 'star') {
            ctx.beginPath();
            ctx.arc(item.x, item.y, r, 0, Math.PI * 2);
            ctx.fillStyle = '#bef264';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(item.x, item.y, r * 1.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(190, 242, 100, 0.25)';
            ctx.fill();
          } else if (item.type === 'shield') {
            ctx.beginPath();
            ctx.arc(item.x, item.y, r + 2, 0, Math.PI * 2);
            ctx.fillStyle = '#c084fc';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🛡', item.x, item.y + 3);
          }

          const dist = Math.hypot(gs.drone.x - item.x, gs.drone.y - item.y);
          if (dist < gs.drone.radius + r + 4) {
            item.collected = true;
            if (item.type === 'shield') {
              gs.drone.hasShield = true;
              setHasShield(true);
              sfx.playShieldPickup();
              gs.popups.push({
                x: item.x,
                y: item.y - 12,
                text: 'SHIELD ACTIVATED!',
                color: '#c084fc',
                life: 1
              });
            } else {
              gs.starsCollected += 1;
              setStars(gs.starsCollected);
              sfx.playStar();
              gs.popups.push({
                x: item.x,
                y: item.y - 12,
                text: '+100 STAR',
                color: '#bef264',
                life: 1
              });
            }
          }
        }

        if (item.x < -30 || item.collected) {
          gs.items.splice(i, 1);
        }
      }

      if (gs.status === 'READY') {
        gs.hoverPhase += 0.06;
        gs.drone.y = 190 + Math.sin(gs.hoverPhase) * 6;
        gs.drone.rotation = Math.sin(gs.hoverPhase) * 0.08;
        gs.drone.wingState += 0.15;
      } else if (gs.status === 'PLAYING') {
        gs.drone.vy += gravity;
        gs.drone.y += gs.drone.vy;

        if (gs.drone.vy < 0) {
          gs.drone.rotation = Math.max(-0.45, gs.drone.rotation - 0.04);
        } else {
          gs.drone.rotation = Math.min(1.0, gs.drone.rotation + 0.04);
        }

        gs.drone.wingState += 0.28;

        if (gs.frameCount % 2 === 0) {
          gs.drone.trail.unshift({ x: gs.drone.x, y: gs.drone.y, rot: gs.drone.rotation, alpha: 0.4 });
          if (gs.drone.trail.length > 5) gs.drone.trail.pop();
        }

        if (gs.drone.y - gs.drone.radius < 0) {
          gs.drone.y = gs.drone.radius;
          gs.drone.vy = 0;
        }
        if (gs.drone.y + gs.drone.radius > height) {
          gs.drone.y = height - gs.drone.radius;
          gs.status = 'GAMEOVER';
          setGameStateStatus('GAMEOVER');
          gs.shake = 16;
          sfx.playCrash();
        }
      } else if (gs.status === 'GAMEOVER') {
        if (gs.drone.y + gs.drone.radius < height) {
          gs.drone.vy += gravity * 1.5;
          gs.drone.y += gs.drone.vy;
          gs.drone.rotation = Math.min(Math.PI / 2, gs.drone.rotation + 0.15);
        }
      }

      for (let t = 0; t < gs.drone.trail.length; t++) {
        const tr = gs.drone.trail[t];
        tr.alpha *= 0.85;
        tr.x -= speed * 0.5;
        ctx.save();
        ctx.translate(tr.x, tr.y);
        ctx.rotate(tr.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 242, 100, ${tr.alpha * 0.25})`;
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(gs.drone.x, gs.drone.y);
      ctx.rotate(gs.drone.rotation);

      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190, 242, 100, 0.2)';
      ctx.fill();

      if (gs.drone.hasShield) {
        gs.drone.shieldTime += 0.08;
        ctx.save();
        ctx.rotate(gs.drone.shieldTime);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const sx = Math.cos(angle) * 20;
          const sy = Math.sin(angle) * 20;
          if (a === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-6, -8);
      ctx.lineTo(-12, -5);
      ctx.lineTo(-9, 0);
      ctx.lineTo(-12, 5);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fillStyle = '#09090b';
      ctx.fill();
      ctx.strokeStyle = '#bef264';
      ctx.lineWidth = 2;
      ctx.stroke();

      const wingY = Math.sin(gs.drone.wingState) * 5;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(2, wingY - 10);
      ctx.lineTo(7, 0);
      ctx.fillStyle = '#27272a';
      ctx.fill();
      ctx.strokeStyle = '#bef264';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#bef264';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('OG', -4, 2.5);

      ctx.restore();

      for (let i = gs.particles.length - 1; i >= 0; i--) {
        const p = gs.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.life), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) {
          gs.particles.splice(i, 1);
        }
      }

      for (let i = gs.popups.length - 1; i >= 0; i--) {
        const pop = gs.popups[i];
        pop.y -= 0.8;
        pop.life -= 0.03;

        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = pop.color;
        ctx.globalAlpha = Math.max(0, pop.life);
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.globalAlpha = 1.0;

        if (pop.life <= 0) {
          gs.popups.splice(i, 1);
        }
      }

      if (gs.status === 'READY') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OG FLIGHT MINI-GAME', width / 2, height / 2 - 16);

        ctx.fillStyle = '#bef264';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('[ Click, Tap, or Spacebar to Play ]', width / 2, height / 2 + 16);
      }

      if (gs.status === 'GAMEOVER') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Nice Try!', width / 2, height / 2 - 25);

        ctx.fillStyle = '#bef264';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`Score: ${gs.score}   |   Best: ${bestScore}`, width / 2, height / 2 + 5);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.fillText('[ Press Space or Tap to Play Again ]', width / 2, height / 2 + 35);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bestScore]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-[#ebebe5] dark:bg-[#09090b] text-stone-900 dark:text-stone-100 select-none overflow-y-auto transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 75% 50%, rgba(190, 242, 100, 0.15) 0%, transparent 60%),
          linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 28px 28px, 28px 28px'
      }}
    >
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
        <div className="bg-white dark:bg-stone-900 border-2 border-black p-2.5 manga-shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <OgLogo size="sm" withText={true} subtitle="DIGITAL CREATIVE STUDIO" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSfx}
              className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-black px-2.5 py-1 font-mono-tech text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{sfxEnabled ? '🔊' : '🔇'}</span>
              <span>Sound: {sfxEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {hasShield && (
              <div className="bg-[#c084fc] text-black font-mono-tech font-bold text-[11px] px-2.5 py-1 border border-black animate-pulse flex items-center gap-1">
                <span>🛡 Shield Ready</span>
              </div>
            )}

            <button
              onClick={handleQuickSkip}
              className="bg-white dark:bg-stone-900 hover:bg-[#bef264] hover:text-black border border-black px-3 py-1 font-mono-tech text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              title="Skip straight to site"
            >
              <span>Skip</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-stone-900 border-3 border-black p-5 sm:p-7 manga-shadow-lg space-y-4">
              
              <div className="inline-flex items-center gap-2 bg-[#bef264] text-black border-2 border-black font-mono-tech font-bold text-xs sm:text-sm px-3 py-1 manga-shadow-sm transform -rotate-1">
                <span>👋</span>
                <span>{greetingTime}, Welcome!</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-black dark:text-white leading-tight">
                Creative Digital Experiences
              </h1>

              <p className="font-sans text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Welcome to OG Media. We create high-impact brand stories, viral media, and interactive digital worlds. Enjoy this quick flight mini-game while we get things ready for you!
              </p>

              <div className="bg-stone-50 dark:bg-stone-800/60 border-2 border-black p-3.5 space-y-2">
                <div className="flex items-center justify-between font-mono-tech text-xs font-bold text-black dark:text-white">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-[#16a34a]' : 'bg-[#bef264] animate-ping'}`} />
                    <span>{friendlyStatus}</span>
                  </span>
                  <span className="text-sm font-black">
                    {displayProgress}%
                  </span>
                </div>

                <div className="w-full h-3 bg-stone-200 dark:bg-black border border-black overflow-hidden">
                  <div
                    className="h-full bg-[#bef264] transition-all duration-150 relative overflow-hidden"
                    style={{
                      width: `${displayProgress}%`,
                      backgroundImage: `
                        repeating-linear-gradient(
                          -45deg,
                          rgba(0, 0, 0, 0.15),
                          rgba(0, 0, 0, 0.15) 6px,
                          transparent 6px,
                          transparent 12px
                        )
                      `
                    }}
                  />
                </div>

                <div className="text-[10px] sm:text-[11px] font-mono-tech text-stone-500 dark:text-stone-400 pt-0.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-[#16a34a]' : 'bg-[#bef264] animate-pulse'}`} />
                    <span>
                      {loadedBytes > 0
                        ? `${(loadedBytes / (1024 * 1024)).toFixed(1)} MB / ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
                        : 'BUFFERING HERO VIDEO'}
                    </span>
                    {speed && speed !== '0.0 MB/s' && (
                      <span className="text-stone-400 hidden sm:inline">({speed})</span>
                    )}
                  </span>
                  <span>
                    {isReady ? 'Ready! Entering automatically...' : 'Buffering hero video...'}
                  </span>
                </div>

                <button onClick={triggerEnterSite}
                    className="w-full mt-2 bg-[#bef264] hover:bg-[#a3e635] text-black font-mono-tech font-extrabold text-xs py-2.5 px-4 border-2 border-black rounded shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                  >
                    <span>ENTER WEBSITE NOW &rarr;</span>
                  </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-stone-50 dark:bg-stone-800/50 border-2 border-black p-2.5 text-center">
                  <div className="font-mono-tech text-[10px] text-stone-500 uppercase">Score</div>
                  <div className="font-heading text-xl font-black text-black dark:text-white">{score}</div>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800/50 border-2 border-black p-2.5 text-center">
                  <div className="font-mono-tech text-[10px] text-stone-500 uppercase">Best Score</div>
                  <div className="font-heading text-xl font-black text-[#16a34a]">{bestScore}</div>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center">
            <div
              className="relative w-full max-w-[560px] aspect-[4/3] bg-black border-4 border-black manga-shadow-lg overflow-hidden cursor-pointer group"
              onClick={jump}
              onTouchStart={(e) => {
                e.preventDefault();
                jump();
              }}
            >
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block"
              />

              {gameStateStatus === 'READY' && (
                <div className="absolute top-4 left-0 right-0 text-center pointer-events-none z-20">
                  <span className="bg-black/90 text-[#bef264] border border-[#bef264] px-3.5 py-1 font-mono-tech text-xs font-bold tracking-wider shadow-md">
                    [ Tap, Click, or Spacebar to Play ]
                  </span>
                </div>
              )}

              {isReady && (
                <div className="absolute top-3 left-4 right-4 z-30 pointer-events-none flex justify-center">
                  <div className="bg-black/90 border border-[#bef264] px-4 py-1.5 font-mono-tech text-xs text-[#bef264] font-bold shadow-lg flex items-center gap-2 animate-bounce">
                    <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
                    <span>Loaded! Opening website now &rarr;</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full max-w-[560px] mt-2.5 flex items-center justify-between text-[11px] font-mono-tech text-stone-600 dark:text-stone-400 px-1">
              <span>🎮 Controls: Tap or Spacebar to fly</span>
              <span>⭐ Dodge barriers & collect stars</span>
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-3 sm:pb-4">
        <div className="bg-white dark:bg-stone-900 border-2 border-black px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono-tech text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-black dark:text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#bef264] rounded-full inline-block" />
              OG MEDIA STUDIO
            </span>
            <span>•</span>
            <span>SEOUL • TOKYO • NEW YORK • LONDON</span>
          </div>

          <div className="text-stone-500">
            {isReady ? 'Opening...' : isVideoLoaded ? 'Ready! Opening...' : 'Loading hero video...'}
          </div>
        </div>
      </footer>
    </div>
  );
}
