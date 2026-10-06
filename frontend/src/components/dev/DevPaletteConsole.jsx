import React, { useState, useEffect, useRef, useCallback } from 'react';
import ColorDragPicker from './ColorDragPicker';
import { parseCssColorToHex } from './colorUtils';

const DEFAULT_PALETTE = {
  baseBg: '#ebebe5',
  baseText: '#111111',
  baseAccent: '#39FF14',
  
  btnBg: '#39FF14',
  btnText: '#000000',
  btnBorder: '#000000',
  btnShadow: '#000000',
  btnHover: '#7CFF5E'
};

export default function DevPaletteConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('base');

  const [palette, setPalette] = useState(() => ({ ...DEFAULT_PALETTE }));
  const [hasBaseOverrides, setHasBaseOverrides] = useState(false);
  const [hasButtonOverrides, setHasButtonOverrides] = useState(false);

  const [isInspectMode, setIsInspectMode] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);
  const selectedElementRef = useRef(null);
  const [selectedElementInfo, setSelectedElementInfo] = useState(null);
  const [elementColors, setElementColors] = useState({
    bg: '#39FF14',
    text: '#000000',
    border: '#000000'
  });
  const modifiedElementsRef = useRef(new Map());
  const [modifiedCount, setModifiedCount] = useState(0);

  const [position, setPosition] = useState({ x: 24, y: 100 });
  const [isDraggingConsole, setIsDraggingConsole] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const consoleRef = useRef(null);
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    let styleTag = document.getElementById('ogmedia-dev-palette-base');
    if (!hasBaseOverrides) {
      if (styleTag) styleTag.remove();
      return;
    }

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'ogmedia-dev-palette-base';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      html, body, #root, #root > div.min-h-screen {
        background-color: ${palette.baseBg} !important;
        color: ${palette.baseText} !important;
      }
      ::selection {
        background-color: ${palette.baseAccent} !important;
        color: #000000 !important;
      }
    `;

    return () => {
      const tag = document.getElementById('ogmedia-dev-palette-base');
      if (tag) tag.remove();
    };
  }, [palette.baseBg, palette.baseText, palette.baseAccent, hasBaseOverrides]);

  useEffect(() => {
    let styleTag = document.getElementById('ogmedia-dev-palette-buttons');
    if (!hasButtonOverrides) {
      if (styleTag) styleTag.remove();
      return;
    }

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'ogmedia-dev-palette-buttons';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      button:not(.dev-console-root, .dev-console-root *),
      a[role="button"]:not(.dev-console-root, .dev-console-root *),
      input[type="button"]:not(.dev-console-root, .dev-console-root *) {
        background-color: ${palette.btnBg} !important;
        color: ${palette.btnText} !important;
        border-color: ${palette.btnBorder} !important;
        box-shadow: 4px 4px 0px ${palette.btnShadow} !important;
        transition: all 0.15s ease !important;
      }
      button:not(.dev-console-root, .dev-console-root *):hover,
      a[role="button"]:not(.dev-console-root, .dev-console-root *):hover {
        background-color: ${palette.btnHover} !important;
      }
    `;

    return () => {
      const tag = document.getElementById('ogmedia-dev-palette-buttons');
      if (tag) tag.remove();
    };
  }, [palette.btnBg, palette.btnText, palette.btnBorder, palette.btnShadow, palette.btnHover, hasButtonOverrides]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isInspectMode) {
        setIsInspectMode(false);
        setHoveredElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInspectMode]);

  useEffect(() => {
    if (!isInspectMode) return;

    const handleMouseMove = (e) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target) return;
      if (target.closest('.dev-console-root')) {
        setHoveredElement(null);
        return;
      }
      setHoveredElement(target);
    };

    const handleClick = (e) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target.closest('.dev-console-root')) return;

      e.preventDefault();
      e.stopPropagation();

      selectedElementRef.current = target;
      setIsInspectMode(false);
      setHoveredElement(null);
      setActiveTab('element');

      const computed = window.getComputedStyle(target);
      const initialBg = parseCssColorToHex(computed.backgroundColor, '#39FF14');
      const initialText = parseCssColorToHex(computed.color, '#111111');
      const initialBorder = parseCssColorToHex(computed.borderColor, '#000000');

      setElementColors({
        bg: initialBg,
        text: initialText,
        border: initialBorder
      });

      if (!modifiedElementsRef.current.has(target)) {
        modifiedElementsRef.current.set(target, {
          originalBg: target.style.backgroundColor || '',
          originalColor: target.style.color || '',
          originalBorderColor: target.style.borderColor || '',
          originalBoxShadow: target.style.boxShadow || '',
          tagName: target.tagName.toLowerCase(),
          className: target.className
        });
        setModifiedCount(modifiedElementsRef.current.size);
      }

      const tag = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const classes = typeof target.className === 'string'
        ? target.className.split(' ').filter(Boolean).slice(0, 3).map(c => `.${c}`).join('')
        : '';
      setSelectedElementInfo({
        tag,
        selector: `${tag}${id}${classes}`,
        dimensions: `${Math.round(target.offsetWidth)}x${Math.round(target.offsetHeight)}px`
      });
    };

    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('click', handleClick, true);
    };
  }, [isInspectMode]);

  const applyElementColor = useCallback((property, hexValue) => {
    const el = selectedElementRef.current;
    if (!el) return;

    if (property === 'bg') {
      el.style.setProperty('background-color', hexValue, 'important');
      setElementColors((prev) => ({ ...prev, bg: hexValue }));
    } else if (property === 'text') {
      el.style.setProperty('color', hexValue, 'important');
      setElementColors((prev) => ({ ...prev, text: hexValue }));
    } else if (property === 'border') {
      el.style.setProperty('border-color', hexValue, 'important');
      if (!el.style.borderWidth) {
        el.style.setProperty('border-width', '2px', 'important');
      }
      setElementColors((prev) => ({ ...prev, border: hexValue }));
    }
  }, []);

  const revertSelectedElement = () => {
    const el = selectedElementRef.current;
    if (!el) return;
    const original = modifiedElementsRef.current.get(el);
    if (original) {
      el.style.backgroundColor = original.originalBg;
      el.style.color = original.originalColor;
      el.style.borderColor = original.originalBorderColor;
      el.style.boxShadow = original.originalBoxShadow;
      modifiedElementsRef.current.delete(el);
      setModifiedCount(modifiedElementsRef.current.size);
    }
    selectedElementRef.current = null;
    setSelectedElementInfo(null);
  };

  const revertAllChanges = () => {
    modifiedElementsRef.current.forEach((val, el) => {
      if (el && el.style) {
        el.style.backgroundColor = val.originalBg;
        el.style.color = val.originalColor;
        el.style.borderColor = val.originalBorderColor;
        el.style.boxShadow = val.originalBoxShadow;
      }
    });
    modifiedElementsRef.current.clear();
    setModifiedCount(0);
    selectedElementRef.current = null;
    setSelectedElementInfo(null);

    const baseTag = document.getElementById('ogmedia-dev-palette-base');
    if (baseTag) baseTag.remove();
    const btnTag = document.getElementById('ogmedia-dev-palette-buttons');
    if (btnTag) btnTag.remove();

    setPalette({ ...DEFAULT_PALETTE });
    setHasBaseOverrides(false);
    setHasButtonOverrides(false);
    setIsInspectMode(false);
    setHoveredElement(null);
  };

  const handleDragStart = (e) => {
    if (e.target.closest('.dev-console-header-btn')) return;
    e.preventDefault();
    setIsDraggingConsole(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };

    const handlePointerMove = (ev) => {
      const deltaX = ev.clientX - dragStartRef.current.startX;
      const deltaY = ev.clientY - dragStartRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 380, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.initialY + deltaY));
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDraggingConsole(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const generateExportCss = () => {
    let css = `/* OG Media Dev Color Palette Overrides */\n`;
    if (hasBaseOverrides) {
      css += `/* Base Site Colors */\n:root {\n  --site-base-bg: ${palette.baseBg};\n  --site-base-text: ${palette.baseText};\n  --site-accent: ${palette.baseAccent};\n}\n\n`;
    }
    if (hasButtonOverrides) {
      css += `/* Button Styles */\n.btn-primary, button {\n  background-color: ${palette.btnBg};\n  color: ${palette.btnText};\n  border-color: ${palette.btnBorder};\n  box-shadow: 4px 4px 0px ${palette.btnShadow};\n}\n.btn-primary:hover, button:hover {\n  background-color: ${palette.btnHover};\n}\n\n`;
    }
    if (selectedElementInfo) {
      css += `/* Selected Element (${selectedElementInfo.selector}) */\n${selectedElementInfo.tag} {\n  background-color: ${elementColors.bg};\n  color: ${elementColors.text};\n  border-color: ${elementColors.border};\n}\n`;
    }
    return css;
  };

  const handleCopyCss = () => {
    navigator.clipboard?.writeText(generateExportCss());
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <>
      {isInspectMode && hoveredElement && (
        <div
          className="fixed pointer-events-none z-[99999] border-2 border-dashed border-[#39FF14] bg-[#39FF14]/10 transition-all duration-75"
          style={{
            top: `${hoveredElement.getBoundingClientRect().top}px`,
            left: `${hoveredElement.getBoundingClientRect().left}px`,
            width: `${hoveredElement.getBoundingClientRect().width}px`,
            height: `${hoveredElement.getBoundingClientRect().height}px`
          }}
        >
          <div className="absolute -top-7 left-0 bg-black text-[#39FF14] border border-[#39FF14] px-1.5 py-0.5 font-mono-tech text-[10px] font-bold tracking-wider whitespace-nowrap shadow-md">
            &lt;{hoveredElement.tagName.toLowerCase()}&gt; {hoveredElement.className ? `.${hoveredElement.className.toString().split(' ')[0]}` : ''}
          </div>
        </div>
      )}

      {isInspectMode && (
        <div className="dev-console-root fixed top-3 left-1/2 -translate-x-1/2 z-[100000] bg-black text-white px-4 py-2 border-2 border-[#39FF14] manga-shadow font-mono-tech text-xs flex items-center gap-3 animate-bounce">
          <span className="text-[#39FF14] text-sm animate-pulse">🎯</span>
          <span><b>INSPECT MODE ACTIVE:</b> Click any element on the page to customize its color.</span>
          <button
            type="button"
            onClick={() => setIsInspectMode(false)}
            className="dev-console-btn bg-[#ef4444] hover:bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 border border-white cursor-pointer"
          >
            ESC TO CANCEL
          </button>
        </div>
      )}

      {!isOpen && (
        <div className="dev-console-root fixed bottom-5 left-5 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Open UI Color Palette Console (Alt+P)"
            className="dev-console-btn bg-black hover:bg-stone-900 text-white border-2 border-[#39FF14] px-3.5 py-2 font-mono-tech font-bold text-xs manga-shadow transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse" />
            <span className="text-[#39FF14]">🎨 DEV PALETTE</span>
            {(hasBaseOverrides || hasButtonOverrides || modifiedCount > 0) && (
              <span className="bg-[#ef4444] text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                ACTIVE
              </span>
            )}
          </button>
        </div>
      )}

      {isOpen && (
        <aside
          ref={consoleRef}
          aria-label="Developer Color Palette Console"
          className="dev-console-root fixed z-[99990] w-88 max-w-[94vw] bg-[#0c0c0e] text-white border-2 border-white/80 manga-shadow-lg font-mono-tech select-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`
          }}
        >
          <div
            onPointerDown={handleDragStart}
            className={`flex items-center justify-between p-2.5 bg-black border-b-2 border-white/40 cursor-grab active:cursor-grabbing ${
              isDraggingConsole ? 'bg-stone-900' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base text-[#39FF14]">⚙</span>
              <div>
                <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                  <span>COLOR LAB</span>
                  <span className="bg-[#39FF14] text-black text-[9px] px-1 py-0.2 font-black rounded">
                    DEV HUD
                  </span>
                </div>
                <div className="text-[9px] text-stone-400">
                  Drag to move • In-memory only
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={revertAllChanges}
                title="Revert all changes to site defaults"
                className="dev-console-header-btn px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-600 rounded text-[10px] cursor-pointer"
              >
                ↺ RESET
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="dev-console-header-btn w-6 h-6 flex items-center justify-center bg-stone-800 hover:bg-stone-700 text-white border border-stone-600 rounded text-xs cursor-pointer"
              >
                {isMinimized ? '□' : '−'}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close console (changes remain active until refresh)"
                className="dev-console-header-btn w-6 h-6 flex items-center justify-center bg-[#ef4444] hover:bg-red-600 text-white font-bold rounded text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {isMinimized ? (
            <div className="p-2 bg-stone-900 text-stone-300 text-[11px] flex justify-between items-center">
              <span>Palette Active (Minimized)</span>
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="text-[#39FF14] underline text-[10px] cursor-pointer"
              >
                Expand Controls
              </button>
            </div>
          ) : (
            <div className="p-3 max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-1 p-1 bg-stone-900/90 border border-stone-800 rounded mb-3 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('base')}
                  className={`dev-console-btn py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'base'
                      ? 'bg-[#39FF14] text-black manga-shadow-sm font-black'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  SITE BASE
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('buttons')}
                  className={`dev-console-btn py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'buttons'
                      ? 'bg-[#39FF14] text-black manga-shadow-sm font-black'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  BUTTONS
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('element')}
                  className={`dev-console-btn py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'element'
                      ? 'bg-[#39FF14] text-black manga-shadow-sm font-black'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  ELEMENT
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('export')}
                  className={`dev-console-btn py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'export'
                      ? 'bg-[#39FF14] text-black manga-shadow-sm font-black'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  CSS
                </button>
              </div>

              {activeTab === 'base' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-[11px] text-stone-300 font-bold">BASE SITE BACKGROUND</span>
                    <label className="flex items-center gap-1.5 text-[10px] text-stone-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasBaseOverrides}
                        onChange={(e) => setHasBaseOverrides(e.target.checked)}
                        className="accent-[#39FF14]"
                      />
                      <span>Enable Override</span>
                    </label>
                  </div>

                  <ColorDragPicker
                    label="Background Color"
                    value={palette.baseBg}
                    onChange={(hex) => {
                      setPalette((prev) => ({ ...prev, baseBg: hex }));
                      setHasBaseOverrides(true);
                    }}
                  />

                  <div className="pt-2 border-t border-stone-800">
                    <ColorDragPicker
                      label="Site Text Color"
                      value={palette.baseText}
                      onChange={(hex) => {
                        setPalette((prev) => ({ ...prev, baseText: hex }));
                        setHasBaseOverrides(true);
                      }}
                    />
                  </div>

                  <div className="bg-stone-900/60 p-2 border border-stone-800 rounded text-[10px] text-stone-400">
                    💡 <b>Tip:</b> Changes to the site background happen in real time as you drag across the color canvas!
                  </div>
                </div>
              )}

              {activeTab === 'buttons' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-[11px] text-stone-300 font-bold">GLOBAL BUTTON PALETTE</span>
                    <label className="flex items-center gap-1.5 text-[10px] text-stone-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasButtonOverrides}
                        onChange={(e) => setHasButtonOverrides(e.target.checked)}
                        className="accent-[#39FF14]"
                      />
                      <span>Enable Override</span>
                    </label>
                  </div>

                  <ColorDragPicker
                    label="Button Background"
                    value={palette.btnBg}
                    onChange={(hex) => {
                      setPalette((prev) => ({
                        ...prev,
                        btnBg: hex,
                        btnHover: hex
                      }));
                      setHasButtonOverrides(true);
                    }}
                  />

                  <div className="pt-2 border-t border-stone-800">
                    <ColorDragPicker
                      label="Button Text Color"
                      value={palette.btnText}
                      onChange={(hex) => {
                        setPalette((prev) => ({ ...prev, btnText: hex }));
                        setHasButtonOverrides(true);
                      }}
                    />
                  </div>

                  <div className="pt-2 border-t border-stone-800">
                    <ColorDragPicker
                      label="Border & Shadow Color"
                      value={palette.btnBorder}
                      onChange={(hex) => {
                        setPalette((prev) => ({
                          ...prev,
                          btnBorder: hex,
                          btnShadow: hex
                        }));
                        setHasButtonOverrides(true);
                      }}
                    />
                  </div>

                  <div className="p-3 bg-stone-950 border border-stone-800 rounded flex flex-col items-center gap-1.5">
                    <span className="text-[9px] text-stone-400">LIVE BUTTON PREVIEW</span>
                    <button
                      type="button"
                      className="px-4 py-2 font-mono-tech font-bold text-xs cursor-pointer"
                      style={{
                        backgroundColor: palette.btnBg,
                        color: palette.btnText,
                        borderColor: palette.btnBorder,
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        boxShadow: `4px 4px 0px ${palette.btnShadow}`
                      }}
                    >
                      SAMPLE BUTTON ⚡
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'element' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-[11px] text-stone-300 font-bold">ELEMENT COLORIZER</span>
                    {selectedElementInfo && (
                      <button
                        type="button"
                        onClick={revertSelectedElement}
                        className="text-[10px] text-[#ef4444] hover:underline cursor-pointer"
                      >
                        Revert This Element
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsInspectMode(true)}
                    className="dev-console-btn w-full py-2.5 bg-black hover:bg-stone-900 text-[#39FF14] border-2 border-[#39FF14] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer manga-shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <span>🎯</span>
                    <span>{isInspectMode ? 'SELECTING ELEMENT...' : 'PICK / INSPECT ELEMENT'}</span>
                  </button>

                  {selectedElementInfo ? (
                    <div className="p-2.5 bg-stone-900 border border-stone-700 rounded space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-stone-400">TARGET:</span>
                        <span className="text-[#39FF14] font-bold">{selectedElementInfo.dimensions}</span>
                      </div>
                      <div className="text-[11px] font-bold text-white bg-black p-1.5 border border-stone-700 rounded break-all">
                        {selectedElementInfo.selector}
                      </div>

                      <div className="pt-2 border-t border-stone-800 space-y-3">
                        <ColorDragPicker
                          label="Element Background"
                          value={elementColors.bg}
                          onChange={(hex) => applyElementColor('bg', hex)}
                        />

                        <ColorDragPicker
                          label="Element Text Color"
                          value={elementColors.text}
                          onChange={(hex) => applyElementColor('text', hex)}
                        />

                        <ColorDragPicker
                          label="Element Border Color"
                          value={elementColors.border}
                          onChange={(hex) => applyElementColor('border', hex)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-900/60 border border-dashed border-stone-700 rounded text-center text-[11px] text-stone-400 space-y-2">
                      <div className="text-2xl">🔍</div>
                      <div>No element selected yet.</div>
                      <div className="text-[10px] text-stone-500">
                        Click <b>"PICK / INSPECT ELEMENT"</b> above, then click on any heading, card, image container, or text on the page to customize its colors!
                      </div>
                    </div>
                  )}

                  {modifiedCount > 0 && (
                    <div className="text-[10px] text-stone-400 flex justify-between items-center bg-stone-900 p-2 rounded">
                      <span>Elements customized in session:</span>
                      <span className="text-[#39FF14] font-bold">{modifiedCount}</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'export' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <span className="text-[11px] text-stone-300 font-bold">EXPORT MODIFIED CSS</span>
                    <button
                      type="button"
                      onClick={handleCopyCss}
                      className="dev-console-btn px-2.5 py-1 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-bold text-[10px] rounded cursor-pointer transition-colors"
                    >
                      {copyStatus ? '✓ COPIED!' : '📋 COPY CSS'}
                    </button>
                  </div>

                  <p className="text-[10px] text-stone-400">
                    If you discovered great colors for your design, copy the generated CSS below:
                  </p>

                  <textarea
                    readOnly
                    value={generateExportCss()}
                    rows={8}
                    className="w-full bg-black text-[#39FF14] p-2 text-[10px] font-mono-tech border border-stone-700 rounded resize-none focus:outline-none"
                  />

                  <div className="p-2 bg-stone-900/80 border border-stone-800 rounded text-[10px] text-stone-400">
                    ⚠️ <b>Temporary Dev Mode:</b> None of these changes are saved to disk or localStorage. When you reload the page (F5), the entire website automatically returns to its original color palette.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-2 bg-black border-t border-stone-800 flex justify-between items-center text-[10px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
              <span>SESSION ONLY • NON-PERMANENT</span>
            </div>
            <button
              type="button"
              onClick={revertAllChanges}
              className="text-stone-400 hover:text-white underline cursor-pointer"
            >
              Reset All
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
