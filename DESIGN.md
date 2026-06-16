# Design System

## Theme

**Dark mode justified**: Financial professionals working in low-light environments, often during focused analysis sessions. Dark backgrounds reduce eye strain during extended use and allow data visualizations to stand out with purposeful contrast.

## Color Strategy

**Restrained**: Tinted neutrals + one accent ≤10%. Professional product default.

### Base Palette (OKLCH)

```css
/* Neutrals - all tinted toward warm blue (chroma 0.008) */
--color-bg-primary: oklch(0.12 0.008 260);     /* Deep blue-black */
--color-bg-surface: oklch(0.16 0.008 260);     /* Card/panel background */
--color-bg-elevated: oklch(0.20 0.008 260);    /* Hover/elevated states */
--color-bg-subtle: oklch(0.14 0.008 260);      /* Subtle alternation */

/* Content */
--color-text-primary: oklch(0.95 0.005 260);   /* Near-white, not pure */
--color-text-secondary: oklch(0.65 0.008 260); /* Muted text */
--color-text-tertiary: oklch(0.45 0.008 260);  /* Disabled/placeholder */

/* Accent - Electric Blue (restrained, purposeful) */
--color-accent: oklch(0.65 0.18 250);          /* Primary action */
--color-accent-hover: oklch(0.70 0.20 250);    /* Hover state */
--color-accent-subtle: oklch(0.65 0.18 250 / 0.1); /* Subtle backgrounds */

/* Semantic - Income/Expense (muted, not neon) */
--color-positive: oklch(0.72 0.16 145);        /* Muted green for income */
--color-negative: oklch(0.62 0.18 25);         /* Muted red for expense */
--color-warning: oklch(0.75 0.15 85);          /* Amber for warnings */

/* Borders */
--color-border: oklch(0.25 0.008 260);         /* Default borders */
--color-border-strong: oklch(0.35 0.008 260);  /* Focus/active borders */
```

## Typography

### Font Stack

- **Primary**: `Geist` - Clean, modern, excellent for data-heavy interfaces
- **Mono**: `JetBrains Mono` - For financial data, dates, amounts
- **Fallback**: System sans-serif / monospace

### Type Scale

```css
/* Display - Page headers */
--text-display: 2.5rem / 1.0;      /* 40px, tight leading */
--font-display-weight: 500;

/* H1 - Section headers */
--text-h1: 1.875rem / 1.1;         /* 30px */
--font-h1-weight: 600;

/* H2 - Subsection headers */
--text-h2: 1.5rem / 1.2;           /* 24px */
--font-h2-weight: 600;

/* H3 - Card/section titles */
--text-h3: 1.25rem / 1.3;          /* 20px */
--font-h3-weight: 500;

/* Body - Primary content */
--text-body: 0.9375rem / 1.5;      /* 15px */
--font-body-weight: 400;

/* Small - Labels, metadata */
--text-small: 0.8125rem / 1.4;     /* 13px */
--font-small-weight: 400;

/* Mono - Data values */
--text-mono: 0.875rem / 1.4;       /* 14px */
--font-mono-weight: 400;
```

### Hierarchy Rules

- Weight contrast ≥1.25 between steps
- Body text max 65-75ch line length
- Mono for all financial data, dates, IDs
- Sans for all UI labels and content

## Spacing

### Scale (base 4px)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Layout Rhythm

- Page padding: `space-8` (32px)
- Section gaps: `space-8` to `space-12`
- Card padding: `space-6` (24px)
- Component gaps: `space-4` (16px)
- Tight grouping: `space-2` (8px)

## Elevation & Borders

### Corner Radius

**Sharp corners (radius 0)** - Professional tool aesthetic, no softness

- All cards, panels, inputs, buttons: `border-radius: 0`
- Exception: Modal/drawer edges may use `2px` radius

### Borders

- Default: `1px solid var(--color-border)`
- Focus/active: `1px solid var(--color-accent)`
- Dividers: `1px solid var(--color-border)`
- No decorative borders or side-stripes

### Shadows

**Minimal use** - Rely on borders and background contrast for elevation

- Elevated surfaces: Background color change, not shadows
- Modals: `0 0 0 1px var(--color-border-strong)` + backdrop
- No drop shadows on cards or buttons

## Components

### Buttons

```css
/* Primary */
background: var(--color-accent);
color: var(--color-bg-primary);
border: 1px solid var(--color-accent);
padding: 10px 16px;
font-size: 14px;
font-weight: 500;

/* Secondary */
background: transparent;
color: var(--color-text-primary);
border: 1px solid var(--color-border);
padding: 10px 16px;

/* Ghost */
background: transparent;
color: var(--color-text-secondary);
border: none;
padding: 8px 12px;

/* Danger */
background: transparent;
color: var(--color-negative);
border: 1px solid var(--color-negative);
```

**States**:
- Hover: Brightness +10% or background subtle fill
- Active: `transform: scale(0.98)` for tactile feedback
- Focus: `outline: 2px solid var(--color-accent); outline-offset: 2px`
- Disabled: `opacity: 0.4; pointer-events: none`

### Inputs

```css
background: var(--color-bg-surface);
border: 1px solid var(--color-border);
padding: 10px 12px;
font-size: 14px;
color: var(--color-text-primary);

/* Focus */
border-color: var(--color-accent);
outline: none;

/* Placeholder */
color: var(--color-text-tertiary);
```

### Cards/Panels

```css
background: var(--color-bg-surface);
border: 1px solid var(--color-border);
padding: var(--space-6);
```

### Data Tables/Lists

- Row height: 48px minimum
- Hover: `background: var(--color-bg-elevated)`
- Borders: `border-bottom: 1px solid var(--color-border)`
- No alternating row colors

## Motion

### Principles

- **Duration**: 150-250ms for UI interactions
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- **No bounce, no elastic**
- **Respect `prefers-reduced-motion`**

### Standard Transitions

- Page transitions: 250ms fade + slide
- Hover states: 150ms
- Modal open/close: 200ms
- List item enter: 100ms stagger

## Layout

### Grid System

- Max content width: `1400px`
- Page padding: `32px` desktop, `16px` mobile
- Card gaps: `24px` (desktop), `16px` (mobile)

### Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## Data Visualization

### Charts

- Line width: 2px
- Grid lines: `1px solid var(--color-border)`
- Axis labels: `var(--text-small)` in `var(--text-secondary)`
- Data colors: `var(--color-accent)`, `var(--color-positive)`, `var(--color-negative)`
- No gradient fills, solid colors only
- Tooltip: `var(--color-bg-elevated)` with border

## Accessibility

- All interactive elements have visible focus states
- Color never the sole indicator (use icons/text + color)
- Minimum contrast ratio: 4.5:1 (AA)
- Touch targets: 44x44px minimum
- Keyboard navigation for all features
