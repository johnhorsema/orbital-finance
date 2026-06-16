
// Color conversion utilities

// Convert Hex to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Convert RGB to OKLCH (simplified approximation)
// For production, use a proper OKLCH library
const rgbToOklch = (r: number, g: number, b: number): { l: number; c: number; h: number } => {
  // Normalize RGB to 0-1
  r /= 255;
  g /= 255;
  b /= 255;
  
  // Convert to linear RGB
  const linearize = (v: number) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  const rl = linearize(r);
  const gl = linearize(g);
  const bl = linearize(b);
  
  // Convert to XYZ (D65)
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  const z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;
  
  // Convert XYZ to OKLCH (simplified)
  const l = Math.pow(y, 1/3) * 1.16 - 0.16; // Lightness 0-1
  
  // Calculate chroma and hue from a,b
  const a = (x - y) * 3.2;
  const b_val = (y - z) * 1.8;
  const c = Math.sqrt(a * a + b_val * b_val) * 0.3; // Chroma
  const h = Math.atan2(b_val, a) * (180 / Math.PI); // Hue in degrees
  
  return { 
    l: Math.max(0, Math.min(1, l)), 
    c: Math.max(0, Math.min(0.35, c)), 
    h: ((h % 360) + 360) % 360 
  };
};

// Convert OKLCH to CSS string
const oklchToString = (l: number, c: number, h: number, alpha?: number): string => {
  if (alpha !== undefined) {
    return `oklch(${l} ${c} ${h} / ${alpha})`;
  }
  return `oklch(${l} ${c} ${h})`;
};

export interface GeneratedPalette {
  // Background colors
  bgPrimary: string;
  bgSurface: string;
  bgSurfaceHighlight: string;
  bgSubtle: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Accent color (customizable primary)
  accent: string;
  accentHover: string;
  accentSubtle: string;
  
  // Semantic colors
  positive: string;
  negative: string;
  warning: string;
  
  // Border colors
  border: string;
  borderStrong: string;
}

export const generatePalette = (primaryHex: string, mode: 'light' | 'dark'): GeneratedPalette => {
  const rgb = hexToRgb(primaryHex) || { r: 59, g: 130, b: 246 }; // Default to blue
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
  const isDark = mode === 'dark';
  
  const { h } = oklch;
  
  // Background palette - tinted toward primary hue
  const bgChroma = 0.008; // Very subtle tint
  
  const bgPrimary = oklchToString(isDark ? 0.12 : 0.98, bgChroma, h);
  const bgSurface = oklchToString(isDark ? 0.16 : 0.95, bgChroma, h);
  const bgSurfaceHighlight = oklchToString(isDark ? 0.20 : 0.92, bgChroma, h);
  const bgSubtle = oklchToString(isDark ? 0.14 : 0.96, bgChroma, h);
  
  // Text colors
  const textChroma = 0.005;
  const textPrimary = oklchToString(isDark ? 0.95 : 0.15, textChroma, h);
  const textSecondary = oklchToString(isDark ? 0.65 : 0.45, bgChroma, h);
  const textTertiary = oklchToString(isDark ? 0.45 : 0.65, bgChroma, h);
  
  // Accent color - derived from primary
  // Dark mode: lighter accent for contrast
  // Light mode: darker accent for visibility
  const accentChroma = isDark ? 0.18 : 0.15;
  const accentLightness = isDark ? 0.65 : 0.55;
  
  const accent = oklchToString(accentLightness, accentChroma, h);
  const accentHover = oklchToString(accentLightness + 0.05, accentChroma + 0.02, h);
  const accentSubtle = oklchToString(accentLightness, accentChroma, h, 0.1);
  
  // Semantic colors (fixed hues)
  const positive = oklchToString(0.72, 0.16, 145); // Green
  const negative = oklchToString(0.62, 0.18, 25);  // Red
  const warning = oklchToString(0.75, 0.15, 85);   // Amber
  
  // Border colors
  const borderChroma = bgChroma;
  const border = oklchToString(isDark ? 0.25 : 0.85, borderChroma, h);
  const borderStrong = oklchToString(isDark ? 0.35 : 0.75, borderChroma, h);
  
  return {
    bgPrimary,
    bgSurface,
    bgSurfaceHighlight,
    bgSubtle,
    textPrimary,
    textSecondary,
    textTertiary,
    accent,
    accentHover,
    accentSubtle,
    positive,
    negative,
    warning,
    border,
    borderStrong
  };
};