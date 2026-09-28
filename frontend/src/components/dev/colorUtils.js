/**
 * Utility functions for color conversions (HEX, RGB, HSL, HSV)
 * Pure JS, zero external dependencies.
 */

/**
 * Clamp a number between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Convert HEX to RGB object { r, g, b }
 */
export function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length < 6) return { r: 0, g: 0, b: 0 };
  const num = parseInt(clean.substring(0, 6), 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Convert RGB to 6-char HEX string (#rrggbb)
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const clamped = clamp(Math.round(n), 0, 255);
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB (0-255) to HSV { h: 0-360, s: 0-100, v: 0-100 }
 */
export function rgbToHsv(r, g, b) {
  const rNorm = clamp(r, 0, 255) / 255;
  const gNorm = clamp(g, 0, 255) / 255;
  const bNorm = clamp(b, 0, 255) / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (diff / max) * 100;
  const v = max * 100;

  if (diff !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / diff) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / diff + 2;
    } else {
      h = (rNorm - gNorm) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s: Math.round(s), v: Math.round(v) };
}

/**
 * Convert HSV to RGB { r, g, b }
 */
export function hsvToRgb(h, s, v) {
  const hNorm = (clamp(h, 0, 360) % 360) / 60;
  const sNorm = clamp(s, 0, 100) / 100;
  const vNorm = clamp(v, 0, 100) / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs((hNorm % 2) - 1));
  const m = vNorm - c;

  let r = 0, g = 0, b = 0;
  if (hNorm >= 0 && hNorm < 1) {
    r = c; g = x; b = 0;
  } else if (hNorm >= 1 && hNorm < 2) {
    r = x; g = c; b = 0;
  } else if (hNorm >= 2 && hNorm < 3) {
    r = 0; g = c; b = x;
  } else if (hNorm >= 3 && hNorm < 4) {
    r = 0; g = x; b = c;
  } else if (hNorm >= 4 && hNorm < 5) {
    r = x; g = 0; b = c;
  } else if (hNorm >= 5 && hNorm <= 6) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

/**
 * Convert HEX to HSV
 */
export function hexToHsv(hex) {
  const rgb = hexToRgb(hex);
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HSV to HEX
 */
export function hsvToHex(h, s, v) {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Parse any CSS color string (hex, rgb, rgba) or fallback to computed style
 */
export function parseCssColorToHex(colorStr, fallback = '#000000') {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit') {
    return fallback;
  }
  if (colorStr.startsWith('#')) {
    return colorStr;
  }
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10));
  }
  return fallback;
}
