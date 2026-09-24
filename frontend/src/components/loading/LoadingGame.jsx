import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useVideoPreload } from '../../context/VideoPreloadContext';
import OgLogo from '../ui/OgLogo';

/**
 * Web Audio Sound Effects Synthesizer
 * Zero external audio dependencies, low-latency procedural agency sound design
 */
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
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
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
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(783.99, now + 0.07); // G5
    osc.frequency.setValueAtTime(1046.5, now + 0.14); // C6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playMana(combo = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 720 + Math.min(500, combo * 70);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.13);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playShieldPickup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.2);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  playShieldBreak() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playNearMiss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(1320, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.08 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.08);
      osc.stop(this.ctx.currentTime + i * 0.08 + 0.24);
    });
  }
}

const sfx = new SoundFx();

export default function LoadingGame({ onComplete }) {
  const canvasRef = useRef(null);
  const { progress: videoProgress, isLoaded: isVideoLoaded, loadedBytes, totalBytes, speed } = useVideoPreload();

  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [gatesPassed, setGatesPassed] = useState(0);
  const [manaOrbs, setManaOrbs] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [gameStateStatus, setGameStateStatus] = useState('READY'); // 'READY' | 'PLAYING' | 'GAMEOVER'
  const [velocityDisplay, setVelocityDisplay] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('og_campaign_best') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAwakeningModal, setShowAwakeningModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // References for 60fps game loop
  const gameStateRef = useRef({
    status: 'READY',
    bird: {
      x: 85,
      y: 190,
      vy: 0,
      radius: 11, // Fair hitbox
      rotation: 0,
      wingState: 0,
      trail: [],
      hasShield: false,
      shieldTime: 0
    },
    monoliths: [],
    orbs: [],
    particles: [],
    popups: [],
    score: 0,
    orbsCollected: 0,
    combo: 0,
    shake: 0,
    frameCount: 0,
    lastSpawn: 0,
    hoverPhase: 0,
    bgOffset: 0
  });

  // Calculate Digital Marketing Agency Rank / Title
  const getRankFromScore = (s) => {
    if (s >= 20) return 'CHIEF MARKETING OFFICER // S-TIER';
    if (s >= 12) return 'CREATIVE DIRECTOR // A-TIER';
    if (s >= 6) return 'VIRAL STRATEGIST // B-TIER';
    if (s >= 3) return 'GROWTH SPECIALIST // C-TIER';
    return 'MEDIA JUNIOR // D-TIER';
  };

  // Sync unlock condition with real video preloader
  useEffect(() => {
    if (isVideoLoaded && !isUnlocked) {
      setIsUnlocked(true);
      sfx.playVictory();
    }
  }, [isVideoLoaded, isUnlocked]);

  // Toggle SFX
  const toggleSfx = () => {
    sfx.markUserInteraction();
    sfx.muted = sfxEnabled;
    setSfxEnabled(!sfxEnabled);
  };

  // Auto-sync / Skip
  const handleAutoSync = useCallback(() => {
    sfx.markUserInteraction();
    setIsUnlocked(true);
    setShowAwakeningModal(true);
    sfx.playVictory();
  }, []);

  // Enter webtoon
  const handleEnterWebtoon = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
  }, [onComplete]);

  // Jump / Flap Action
  const jump = useCallback(() => {
    sfx.markUserInteraction();
    const gs = gameStateRef.current;

    if (gs.status === 'READY') {
      gs.status = 'PLAYING';
      setGameStateStatus('PLAYING');
      gs.bird.vy = -5.8;
      gs.bird.rotation = -0.45;
      sfx.playFlap();
      return;
    }

    if (gs.status === 'GAMEOVER') {
      // Re-launch campaign
      gs.status = 'PLAYING';
      setGameStateStatus('PLAYING');
      gs.bird.y = 190;
      gs.bird.vy = -5.8;
      gs.bird.rotation = -0.45;
      gs.bird.trail = [];
      gs.bird.hasShield = false;
      setHasShield(false);
      gs.monoliths = [];
      gs.orbs = [];
      gs.particles = [];
      gs.popups = [];
      gs.score = 0;
      gs.combo = 0;
      gs.lastSpawn = gs.frameCount;
      setGatesPassed(0);
      setCombo(0);
      sfx.playFlap();
      return;
    }

    // Active flight flap
    gs.bird.vy = -5.8;
    gs.bird.rotation = -0.42;
    sfx.playFlap();

    // Spawn aerodynamic lime brand particles
    for (let i = 0; i < 5; i++) {
      gs.particles.push({
        x: gs.bird.x - 14,
        y: gs.bird.y + (Math.random() * 10 - 5),
        vx: -Math.random() * 3 - 1.5,
        vy: (Math.random() - 0.5) * 2.5,
        size: Math.random() * 4 + 2,
        life: 1,
        color: Math.random() > 0.4 ? '#bef264' : '#38bdf8'
      });
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
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

    const gravity = 0.28;
    const speed = 2.4;
    const gap = 114;

    const bottleneckLabels = [
      'ALGORITHM BOTTLENECK',
      'AD FATIGUE // CPI SPIKE',
      'CREATIVE BLOCK',
      'CONVERSION DROP',
      'AUDIENCE CHURN',
      'PLATFORM BANNER FATIGUE'
    ];

    const render = () => {
      const gs = gameStateRef.current;
      gs.frameCount++;
      const width = canvas.width;
      const height = canvas.height;

      // Camera Shake
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

      // 1. Digital Creative Grid Background
      ctx.fillStyle = '#08080b';
      ctx.fillRect(0, 0, width, height);

      // Parallax City & Media Towers
      gs.bgOffset = (gs.bgOffset + (gs.status === 'PLAYING' ? 0.6 : 0.2)) % 320;
      ctx.fillStyle = '#111116';
      const skylineX = -gs.bgOffset;
      for (let sx = skylineX; sx < width + 100; sx += 80) {
        ctx.fillRect(sx, height - 90, 50, 90);
        ctx.fillRect(sx + 30, height - 130, 35, 130);
        ctx.fillRect(sx + 15, height - 160, 15, 160);
      }

      // Drafting Coordinates Grid
      ctx.strokeStyle = '#181820';
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

      // 2. Spawn Algorithm Bottlenecks & Viral Tokens
      if (gs.status === 'PLAYING') {
        if (gs.frameCount - gs.lastSpawn > 115) {
          const topH = Math.floor(Math.random() * (height - gap - 80)) + 40;
          const touchpointIndex = gs.score + gs.monoliths.length + 1;
          const labelIndex = (touchpointIndex - 1) % bottleneckLabels.length;

          gs.monoliths.push({
            x: width,
            topH,
            bottomY: topH + gap,
            passed: false,
            gateText: `TOUCHPOINT // ${String(touchpointIndex).padStart(2, '0')}`,
            subLabel: bottleneckLabels[labelIndex],
            nearMissChecked: false
          });
          gs.lastSpawn = gs.frameCount;

          // Spawn collectible in the gate
          const rand = Math.random();
          if (rand > 0.35) {
            // Engagement Token (Cyan)
            gs.orbs.push({
              x: width + 28,
              y: topH + gap / 2 + (Math.random() * 30 - 15),
              type: 'engagement',
              pulse: 0,
              collected: false
            });
          } else if (rand > 0.18) {
            // Viral Asset (Lime Core)
            gs.orbs.push({
              x: width + 28,
              y: topH + gap / 2 + (Math.random() * 20 - 10),
              type: 'viral',
              pulse: 0,
              collected: false
            });
          } else if (!gs.bird.hasShield && rand < 0.1) {
            // Brand Safety Shield (Purple)
            gs.orbs.push({
              x: width + 28,
              y: topH + gap / 2,
              type: 'shield',
              pulse: 0,
              collected: false
            });
          }
        }
      }

      // 3. Update & Draw Bottlenecks (Pillars)
      for (let i = gs.monoliths.length - 1; i >= 0; i--) {
        const m = gs.monoliths[i];
        if (gs.status === 'PLAYING') {
          m.x -= speed;
        }

        const pillarWidth = 52;

        // TOP PILLAR (Algorithm Barrier)
        ctx.fillStyle = '#0e0e13';
        ctx.fillRect(m.x, 0, pillarWidth, m.topH);
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.strokeRect(m.x, 0, pillarWidth, m.topH);

        // Neon Conduit Accent
        ctx.strokeStyle = '#bef264';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x + 8, 0);
        ctx.lineTo(m.x + 8, m.topH - 8);
        ctx.stroke();

        // Lip Barrier Cap
        ctx.fillStyle = '#18181b';
        ctx.fillRect(m.x - 2, m.topH - 12, pillarWidth + 4, 12);
        ctx.strokeStyle = '#bef264';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(m.x - 2, m.topH - 12, pillarWidth + 4, 12);

        // Technical Marketing Label
        ctx.fillStyle = '#bef264';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillText(m.gateText, m.x + 4, 16);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(m.subLabel.substring(0, 10), m.x + 4, 28);

        // BOTTOM PILLAR
        const botH = height - m.bottomY;
        ctx.fillStyle = '#0e0e13';
        ctx.fillRect(m.x, m.bottomY, pillarWidth, botH);
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.strokeRect(m.x, m.bottomY, pillarWidth, botH);

        // Bottom Conduit Accent
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x + pillarWidth - 8, m.bottomY + 8);
        ctx.lineTo(m.x + pillarWidth - 8, height);
        ctx.stroke();

        // Bottom Cap
        ctx.fillStyle = '#18181b';
        ctx.fillRect(m.x - 2, m.bottomY, pillarWidth + 4, 12);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(m.x - 2, m.bottomY, pillarWidth + 4, 12);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillText('CPM CLAMP', m.x + 4, m.bottomY + 24);

        // Shimmering Media Conduit
        ctx.strokeStyle = 'rgba(190, 242, 100, 0.16)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(m.x + pillarWidth / 2, m.topH);
        ctx.lineTo(m.x + pillarWidth / 2, m.bottomY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Score Check & Gate Passage
        if (!m.passed && m.x + pillarWidth < gs.bird.x) {
          m.passed = true;
          gs.score++;
          gs.combo++;
          setGatesPassed(gs.score);
          setCombo(gs.combo);
          sfx.playScore();

          // Campaign clear popup
          gs.popups.push({
            x: gs.bird.x + 20,
            y: gs.bird.y - 15,
            text: gs.combo > 1 ? `CAMPAIGN +1 (x${gs.combo})` : '+1 CAMPAIGN',
            color: '#bef264',
            life: 1
          });

          // High Score
          if (gs.score > bestScore) {
            setBestScore(gs.score);
            try {
              localStorage.setItem('og_campaign_best', gs.score.toString());
            } catch {}
          }

          // Shimmer burst
          for (let p = 0; p < 8; p++) {
            gs.particles.push({
              x: m.x + pillarWidth / 2,
              y: m.topH + (p * gap) / 8,
              vx: Math.random() * 2 + 1,
              vy: (Math.random() - 0.5) * 2,
              size: 2.5,
              life: 1,
              color: '#bef264'
            });
          }
        }

        // Near-Miss Bonus (High CTR reaction)
        if (!m.nearMissChecked && gs.status === 'PLAYING') {
          if (gs.bird.x > m.x && gs.bird.x < m.x + pillarWidth) {
            const distTop = gs.bird.y - m.topH;
            const distBottom = m.bottomY - gs.bird.y;
            if ((distTop > 0 && distTop < 18) || (distBottom > 0 && distBottom < 18)) {
              m.nearMissChecked = true;
              sfx.playNearMiss();
              gs.popups.push({
                x: gs.bird.x,
                y: gs.bird.y - 28,
                text: 'HIGH CTR! +50',
                color: '#38bdf8',
                life: 1
              });
            }
          }
        }

        // Collision Check (Fair Inner Hitbox)
        if (
          gs.bird.x + gs.bird.radius > m.x &&
          gs.bird.x - gs.bird.radius < m.x + pillarWidth
        ) {
          if (
            gs.bird.y - gs.bird.radius < m.topH ||
            gs.bird.y + gs.bird.radius > m.bottomY
          ) {
            if (gs.bird.hasShield) {
              gs.bird.hasShield = false;
              setHasShield(false);
              gs.shake = 14;
              sfx.playShieldBreak();
              gs.popups.push({
                x: gs.bird.x,
                y: gs.bird.y,
                text: 'BRAND SAFETY SHIELD SHATTERED!',
                color: '#c084fc',
                life: 1.2
              });
              gs.bird.y = m.topH + gap / 2;
              gs.bird.vy = 0;
            } else if (gs.status === 'PLAYING') {
              gs.status = 'GAMEOVER';
              setGameStateStatus('GAMEOVER');
              gs.shake = 18;
              sfx.playCrash();
            }
          }
        }

        if (m.x < -60) {
          gs.monoliths.splice(i, 1);
        }
      }

      // 4. Update & Draw Collectibles
      for (let i = gs.orbs.length - 1; i >= 0; i--) {
        const orb = gs.orbs[i];
        if (gs.status === 'PLAYING') {
          orb.x -= speed;
        }
        orb.pulse += 0.08;

        if (!orb.collected) {
          const r = 8 + Math.sin(orb.pulse) * 1.5;

          if (orb.type === 'engagement') {
            // Cyan Engagement Token
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Glow
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, r * 1.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.fill();
          } else if (orb.type === 'viral') {
            // Lime Viral Asset
            ctx.save();
            ctx.translate(orb.x, orb.y);
            ctx.rotate(orb.pulse);
            ctx.fillStyle = '#bef264';
            ctx.fillRect(-r, -r, r * 2, r * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-r, -r, r * 2, r * 2);
            ctx.restore();
          } else if (orb.type === 'shield') {
            // Brand Safety Shield
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, r + 2, 0, Math.PI * 2);
            ctx.fillStyle = '#c084fc';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('🛡', orb.x, orb.y + 3);
          }

          // Collision with Glider
          const dist = Math.hypot(gs.bird.x - orb.x, gs.bird.y - orb.y);
          if (dist < gs.bird.radius + r + 4) {
            orb.collected = true;

            if (orb.type === 'shield') {
              gs.bird.hasShield = true;
              setHasShield(true);
              sfx.playShieldPickup();
              gs.popups.push({
                x: orb.x,
                y: orb.y - 15,
                text: 'BRAND SAFETY SHIELD!',
                color: '#c084fc',
                life: 1
              });
            } else {
              gs.orbsCollected += orb.type === 'viral' ? 3 : 1;
              setManaOrbs(gs.orbsCollected);
              sfx.playMana(gs.combo);
              gs.popups.push({
                x: orb.x,
                y: orb.y - 15,
                text: orb.type === 'viral' ? '+300 VIRAL SURGE' : '+100 REACH',
                color: orb.type === 'viral' ? '#bef264' : '#38bdf8',
                life: 1
              });
            }

            for (let p = 0; p < 8; p++) {
              gs.particles.push({
                x: orb.x,
                y: orb.y,
                vx: Math.cos((p * Math.PI) / 4) * 3,
                vy: Math.sin((p * Math.PI) / 4) * 3,
                size: 3,
                life: 1,
                color: orb.type === 'shield' ? '#c084fc' : orb.type === 'viral' ? '#bef264' : '#38bdf8'
              });
            }
          }
        }

        if (orb.x < -30 || orb.collected) {
          gs.orbs.splice(i, 1);
        }
      }

      // 5. Update OG Creative Glider Drone
      if (gs.status === 'READY') {
        gs.hoverPhase += 0.06;
        gs.bird.y = 190 + Math.sin(gs.hoverPhase) * 6;
        gs.bird.rotation = Math.sin(gs.hoverPhase) * 0.08;
        gs.bird.wingState += 0.15;
      } else if (gs.status === 'PLAYING') {
        gs.bird.vy += gravity;
        gs.bird.y += gs.bird.vy;

        if (gs.bird.vy < 0) {
          gs.bird.rotation = Math.max(-0.45, gs.bird.rotation - 0.04);
        } else {
          gs.bird.rotation = Math.min(1.1, gs.bird.rotation + 0.04);
        }

        gs.bird.wingState += 0.28;

        // Trail positions
        if (gs.frameCount % 2 === 0) {
          gs.bird.trail.unshift({ x: gs.bird.x, y: gs.bird.y, rot: gs.bird.rotation, alpha: 0.45 });
          if (gs.bird.trail.length > 6) gs.bird.trail.pop();
        }

        // Boundaries
        if (gs.bird.y - gs.bird.radius < 0) {
          gs.bird.y = gs.bird.radius;
          gs.bird.vy = 0;
        }
        if (gs.bird.y + gs.bird.radius > height) {
          gs.bird.y = height - gs.bird.radius;
          gs.status = 'GAMEOVER';
          setGameStateStatus('GAMEOVER');
          gs.shake = 16;
          sfx.playCrash();
        }

        setVelocityDisplay(Math.round(gs.bird.vy * 10));
      } else if (gs.status === 'GAMEOVER') {
        if (gs.bird.y + gs.bird.radius < height) {
          gs.bird.vy += gravity * 1.5;
          gs.bird.y += gs.bird.vy;
          gs.bird.rotation = Math.min(Math.PI / 2, gs.bird.rotation + 0.15);
        }
      }

      // 6. Draw OG Drone Ghost Trail
      for (let t = 0; t < gs.bird.trail.length; t++) {
        const tr = gs.bird.trail[t];
        tr.alpha *= 0.85;
        tr.x -= speed * 0.5;
        ctx.save();
        ctx.translate(tr.x, tr.y);
        ctx.rotate(tr.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 242, 100, ${tr.alpha * 0.3})`;
        ctx.fill();
        ctx.restore();
      }

      // 7. Draw OG Creative Drone Glider
      ctx.save();
      ctx.translate(gs.bird.x, gs.bird.y);
      ctx.rotate(gs.bird.rotation);

      // Glider Plasma Aura
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190, 242, 100, 0.2)';
      ctx.fill();

      // Brand Safety Shield Hexagon
      if (gs.bird.hasShield) {
        gs.bird.shieldTime += 0.08;
        ctx.save();
        ctx.rotate(gs.bird.shieldTime);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const sx = Math.cos(angle) * 22;
          const sy = Math.sin(angle) * 22;
          if (a === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(192, 132, 252, 0.15)';
        ctx.fill();
        ctx.restore();
      }

      // Glider Main Fuselage (High-Tech Jet/Drone)
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-6, -9);
      ctx.lineTo(-14, -6);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-14, 6);
      ctx.lineTo(-6, 9);
      ctx.closePath();
      ctx.fillStyle = '#09090b';
      ctx.fill();
      ctx.strokeStyle = '#bef264';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Swept Aerodynamic Wings
      const wingY = Math.sin(gs.bird.wingState) * 6;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(2, wingY - 11);
      ctx.lineTo(8, 0);
      ctx.fillStyle = '#27272a';
      ctx.fill();
      ctx.strokeStyle = '#bef264';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // "OG" Monogram on Fuselage
      ctx.fillStyle = '#bef264';
      ctx.font = 'bold 7px "JetBrains Mono", monospace';
      ctx.fillText('OG', -5, 2.5);

      // Media Forward Sensor / Laser Beak
      ctx.beginPath();
      ctx.arc(12, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      ctx.restore();

      // 8. Particles
      for (let i = gs.particles.length - 1; i >= 0; i--) {
        const p = gs.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;

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

      // 9. Floating Combat Popups
      for (let i = gs.popups.length - 1; i >= 0; i--) {
        const pop = gs.popups[i];
        pop.y -= 0.8;
        pop.life -= 0.025;

        ctx.font = 'bold 11px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = pop.color;
        ctx.globalAlpha = Math.max(0, pop.life);
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.globalAlpha = 1.0;

        if (pop.life <= 0) {
          gs.popups.splice(i, 1);
        }
      }

      // 10. Start Screen Prompt
      if (gs.status === 'READY') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Bebas Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OG MEDIA // CAMPAIGN RUNNER', width / 2, height / 2 - 20);

        ctx.fillStyle = '#bef264';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillText('[ CLICK OR PRESS SPACE TO LAUNCH FLIGHT ]', width / 2, height / 2 + 15);
      }

      // 11. Game Over Overlay
      if (gs.status === 'GAMEOVER') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 24px "Bebas Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CAMPAIGN BOTTLENECK // ALGORITHM CLAMP', width / 2, height / 2 - 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Space Grotesk", sans-serif';
        ctx.fillText(`CAMPAIGNS: ${gs.score} TOUCHPOINTS  |  BEST: ${bestScore}`, width / 2, height / 2 - 12);

        ctx.fillStyle = '#bef264';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(`AGENCY EVALUATION: [ ${getRankFromScore(gs.score)} ]`, width / 2, height / 2 + 12);

        if (isUnlocked) {
          ctx.fillStyle = '#bef264';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText('[ SPACE: RE-LAUNCH  |  ENTER: VIEW AGENCY SHOWCASE ]', width / 2, height / 2 + 40);
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillText('[ PRESS SPACE OR CLICK TO RE-LAUNCH CAMPAIGN ]', width / 2, height / 2 + 40);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bestScore, isUnlocked]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col justify-between bg-[#ebebe5] text-stone-900 overflow-y-auto select-none transition-opacity duration-500 ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 75% 50%, rgba(190, 242, 100, 0.14) 0%, transparent 60%),
          linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 24px 24px, 24px 24px'
      }}
    >
      {/* Manga Speedlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.35) 100%)',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* ========================================================================= */}
      {/* TOP TECHNICAL PROTOCOL BAR                                                */}
      {/* ========================================================================= */}
      <header className="relative z-10 w-full max-w-[1300px] mx-auto px-3 sm:px-6 pt-3 sm:pt-4">
        <div className="bg-white border-2 border-black p-2 sm:p-2.5 manga-shadow-sm flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Title with Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <OgLogo size="sm" withText={true} subtitle="DIGITAL MEDIA & PERFORMANCE LAB" />
            <span className="hidden md:inline font-mono-tech text-[10px] text-stone-500 font-bold border-l-2 border-black pl-3">
              4K SHOWREEL PRELOAD ENGINE // HIGH-CONVERTING ASSETS
            </span>
          </div>

          {/* Right Controls: SFX, Skip, Shield, Gates */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* SFX Toggle */}
            <button
              onClick={toggleSfx}
              className="bg-stone-100 hover:bg-stone-200 border border-black px-2.5 py-0.5 font-mono-tech text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{sfxEnabled ? '🔊' : '🔇'}</span>
              <span>SFX: {sfxEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Brand Safety Shield Indicator */}
            {hasShield && (
              <div className="bg-[#c084fc] text-black font-mono-tech font-bold text-[10px] sm:text-[11px] px-2 py-0.5 border border-black animate-pulse flex items-center gap-1">
                <span>🛡</span>
                <span>BRAND SAFETY ACTIVE</span>
              </div>
            )}

            {/* Skip / Auto-Sync */}
            <button
              onClick={handleAutoSync}
              className="bg-white hover:bg-[#bef264] text-black border border-black px-2.5 py-0.5 font-mono-tech text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>⚡</span>
              <span>{isUnlocked ? 'READY // ENTER' : 'AUTO-SYNC // SKIP'}</span>
            </button>

            {/* Campaigns Completed Badge */}
            <div className="bg-stone-900 text-white font-mono-tech font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 border border-black flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#bef264] rounded-full animate-ping" />
              <span>CAMPAIGNS: [{String(gatesPassed).padStart(2, '0')}]</span>
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
          {/* LEFT COLUMN: HERO PRELOAD TELEMETRY & DIGITAL MARKETING BRAND CARD    */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Primary Dialogue Box */}
            <div className="relative bg-white border-3 border-black p-5 sm:p-6 manga-shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-black font-mono-tech text-xs">
                <span className="text-[#ef4444] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                  <span>OG MEDIA // DIGITAL CREATIVE LAB</span>
                </span>
                <span className="bg-black text-[#bef264] px-2 py-0.5 font-bold text-[10px]">
                  BEST: {String(bestScore).padStart(2, '0')} CAMPAIGNS
                </span>
              </div>

              {/* Bold Digital Marketing Headline */}
              <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-black leading-tight mb-2">
                "ENGINEERING HIGH-VELOCITY DIGITAL EXPERIENCES."
              </h2>
              <div className="inline-block bg-[#bef264] border-2 border-black px-2.5 py-1 mb-4 transform -rotate-1 shadow-sm">
                <span className="font-heading text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  {isUnlocked ? '4K SHOWREEL PRIMED IN RAM!' : 'PRELOADING 4K AGENCY SHOWCASE...'}
                </span>
              </div>

              <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                {isUnlocked
                  ? 'The 15.7MB 4K Agency Showreel is 100% pre-buffered in memory for zero-lag playback. Step inside to explore our viral campaigns, interactive platforms, and brand worldbuilding!'
                  : 'OG Media forges high-impact digital campaigns, viral media distribution, and brand intellectual properties. While our 4K showreel stream buffers, dodge algorithm bottlenecks to test your agency reflexes!'}
              </p>

              {/* Real-Time Video Download Telemetry Box */}
              <div className="bg-stone-50 border-2 border-black p-3 space-y-2">
                <div className="flex items-center justify-between font-mono-tech text-[11px] font-bold text-black">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isUnlocked ? 'bg-[#16a34a]' : 'bg-[#ef4444] animate-ping'}`} />
                    <span>SHOWREEL_FEED // 4K STREAM:</span>
                  </span>
                  <span className="text-black font-black">
                    {isVideoLoaded ? '100% BUFFERED' : `${videoProgress}%`}
                  </span>
                </div>

                {/* Progress bar inside telemetry */}
                <div className="w-full h-2.5 bg-stone-200 border border-black overflow-hidden">
                  <div
                    className="h-full bg-[#ef4444] transition-all duration-200"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between font-mono-tech text-[10px] text-stone-600 pt-0.5">
                  <span>
                    {(loadedBytes / (1024 * 1024)).toFixed(1)} MB / {(totalBytes / (1024 * 1024)).toFixed(1)} MB CACHED
                  </span>
                  <span className="text-[#16a34a] font-bold">
                    DATA RATE: {speed}
                  </span>
                </div>
              </div>
            </div>

            {/* Dual Stats Display */}
            <div className="grid grid-cols-2 gap-3">
              {/* Stat 1: Campaigns Cleared & Title */}
              <div className="bg-white border-2 border-black p-3 manga-shadow-sm">
                <div className="font-mono-tech text-[9px] text-stone-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>01 // CAMPAIGNS_LAUNCHED</span>
                  {combo > 1 && (
                    <span className="text-[#ef4444] font-bold animate-pulse">
                      x{combo} STREAK!
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-xl sm:text-2xl font-black text-black">
                    {gatesPassed} REACHED
                  </span>
                  <span className="font-mono-tech text-[9px] font-bold text-[#16a34a]">
                    {getRankFromScore(gatesPassed).split('//')[0]}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 border border-black mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#bef264] transition-all duration-300"
                    style={{ width: `${Math.min(100, (gatesPassed / 12) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Stat 2: Viral Impressions Harvested */}
              <div className="bg-white border-2 border-black p-3 manga-shadow-sm">
                <div className="font-mono-tech text-[9px] text-stone-500 uppercase tracking-wider mb-1">
                  02 // VIRAL_IMPRESSIONS
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-xl sm:text-2xl font-black text-black">
                    {manaOrbs * 250}K REACH
                  </span>
                  <span className="font-mono-tech text-[10px] font-bold text-[#ea580c]">
                    VEL: {velocityDisplay}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 border border-black mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#f97316] transition-all duration-300"
                    style={{ width: `${Math.min(100, (manaOrbs / 6) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Brand Status Ribbon / Quick Action */}
            <div
              onClick={isUnlocked ? handleEnterWebtoon : undefined}
              className={`p-3 border-2 border-black font-mono-tech text-xs font-bold tracking-wider flex items-center justify-between transition-all ${
                isUnlocked
                  ? 'bg-black text-[#bef264] cursor-pointer hover:bg-stone-900 manga-shadow-sm hover:scale-[1.01]'
                  : 'bg-stone-900 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-sm text-[#bef264] uppercase tracking-wider">
                  {isUnlocked ? 'OG MEDIA // READY' : 'PRE-FETCHING'}
                </span>
                <span>
                  {isUnlocked
                    ? '4K SHOWCASE PRIMED // LAUNCH NOW'
                    : `STREAMING SHOWCASE (${videoProgress}%)`}
                </span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 border ${
                  isUnlocked
                    ? 'bg-[#bef264] text-black border-black animate-pulse font-bold'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                {isUnlocked ? '• READY' : 'BUFFERING'}
              </span>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: INTERACTIVE DIGITAL MARKETING CAMPAIGN RUNNER GAME      */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Game Screen Outer Frame */}
            <div
              className="relative w-full max-w-[560px] aspect-[4/3] bg-black border-4 border-black manga-shadow-lg overflow-hidden cursor-pointer group"
              onClick={jump}
              onTouchStart={(e) => {
                e.preventDefault();
                jump();
              }}
            >
              {/* Canvas 60fps Game */}
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full h-full block"
              />

              {/* Game Ready / Controls Hint Overlay */}
              {gameStateStatus === 'READY' && (
                <div className="absolute top-4 left-0 right-0 text-center pointer-events-none z-20">
                  <span className="bg-black/90 text-[#bef264] border border-[#bef264] px-3.5 py-1.5 font-mono-tech text-xs font-bold tracking-widest shadow-md">
                    [ CLICK / TAP / SPACE TO LAUNCH CAMPAIGN ]
                  </span>
                </div>
              )}

              {/* AWAKENING NOTIFICATION BANNER (Non-intrusive when user is playing) */}
              {isUnlocked && !showAwakeningModal && gameStateStatus === 'PLAYING' && (
                <div className="absolute top-3 left-4 right-4 z-30 pointer-events-none flex justify-center">
                  <div className="bg-black/90 border border-[#bef264] px-3 py-1 font-mono-tech text-xs text-[#bef264] font-bold shadow-lg flex items-center gap-2 animate-bounce">
                    <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
                    <span>4K SHOWCASE 100% BUFFERED // ENTER ANY TIME OR EXTEND REACH</span>
                  </div>
                </div>
              )}

              {/* FULL AWAKENING MODAL (When unlocked & user clicks to view) */}
              {showAwakeningModal && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-4 z-40 animate-fade-in">
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white border-3 border-black p-6 max-w-sm w-full text-center manga-shadow-lg transform transition-transform"
                  >
                    <div className="flex justify-center mb-3">
                      <OgLogo size="lg" withText={false} />
                    </div>

                    <div className="inline-block bg-[#bef264] border border-black text-black font-mono-tech font-bold text-xs px-2.5 py-0.5 mb-2">
                      4K AGENCY SHOWCASE 100% BUFFERED
                    </div>

                    <h4 className="font-heading text-lg font-black uppercase text-black mb-1">
                      PORTFOLIO PORTAL ONLINE
                    </h4>
                    <p className="font-sans text-xs text-stone-600 mb-5 leading-normal">
                      The full 15.7MB showreel is cached in RAM. Step inside our brand universe and explore our digital capabilities, or continue playing the campaign runner!
                    </p>

                    <div className="space-y-2">
                      <button
                        onClick={handleEnterWebtoon}
                        className="w-full bg-black hover:bg-[#bef264] text-white hover:text-black border-2 border-black py-3 font-mono-tech font-black text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 manga-shadow-sm hover:translate-x-0.5 hover:-translate-y-0.5"
                      >
                        <span>LAUNCH AGENCY SHOWCASE</span>
                        <span>→</span>
                      </button>

                      <button
                        onClick={() => setShowAwakeningModal(false)}
                        className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 border border-black py-2 font-mono-tech font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                      >
                        KEEP PLAYING CAMPAIGN RUNNER
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Preload Sync Bar below game */}
            <div className="w-full max-w-[560px] mt-4 space-y-1.5">
              <div className="flex items-center justify-between font-mono-tech text-xs font-bold text-stone-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#ef4444]">▶</span>
                  <span>4K SHOWREEL BUFFER STATUS:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 ${isUnlocked ? 'bg-[#16a34a] text-white' : 'bg-[#ef4444] text-white'}`}>
                    {isUnlocked
                      ? 'SHOWREEL PRIMED // 100% IN CACHE'
                      : `BUFFERING 4K VIDEO (${speed})`}
                  </span>
                  <span className="text-sm font-black">{videoProgress}%</span>
                </div>
              </div>

              {/* Glowing Striped Progress Bar */}
              <div className="w-full h-4 bg-black border-2 border-black p-0.5 overflow-hidden">
                <div
                  className="h-full bg-[#bef264] transition-all duration-200 relative overflow-hidden"
                  style={{
                    width: `${videoProgress}%`,
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
                <span>[ASSET: HEROVID1.MP4 • 15.68 MB • 4K ULTRA-HD]</span>
                <span className="text-[#ef4444] font-bold">
                  {isUnlocked ? 'STATUS: ZERO-LAG READY' : 'PRE-FETCHING AGENCY SHOWREEL'}
                </span>
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
          {/* Tech Specs with OG Branding */}
          <div className="text-stone-700 flex items-center gap-2 flex-wrap">
            <span className="font-bold text-black flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#bef264] rounded-full inline-block" />
              OG MEDIA STUDIO
            </span>
            <span>//</span>
            <span>DIGITAL BRANDING & PERFORMANCE MARKETING</span>
            <span>//</span>
            <span>SEOUL • TOKYO • NEW YORK • LONDON</span>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleEnterWebtoon}
              className={`border-2 border-black px-4 py-1.5 font-bold font-mono-tech text-xs tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-sm hover:translate-x-0.5 hover:-translate-y-0.5 ${
                isUnlocked
                  ? 'bg-[#bef264] hover:bg-lime-400 text-black animate-pulse'
                  : 'bg-white hover:bg-stone-100 text-stone-800'
              }`}
            >
              <span>{isUnlocked ? 'LAUNCH AGENCY SHOWCASE (READY)' : 'ENTER NOW // STREAMING'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
