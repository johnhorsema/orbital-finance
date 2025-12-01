
// Color conversion utilities

// Convert Hex to RGB Object
export const hexToRgbObj = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Convert RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Convert HSL to RGB String "R G B"
export const hslToRgbString = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    
  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);
  
  return `${r} ${g} ${b}`;
};

export interface GeneratedPalette {
  void: string;
  surface: string;
  surfaceHighlight: string;
  neonGreen: string;
  neonPurple: string;
  neonCyan: string;
  neonPink: string;
  content: string; // Main text/border color (White in dark, Black in light)
  muted: string;   // Secondary text color
  field: string;   // Input background color
}

export const generatePalette = (primaryHex: string, mode: 'light' | 'dark'): GeneratedPalette => {
  const rgb = hexToRgbObj(primaryHex) || { r: 204, g: 255, b: 0 };
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const isDark = mode === 'dark';

  // Backgrounds
  // Dark: Deep blacks/greys. Light: Whites/Light Greys
  const voidL = isDark ? 5 : 98;
  const surfaceL = isDark ? 14 : 95;
  const highlightL = isDark ? 26 : 90;

  const voidColor = hslToRgbString(h, isDark ? 10 : 5, voidL);
  const surfaceColor = hslToRgbString(h, isDark ? 10 : 5, surfaceL);
  const highlightColor = hslToRgbString(h, isDark ? 10 : 5, highlightL);

  // Semantics
  // Content: Whiteish in Dark Mode, Blackish in Light Mode
  const content = isDark ? '240 240 245' : '24 24 27'; 
  
  // Muted: Grey for secondary text
  const muted = isDark ? '161 161 170' : '82 82 91'; // Zinc 400 vs Zinc 600

  // Field: Background for inputs
  const field = isDark ? '0 0 0' : '255 255 255';

  // Accents
  // We manipulate lightness to ensure contrast
  const accentS = Math.max(s, 80); // Keep saturation high
  
  // In Dark Mode, accents need to be bright (L > 50).
  // In Light Mode, accents need to be darker (L < 45) to read against white.
  const primaryL = isDark ? Math.max(l, 60) : Math.min(l, 40);

  const primary = hslToRgbString(h, accentS, primaryL);
  const secondary = hslToRgbString((h + 270) % 360, accentS, primaryL);
  const tertiary = hslToRgbString((h + 180) % 360, accentS, primaryL);
  const quaternary = hslToRgbString((h + 90) % 360, accentS, primaryL);

  return {
    void: voidColor,
    surface: surfaceColor,
    surfaceHighlight: highlightColor,
    neonGreen: primary,
    neonPurple: secondary,
    neonCyan: tertiary,
    neonPink: quaternary,
    content,
    muted,
    field
  };
};