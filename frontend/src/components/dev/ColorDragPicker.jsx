import React, { useState, useRef, useCallback } from 'react';
import { hexToHsv, hsvToHex, hexToRgb, clamp } from './colorUtils';

const QUICK_PRESETS = [
  { name: 'Neon Lime', hex: '#39FF14' },
  { name: 'Cyber Red', hex: '#ef4444' },
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Hot Pink', hex: '#ec4899' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Manga Paper', hex: '#ebebe5' },
  { name: 'Void Black', hex: '#09090b' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Pitch Black', hex: '#000000' }
];

export default function ColorDragPicker({ value = '#39FF14', onChange, label }) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [copied, setCopied] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const padRef = useRef(null);
  const hueSliderRef = useRef(null);
  const isDraggingPadRef = useRef(false);
  const isDraggingHueRef = useRef(false);

  if (value !== prevValue) {
    setPrevValue(value);
    setHsv(hexToHsv(value));
  }

  const updateColor = useCallback((newHsv) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    if (onChange) {
      onChange(hex);
    }
  }, [onChange]);

  const handlePadPointer = useCallback((e) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);

    const s = Math.round(x * 100);
    const v = Math.round((1 - y) * 100);

    updateColor({ ...hsv, s, v });
  }, [hsv, updateColor]);

  const onPadPointerDown = (e) => {
    e.preventDefault();
    isDraggingPadRef.current = true;
    handlePadPointer(e);

    const onPointerMove = (ev) => {
      if (isDraggingPadRef.current) {
        handlePadPointer(ev);
      }
    };
    const onPointerUp = () => {
      isDraggingPadRef.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleHuePointer = useCallback((e) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const h = Math.round(x * 360) % 360;

    updateColor({ ...hsv, h });
  }, [hsv, updateColor]);

  const onHuePointerDown = (e) => {
    e.preventDefault();
    isDraggingHueRef.current = true;
    handleHuePointer(e);

    const onPointerMove = (ev) => {
      if (isDraggingHueRef.current) {
        handleHuePointer(ev);
      }
    };
    const onPointerUp = () => {
      isDraggingHueRef.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
  const rgb = hexToRgb(currentHex);
  const pureHueHex = hsvToHex(hsv.h, 100, 100);

  const copyHex = () => {
    navigator.clipboard?.writeText(currentHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="dev-console-drag-picker select-none">
      {label && (
        <div className="flex justify-between items-center mb-1.5 font-mono-tech text-[11px] text-stone-300">
          <span className="font-bold tracking-wider uppercase text-[#39FF14]">{label}</span>
          <span className="font-mono-tech text-[10px] text-stone-400">{currentHex}</span>
        </div>
      )}

      <div
        ref={padRef}
        onPointerDown={onPadPointerDown}
        className="relative w-full h-36 rounded border-2 border-stone-700 cursor-crosshair overflow-hidden touch-none shadow-inner"
        style={{
          backgroundColor: pureHueHex
        }}
        title="Click and drag to adjust Saturation & Brightness"
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #ffffff, transparent)'
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #000000, transparent)'
          }}
        />

        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.8)] pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            backgroundColor: currentHex
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-black/60 mx-auto mt-0.5" />
        </div>
      </div>

      <div className="mt-2.5">
        <div className="flex justify-between text-[10px] font-mono-tech text-stone-400 mb-1">
          <span>HUE DRAGGER</span>
          <span>{hsv.h}°</span>
        </div>
        <div
          ref={hueSliderRef}
          onPointerDown={onHuePointerDown}
          className="relative h-5 rounded-full border border-stone-700 cursor-ew-resize overflow-hidden touch-none"
          style={{
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
          }}
          title="Drag horizontally to change hue"
        >
          <div
            className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-white border-2 border-black rounded-sm shadow-md pointer-events-none"
            style={{
              left: `${(hsv.h / 360) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between text-[10px] font-mono-tech text-stone-400 mb-1">
          <span>BRIGHTNESS</span>
          <span>{hsv.v}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={hsv.v}
          onChange={(e) => updateColor({ ...hsv, v: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 p-1.5 bg-stone-900 border border-stone-800 rounded text-xs font-mono-tech">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-white/40 shadow-sm"
            style={{ backgroundColor: currentHex }}
          />
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-wider">{currentHex.toUpperCase()}</span>
            <span className="text-[9px] text-stone-400">
              rgb({rgb.r}, {rgb.g}, {rgb.b})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <label
            title="System Eyedropper / Color Picker"
            className="w-6 h-6 flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-stone-300 rounded border border-stone-700 cursor-pointer text-[11px]"
          >
            🔍
            <input
              type="color"
              value={currentHex}
              onChange={(e) => {
                const hex = e.target.value;
                setHsv(hexToHsv(hex));
                onChange?.(hex);
              }}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={copyHex}
            className="dev-console-btn px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[10px] font-bold text-[#39FF14] border border-stone-700 rounded cursor-pointer transition-colors"
          >
            {copied ? '✓ COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="text-[10px] font-mono-tech text-stone-400 mb-1">PRESET SWATCHES</div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              title={`${preset.name} (${preset.hex})`}
              onClick={() => {
                setHsv(hexToHsv(preset.hex));
                onChange?.(preset.hex);
              }}
              className={`dev-console-btn w-5 h-5 rounded-sm border transition-transform hover:scale-115 active:scale-95 cursor-pointer ${
                currentHex.toLowerCase() === preset.hex.toLowerCase()
                  ? 'border-white ring-1 ring-[#39FF14]'
                  : 'border-stone-700'
              }`}
              style={{ backgroundColor: preset.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
