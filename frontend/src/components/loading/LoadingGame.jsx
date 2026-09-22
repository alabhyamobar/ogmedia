import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Web Audio Sound Effects Synthesizer (Zero external dependencies, instant low-latency)
 */
class SoundFx {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFlap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  playScore() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.23);
  }

  playMana() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.09);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.09 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.09);
      osc.stop(this.ctx.currentTime + i * 0.09 + 0.26);
    });
  }

  playCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }
}

const sfx = new SoundFx();

export default function LoadingGame({ onComplete }) {
  const canvasRef = useRef(null);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [gatesPassed, setGatesPassed] = useState(0);
  const [manaOrbs, setManaOrbs] = useState(0);
  const [syncProgress, setSyncProgress] = useState(15);
  const [velocityDisplay, setVelocityDisplay] = useState(-41);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('og_flappy_best') || '2', 10);
    } catch {
      return 2;
    }
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAwakeningModal, setShowAwakeningModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // References for game loop
  const gameStateRef = useRef({
    bird: {
      x: 70,
      y: 160,
      vy: 0,
      radius: 14,
      rotation: 0,
      wingState: 0
    },
    monoliths: [],
    orbs: [],
    particles: [],
    score: 0,
    orbsCollected: 0,
    isGameOver: false,
    frameCount: 0,
    lastSpawn: 0,
    lastOrbSpawn: 0,
    sync: 15
  });

  // Toggle SFX
  const toggleSfx = () => {
    sfx.muted = sfxEnabled;
    setSfxEnabled(!sfxEnabled);
  };

  // Skip / Auto-sync directly to 100%
  const handleAutoSync = useCallback(() => {
    setSyncProgress(100);
    setIsUnlocked(true);
    setShowAwakeningModal(true);
    sfx.playVictory();
  }, []);

  // Complete and enter webtoon
  const handleEnterWebtoon = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
  }, [onComplete]);

  // Jump / Flap Action
  const jump = useCallback(() => {
    const gs = gameStateRef.current;
    if (gs.isGameOver) {
      // Restart game
      gs.bird.y = 160;
      gs.bird.vy = -6.5;
      gs.monoliths = [];
      gs.orbs = [];
      gs.isGameOver = false;
      gs.score = 0;
      setGatesPassed(0);
    } else {
      gs.bird.vy = -6.2;
    }
    sfx.playFlap();
    // Add flap puff particles
    for (let i = 0; i < 4; i++) {
      gs.particles.push({
        x: gs.bird.x - 10,
        y: gs.bird.y + Math.random() * 8 - 4,
        vx: -Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        size: Math.random() * 4 + 2,
        life: 1,
        color: '#bef264'
      });
    }
  }, []);

  // Background auto-sync progress ticker (reaches 100% in ~4 seconds automatically)
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUnlocked(true);
          setShowAwakeningModal(true);
          return 100;
        }
        const next = Math.min(100, prev + 3);
        if (next >= 100) {
          setIsUnlocked(true);
          setShowAwakeningModal(true);
          sfx.playVictory();
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      } else if (e.code === 'Enter' && isUnlocked) {
        handleEnterWebtoon();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, isUnlocked, handleEnterWebtoon]);

  // Main Canvas 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gravity = 0.32;
    const speed = 2.2;
    const gap = 100;

    const render = () => {
      const gs = gameStateRef.current;
      gs.frameCount++;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear & Background Grid
      ctx.fillStyle = '#0f0f12';
      ctx.fillRect(0, 0, width, height);

      // Subtle drafting coordinates grid inside game
      ctx.strokeStyle = '#1e1e24';
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

      // 2. Spawn Ink Monoliths
      if (gs.frameCount - gs.lastSpawn > 115) {
        const topH = Math.floor(Math.random() * (height - gap - 70)) + 35;
        gs.monoliths.push({
          x: width,
          topH,
          bottomY: topH + gap,
          passed: false,
          coordText: `TR_${(Math.random() * 90).toFixed(2)}°`,
          regMark: `+${(Math.random() * 40).toFixed(3)}°`
        });
        gs.lastSpawn = gs.frameCount;

        // Spawn mana orb in the gap occasionally
        if (Math.random() > 0.4) {
          gs.orbs.push({
            x: width + 25,
            y: topH + gap / 2 + (Math.random() * 30 - 15),
            collected: false,
            pulse: 0
          });
        }
      }

      // 3. Update & Draw Monoliths
      for (let i = gs.monoliths.length - 1; i >= 0; i--) {
        const m = gs.monoliths[i];
        m.x -= speed;

        // Draw Top Monolith (Pillar)
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(m.x, 0, 48, m.topH);
        ctx.strokeStyle = '#38383e';
        ctx.lineWidth = 2;
        ctx.strokeRect(m.x, 0, 48, m.topH);

        // Monolith hatched texture
        ctx.strokeStyle = 'rgba(190, 242, 100, 0.2)';
        ctx.lineWidth = 1;
        for (let hy = 10; hy < m.topH - 10; hy += 12) {
          ctx.beginPath();
          ctx.moveTo(m.x + 6, hy);
          ctx.lineTo(m.x + 42, hy + 6);
          ctx.stroke();
        }

        // Monolith coordinate badge
        ctx.fillStyle = '#bef264';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(m.coordText, m.x + 4, 18);

        // Draw Bottom Monolith
        const botH = height - m.bottomY;
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(m.x, m.bottomY, 48, botH);
        ctx.strokeStyle = '#38383e';
        ctx.lineWidth = 2;
        ctx.strokeRect(m.x, m.bottomY, 48, botH);

        // Bottom hatching
        for (let hy = m.bottomY + 12; hy < height - 10; hy += 12) {
          ctx.beginPath();
          ctx.moveTo(m.x + 6, hy);
          ctx.lineTo(m.x + 42, hy + 6);
          ctx.stroke();
        }

        // Bottom technical coordinate
        ctx.fillStyle = '#ef4444';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(m.regMark, m.x + 4, m.bottomY + 18);

        // Score check
        if (!m.passed && m.x + 48 < gs.bird.x) {
          m.passed = true;
          gs.score++;
          setGatesPassed(gs.score);
          sfx.playScore();

          // Accelerate sync
          setSyncProgress((p) => {
            const next = Math.min(100, p + 12);
            if (next >= 100) {
              setIsUnlocked(true);
              setShowAwakeningModal(true);
            }
            return next;
          });

          // Update best score
          if (gs.score > bestScore) {
            setBestScore(gs.score);
            try {
              localStorage.setItem('og_flappy_best', gs.score.toString());
            } catch {}
          }
        }

        // Collision Check
        if (
          gs.bird.x + gs.bird.radius > m.x &&
          gs.bird.x - gs.bird.radius < m.x + 48
        ) {
          if (
            gs.bird.y - gs.bird.radius < m.topH ||
            gs.bird.y + gs.bird.radius > m.bottomY
          ) {
            if (!gs.isGameOver) {
              gs.isGameOver = true;
              sfx.playCrash();
            }
          }
        }

        // Clean up offscreen
        if (m.x < -60) {
          gs.monoliths.splice(i, 1);
        }
      }

      // 4. Update & Draw Mana Orbs
      for (let i = gs.orbs.length - 1; i >= 0; i--) {
        const orb = gs.orbs[i];
        orb.x -= speed;
        orb.pulse += 0.08;

        if (!orb.collected) {
          const r = 7 + Math.sin(orb.pulse) * 2;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Mana orb glow
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, r * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.fill();

          // Collision with bird
          const dist = Math.hypot(gs.bird.x - orb.x, gs.bird.y - orb.y);
          if (dist < gs.bird.radius + r) {
            orb.collected = true;
            gs.orbsCollected++;
            setManaOrbs(gs.orbsCollected);
            sfx.playMana();

            // Mana burst particles
            for (let p = 0; p < 8; p++) {
              gs.particles.push({
                x: orb.x,
                y: orb.y,
                vx: Math.cos((p * Math.PI) / 4) * 3,
                vy: Math.sin((p * Math.PI) / 4) * 3,
                size: 3,
                life: 1,
                color: '#38bdf8'
              });
            }
          }
        }

        if (orb.x < -20 || orb.collected) {
          gs.orbs.splice(i, 1);
        }
      }

      // 5. Update Bird (Shadow Crow 까마귀)
      if (!gs.isGameOver) {
        gs.bird.vy += gravity;
        gs.bird.y += gs.bird.vy;

        // Rotation tilts based on velocity
        gs.bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, gs.bird.vy * 0.08));

        // Wing flap flutter
        gs.bird.wingState += 0.25;

        // Ground / Ceiling clamp
        if (gs.bird.y + gs.bird.radius > height) {
          gs.bird.y = height - gs.bird.radius;
          gs.isGameOver = true;
          sfx.playCrash();
        }
        if (gs.bird.y - gs.bird.radius < 0) {
          gs.bird.y = gs.bird.radius;
          gs.bird.vy = 0;
        }

        setVelocityDisplay(Math.round(gs.bird.vy * 10));
      } else {
        // Falling when game over
        gs.bird.vy += gravity * 1.2;
        gs.bird.y += gs.bird.vy;
        gs.bird.rotation = Math.min(Math.PI / 2, gs.bird.rotation + 0.1);
      }

      // 6. Draw Shadow Crow
      ctx.save();
      ctx.translate(gs.bird.x, gs.bird.y);
      ctx.rotate(gs.bird.rotation);

      // Crow Shadow Aura
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190, 242, 100, 0.2)';
      ctx.fill();

      // Crow Body (Sleek aerodynamic ink black)
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#09090b';
      ctx.fill();
      ctx.strokeStyle = '#bef264';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wing (Flapping)
      const wingY = Math.sin(gs.bird.wingState) * 6;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(2, wingY - 8);
      ctx.lineTo(8, 0);
      ctx.fillStyle = '#27272a';
      ctx.fill();
      ctx.strokeStyle = '#bef264';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Beak (Sharp hunter beak)
      ctx.beginPath();
      ctx.moveTo(11, -2);
      ctx.lineTo(19, 1);
      ctx.lineTo(11, 4);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Glowing Eye (Hunter Mana Red / Lime)
      ctx.beginPath();
      ctx.arc(7, -3, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#bef264';
      ctx.fill();

      ctx.restore();

      // 7. Update & Draw Particles
      for (let i = gs.particles.length - 1; i >= 0; i--) {
        const p = gs.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) {
          gs.particles.splice(i, 1);
        }
      }

      // 8. Game Over Overlay inside canvas
      if (gs.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px "Bebas Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('INWARD CRASH // BARRIER ENGAGED', width / 2, height / 2 - 14);

        ctx.fillStyle = '#bef264';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('[ CLICK OR PRESS SPACE TO RE-ENGAGE ]', width / 2, height / 2 + 16);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bestScore]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-[#ebebe5] text-stone-900 overflow-y-auto select-none transition-opacity duration-500 ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 75% 50%, rgba(190, 242, 100, 0.12) 0%, transparent 60%),
          linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 24px 24px, 24px 24px'
      }}
    >
      {/* Manga Speedlines overlay radiating from center */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 100%)',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* ========================================================================= */}
      {/* TOP TECHNICAL PROTOCOL BAR                                                */}
      {/* ========================================================================= */}
      <header className="relative z-10 w-full max-w-[1300px] mx-auto px-3 sm:px-6 pt-3 sm:pt-4">
        <div className="bg-white border-2 border-black p-2 sm:p-2.5 manga-shadow-sm flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Title & Game Mode */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-black text-[#bef264] font-mono-tech font-bold text-xs sm:text-sm px-2.5 py-1 tracking-wider border border-black">
              FLAPPY PROTOCOL // SHADOW GLIDE
            </div>
            <span className="font-mono-tech text-[10px] sm:text-xs text-stone-600 font-semibold hidden md:inline">
              REG.MARK: +35.289° // GAME MODE: FLAPPY INK BIRD
            </span>
          </div>

          {/* Right Controls: SFX, Skip, Avatar, Gates */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* SFX Toggle */}
            <button
              onClick={toggleSfx}
              className="bg-stone-100 hover:bg-stone-200 border border-black px-2.5 py-0.5 font-mono-tech text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{sfxEnabled ? '🔊' : '🔇'}</span>
              <span>SFX: {sfxEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Auto-Sync / Skip Button */}
            <button
              onClick={handleAutoSync}
              className="bg-white hover:bg-[#bef264] text-black border border-black px-2.5 py-0.5 font-mono-tech text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>⚡</span>
              <span>AUTO-SYNC // SKIP</span>
            </button>

            {/* Avatar Badge */}
            <div className="bg-[#bef264] text-black font-mono-tech font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 border border-black">
              AVATAR: SHADOW CROW // 까마귀
            </div>

            {/* Gates Cleared Status Badge */}
            <div className="bg-stone-900 text-white font-mono-tech font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 border border-black flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#ef4444] rounded-full animate-ping" />
              <span>• GATES: [{String(gatesPassed).padStart(2, '0')}/08]</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN CONTAINER: STATS / DIALOGUE + FLAPPY GAME AREA            */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-[1300px] mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: CHIBI HUNTER CARD & DUAL METRICS                         */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Primary Dialogue Box */}
            <div className="relative bg-white border-3 border-black p-5 sm:p-6 manga-shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-black font-mono-tech text-xs">
                <span className="text-[#ef4444] font-bold flex items-center gap-1">
                  <span>■</span> CHIBI HUNTER // FLIGHT FLAP
                </span>
                <span className="bg-black text-white px-2 py-0.5 font-bold text-[10px]">
                  BEST: {String(bestScore).padStart(2, '0')}
                </span>
              </div>

              {/* Bold Comic Quotes */}
              <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-black leading-tight mb-2">
                "DODGE INK MONOLITHS.
              </h2>
              <div className="inline-block bg-[#bef264] border-2 border-black px-2.5 py-1 mb-4 transform -rotate-1 shadow-sm">
                <span className="font-heading text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  SHADOW CROW UNSEALED!
                </span>
              </div>

              <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isUnlocked
                  ? 'The gate has fully unlocked. The comic canvas is primed and ready to read.'
                  : 'Navigate through the architectural ink pillars or flap to harvest mana charge.'}
              </p>
            </div>

            {/* Dual Stats Display */}
            <div className="grid grid-cols-2 gap-3">
              {/* Stat 1: Gates Navigated */}
              <div className="bg-white border-2 border-black p-3 manga-shadow-sm">
                <div className="font-mono-tech text-[9px] text-stone-500 uppercase tracking-wider mb-1">
                  01 // GATES_NAVIGATED
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-xl sm:text-2xl font-black text-black">
                    {gatesPassed} GATES
                  </span>
                  <span className="font-mono-tech text-[10px] font-bold text-[#16a34a]">
                    RANK B // GLIDER
                  </span>
                </div>
                {/* Mini Progress Bar */}
                <div className="w-full h-1.5 bg-stone-200 border border-black mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#bef264] transition-all duration-300"
                    style={{ width: `${Math.min(100, (gatesPassed / 8) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Stat 2: Mana Orbs Eaten */}
              <div className="bg-white border-2 border-black p-3 manga-shadow-sm">
                <div className="font-mono-tech text-[9px] text-stone-500 uppercase tracking-wider mb-1">
                  02 // MANA_ORBS_EATEN
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-xl sm:text-2xl font-black text-black">
                    {manaOrbs} ORBS
                  </span>
                  <span className="font-mono-tech text-[10px] font-bold text-[#ea580c]">
                    VEL: {velocityDisplay}
                  </span>
                </div>
                {/* Mini Progress Bar */}
                <div className="w-full h-1.5 bg-stone-200 border border-black mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#f97316] transition-all duration-300"
                    style={{ width: `${Math.min(100, (manaOrbs / 5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Korean Status Ribbon */}
            <div
              onClick={isUnlocked ? handleEnterWebtoon : undefined}
              className={`p-3 border-2 border-black font-mono-tech text-xs font-bold tracking-wider flex items-center justify-between transition-all ${
                isUnlocked
                  ? 'bg-black text-[#bef264] cursor-pointer hover:bg-stone-900 manga-shadow-sm'
                  : 'bg-stone-900 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-kr font-black text-sm text-[#bef264]">
                  {isUnlocked ? '통과—!' : '동기화중—'}
                </span>
                <span>
                  {isUnlocked
                    ? 'WEBTOON GATE UNSEALED // ENTER NOW'
                    : 'AWAITING FULL AWAKENING'}
                </span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 border ${
                  isUnlocked
                    ? 'bg-[#bef264] text-black border-black animate-pulse'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                {isUnlocked ? '• UNLOCKED' : 'LOCKED'}
              </span>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: INTERACTIVE CANVAS MINI-GAME + AWAKENING MODAL         */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Game Screen Outer Frame */}
            <div
              className="relative w-full max-w-[560px] aspect-[4/3] bg-black border-4 border-black manga-shadow-lg overflow-hidden cursor-pointer group"
              onClick={jump}
            >
              {/* Canvas 60fps Game */}
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block"
              />

              {/* Click / Tap Prompt Hint (fades out once playing) */}
              {gatesPassed === 0 && (
                <div className="absolute top-4 left-0 right-0 text-center pointer-events-none z-20">
                  <span className="bg-black/90 text-[#bef264] border border-[#bef264] px-3 py-1 font-mono-tech text-xs font-bold tracking-widest shadow-md">
                    [ CLICK / TAP / SPACE TO FLAP ]
                  </span>
                </div>
              )}

              {/* AWAKENING MODAL OVERLAY (When 100% or 8 gates reached) */}
              {showAwakeningModal && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-40 animate-fade-in">
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white border-3 border-black p-6 max-w-sm w-full text-center manga-shadow-lg transform transition-transform animate-scale-up"
                  >
                    {/* Korean Heading */}
                    <h3 className="font-kr font-black text-3xl sm:text-4xl text-black tracking-tight mb-2">
                      각성 완료—!
                    </h3>

                    {/* Badge */}
                    <div className="inline-block bg-[#bef264] border border-black text-black font-mono-tech font-bold text-xs px-2.5 py-0.5 mb-3">
                      MANA SYNCHRONIZED: 100%
                    </div>

                    {/* Subtitle */}
                    <h4 className="font-heading text-lg font-black uppercase text-black mb-1">
                      THE ARCHIVE IS UNSEALED
                    </h4>
                    <p className="font-sans text-xs text-stone-600 mb-5 leading-normal">
                      Hunter Crow passed through the ink barrier. Proceed to reading!
                    </p>

                    {/* Big Call To Action Button */}
                    <button
                      onClick={handleEnterWebtoon}
                      className="w-full bg-black hover:bg-[#bef264] text-white hover:text-black border-2 border-black py-3 font-mono-tech font-black text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 manga-shadow-sm hover:translate-x-0.5 hover:-translate-y-0.5"
                    >
                      <span>ENTER WEBTOON NOW</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar & Sync Charge below game */}
            <div className="w-full max-w-[560px] mt-4 space-y-1.5">
              <div className="flex items-center justify-between font-mono-tech text-xs font-bold text-stone-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#ef4444]">▶</span>
                  <span>SYNC CHARGE // AWAKENING:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#ef4444] text-white text-[10px] font-bold px-1.5 py-0.2">
                    {syncProgress >= 100
                      ? 'AWAKENING COMPLETE // 입장 준비 완료'
                      : 'HARVESTING INK MANA'}
                  </span>
                  <span className="text-sm font-black">{syncProgress}%</span>
                </div>
              </div>

              {/* Glowing Striped Progress Bar */}
              <div className="w-full h-4 bg-black border-2 border-black p-0.5 overflow-hidden">
                <div
                  className="h-full bg-[#bef264] transition-all duration-300 relative overflow-hidden"
                  style={{
                    width: `${syncProgress}%`,
                    backgroundImage: `
                      repeating-linear-gradient(
                        -45deg,
                        rgba(0, 0, 0, 0.18),
                        rgba(0, 0, 0, 0.18) 6px,
                        transparent 6px,
                        transparent 12px
                      )
                    `
                  }}
                />
              </div>

              {/* Sub-strip telemetry */}
              <div className="flex items-center justify-between font-mono-tech text-[9px] text-stone-500 pt-0.5">
                <span>[SYSTEM READY: ALL BARRIERS BREACHED]</span>
                <span className="text-[#ef4444] font-bold">CHAPTER 00 // FLIGHT STAGE</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* BOTTOM TECHNICAL BAR                                                      */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full max-w-[1300px] mx-auto px-3 sm:px-6 pb-3 sm:pb-4">
        <div className="bg-white border-2 border-black px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono-tech">
          {/* Tech Specs */}
          <div className="text-stone-700 flex items-center gap-2 flex-wrap">
            <span className="font-bold text-black">COLOR: K100 INK</span>
            <span>//</span>
            <span>TRIM_BLEED: +3.0mm</span>
            <span>//</span>
            <span>300 DPI EMULATION</span>
            <span>//</span>
            <span className="font-bold text-black">SEOUL • TOKYO • NEW YORK</span>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            <span className="text-stone-500 hidden sm:inline">
              [CLEAR 8 GATES OR FLAP TO SYNC 100%]
            </span>
            <button
              onClick={handleEnterWebtoon}
              className="bg-[#bef264] hover:bg-lime-400 text-black border-2 border-black px-4 py-1.5 font-bold font-mono-tech text-xs tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-sm hover:translate-x-0.5 hover:-translate-y-0.5"
            >
              <span>ENTER WEBTOON</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
