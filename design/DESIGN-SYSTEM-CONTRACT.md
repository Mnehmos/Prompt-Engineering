# Mnehmos Ecosystem Design System Contract

## Overview

This contract defines the shared visual language and component patterns for all mnehmos websites:
- `vario.automation.website` - Corporate/consulting presence
- `mnehmos.prompts.research` - Prompt engineering taxonomy
- Future: `mnehmos.docs`, `mnehmos.tools`

## Design Tokens

### Color Palette

```css
/* Primary: Indigo - Intelligence, Technology */
--indigo-50: #eef2ff;
--indigo-100: #e0e7ff;
--indigo-200: #c7d2fe;
--indigo-300: #a5b4fc;
--indigo-400: #818cf8;
--indigo-500: #6366f1;  /* Primary */
--indigo-600: #4f46e5;  /* Primary Dark */
--indigo-700: #4338ca;
--indigo-800: #3730a3;
--indigo-900: #312e81;

/* Accent: Copper - Warmth, Craftsmanship */
--copper-light: #D4956A;
--copper: #B87333;      /* Accent */
--copper-dark: #8B5A2B;

/* Neutral: Slate */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
--slate-500: #64748b;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1e293b;
--slate-900: #0f172a;
--slate-950: #020617;

/* Semantic */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography

```css
/* Font Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing

```css
/* Base: 4px */
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
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Borders & Shadows

```css
/* Border Radius */
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem;   /* 8px */
--radius-xl: 0.75rem;  /* 12px */
--radius-2xl: 1rem;    /* 16px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Glassmorphism

```css
/* Glass Effect */
--glass-bg-light: rgba(255, 255, 255, 0.7);
--glass-bg-dark: rgba(30, 41, 59, 0.7);
--glass-border-light: rgba(255, 255, 255, 0.3);
--glass-border-dark: rgba(71, 85, 105, 0.3);
--glass-blur: blur(12px);
--glass-saturate: saturate(180%);
```

---

## Semantic Tokens (Theme-Aware)

```css
:root {
  /* Backgrounds */
  --bg-body: var(--slate-50);
  --bg-card: white;
  --bg-muted: var(--slate-100);
  --bg-accent: var(--indigo-50);
  
  /* Text */
  --text-main: var(--slate-900);
  --text-muted: var(--slate-500);
  --text-accent: var(--indigo-600);
  
  /* Borders */
  --border-default: var(--slate-200);
  --border-muted: var(--slate-100);
  
  /* Interactive */
  --interactive-default: var(--indigo-600);
  --interactive-hover: var(--indigo-700);
  --interactive-focus: var(--indigo-500);
}

[data-theme="dark"] {
  /* Backgrounds */
  --bg-body: var(--slate-900);
  --bg-card: var(--slate-800);
  --bg-muted: var(--slate-700);
  --bg-accent: var(--indigo-900);
  
  /* Text */
  --text-main: var(--slate-100);
  --text-muted: var(--slate-400);
  --text-accent: var(--indigo-400);
  
  /* Borders */
  --border-default: var(--slate-700);
  --border-muted: var(--slate-800);
  
  /* Interactive */
  --interactive-default: var(--indigo-500);
  --interactive-hover: var(--indigo-400);
  --interactive-focus: var(--indigo-600);
}
```

---

## Component Patterns

### Card

```html
<article class="card">
  <div class="card-header">
    <span class="card-icon">{icon}</span>
    <h3 class="card-title">{title}</h3>
  </div>
  <p class="card-description">{description}</p>
  <div class="card-footer">
    {actions}
  </div>
</article>
```

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card.glass {
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-blur) var(--glass-saturate);
  border: 1px solid var(--glass-border-light);
}

[data-theme="dark"] .card.glass {
  background: var(--glass-bg-dark);
  border-color: var(--glass-border-dark);
}
```

### Button

```html
<button class="btn btn-primary">
  {icon?}
  <span>{label}</span>
</button>
```

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  transition: all 0.15s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--interactive-default);
  color: white;
}

.btn-primary:hover {
  background: var(--interactive-hover);
}

.btn-secondary {
  background: var(--bg-muted);
  color: var(--text-main);
  border: 1px solid var(--border-default);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
}

.btn-ghost:hover {
  background: var(--bg-muted);
  color: var(--text-main);
}
```

### Badge

```html
<span class="badge badge-{variant}">{label}</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-primary {
  background: var(--indigo-100);
  color: var(--indigo-700);
}

.badge-success {
  background: #d1fae5;
  color: #047857;
}

.badge-warning {
  background: #fef3c7;
  color: #b45309;
}

.badge-copper {
  background: #fef3c7;
  color: var(--copper-dark);
}
```

### Header

```html
<header class="header">
  <div class="header-container">
    <a href="/" class="logo">
      <img src="/logo.svg" alt="Mnehmos" />
      <span class="logo-text">{site-name}</span>
    </a>
    <nav class="nav">
      <a href="/" class="nav-link" aria-current="page">Home</a>
      <a href="/about" class="nav-link">About</a>
      <!-- ... -->
    </nav>
    <div class="header-actions">
      <button class="theme-toggle" aria-label="Toggle theme">
        {sun/moon icon}
      </button>
      <a href="/support" class="support-link">
        ☕ Support
      </a>
    </div>
  </div>
</header>
```

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-blur) var(--glass-saturate);
  border-bottom: 1px solid var(--glass-border-light);
}

[data-theme="dark"] .header {
  background: var(--glass-bg-dark);
  border-color: var(--glass-border-dark);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-link {
  color: var(--text-muted);
  font-weight: var(--font-medium);
  transition: color 0.15s;
}

.nav-link:hover,
.nav-link[aria-current="page"] {
  color: var(--interactive-default);
}
```

### Hero Section

```html
<section class="hero">
  <div class="hero-content">
    <span class="hero-badge">{badge}</span>
    <h1 class="hero-title">{title}</h1>
    <p class="hero-description">{description}</p>
    <div class="hero-actions">
      <a href="#" class="btn btn-primary btn-lg">Get Started</a>
      <a href="#" class="btn btn-secondary btn-lg">Learn More</a>
    </div>
  </div>
  <div class="hero-visual">
    {illustration or graphic}
  </div>
</section>
```

```css
.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: var(--space-24) var(--space-6);
  background: linear-gradient(
    135deg,
    var(--bg-body) 0%,
    var(--bg-accent) 100%
  );
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--text-main);
}

.hero-description {
  font-size: var(--text-xl);
  color: var(--text-muted);
  max-width: 600px;
}
```

---

## Animation Patterns

### Reveal on Scroll

```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Delay variants */
.reveal.delay-100 { transition-delay: 0.1s; }
.reveal.delay-200 { transition-delay: 0.2s; }
.reveal.delay-300 { transition-delay: 0.3s; }
```

### Hover Effects

```css
.hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.hover-glow {
  transition: box-shadow 0.2s;
}

.hover-glow:hover {
  box-shadow: 0 0 20px var(--indigo-500 / 0.3);
}
```

### Loading States

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-muted) 0%,
    var(--bg-card) 50%,
    var(--bg-muted) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Header Logo Animation (from multi-agent.framework)

The header features an animated SVG logo with hover effects. This pattern is used across the mnehmos ecosystem.

**Logo SVG Structure:**
```html
<svg class="w-8 h-8 header-logo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerCopperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#D4956A"/>
      <stop offset="100%" style="stop-color:#B87333"/>
    </linearGradient>
    <filter id="headerGlow">
      <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Dark background -->
  <rect width="32" height="32" rx="6" fill="#0C0A09"/>
  <!-- Connection lines -->
  <g stroke="#B87333" stroke-width="2" stroke-linecap="round" class="logo-lines">
    <line x1="16" y1="11" x2="10" y2="18"/>
    <line x1="16" y1="11" x2="22" y2="18"/>
    <line x1="11" y1="20" x2="21" y2="20"/>
  </g>
  <!-- Copper nodes with glow -->
  <g filter="url(#headerGlow)" class="logo-nodes">
    <circle cx="16" cy="8" r="3.5" fill="url(#headerCopperGrad)"/>
    <circle cx="8" cy="20" r="3" fill="url(#headerCopperGrad)"/>
    <circle cx="24" cy="20" r="3" fill="url(#headerCopperGrad)"/>
    <circle cx="16" cy="26" r="2.5" fill="#D4956A"/>
  </g>
  <!-- Yellow center pulse point -->
  <circle cx="16" cy="16" r="1.5" fill="#FCD34D" opacity="0.8" class="logo-center"/>
</svg>
```

**Animation CSS:**
```css
/* Header logo animations */
.header-logo .logo-nodes circle {
  transition: all 0.3s ease;
}

/* Hover glow effect on nodes */
.header-logo:hover .logo-nodes circle,
.group:hover .header-logo .logo-nodes circle {
  filter: drop-shadow(0 0 3px var(--copper));
}

/* Connection lines - subtle by default */
.header-logo .logo-lines line {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* Lines pulse on hover */
.header-logo:hover .logo-lines line,
.group:hover .header-logo .logo-lines line {
  opacity: 1;
  animation: line-pulse 1.5s ease-in-out infinite;
}

/* Center node */
.header-logo .logo-center {
  transition: all 0.3s ease;
}

/* Center pulses on hover */
.header-logo:hover .logo-center,
.group:hover .header-logo .logo-center {
  animation: center-pulse 1s ease-in-out infinite;
}

@keyframes line-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes center-pulse {
  0%, 100% { opacity: 0.8; r: 1.5; }
  50% { opacity: 1; r: 2; }
}
```

### Buy Me a Coffee Button Animation

```css
/* BMC button with gradient and hover effects */
.bmc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #1C1917 0%, #292524 100%);
  color: #FAFAF9;
  border: 1px solid #44403C;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.bmc-button:hover {
  background: linear-gradient(135deg, #292524 0%, #3D3834 100%);
  border-color: var(--copper);
  box-shadow: 0 4px 12px rgba(184, 115, 51, 0.3);
  transform: translateY(-1px);
}

/* Coffee steam animation */
.bmc-button .bmc-icon {
  animation: coffee-steam 2s ease-in-out infinite;
}

@keyframes coffee-steam {
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-2px);
    opacity: 0.9;
  }
}
```

---

## Responsive Breakpoints

```css
/* Mobile first */
/* sm: 640px */
@media (min-width: 640px) { ... }

/* md: 768px */
@media (min-width: 768px) { ... }

/* lg: 1024px */
@media (min-width: 1024px) { ... }

/* xl: 1280px */
@media (min-width: 1280px) { ... }

/* 2xl: 1536px */
@media (min-width: 1536px) { ... }
```

---

## Accessibility Requirements

1. **Color Contrast**: All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large)
2. **Focus Indicators**: Visible focus ring on all interactive elements
3. **Skip Links**: Skip-to-content link for keyboard navigation
4. **ARIA Labels**: All icon-only buttons have aria-label
5. **Semantic HTML**: Use proper heading hierarchy, landmarks, etc.
6. **Reduced Motion**: Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Tailwind Configuration

```javascript
// tailwind.config.mjs
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        copper: {
          light: '#D4956A',
          DEFAULT: '#B87333',
          dark: '#8B5A2B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'steam': 'steam 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        steam: {
          '0%, 100%': { opacity: '0.3', transform: 'translateY(0)' },
          '50%': { opacity: '0.6', transform: 'translateY(-3px)' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## Implementation Checklist

When creating new pages/components:

- [ ] Uses semantic tokens (not hardcoded colors)
- [ ] Supports dark mode
- [ ] Has proper focus states
- [ ] Uses consistent spacing scale
- [ ] Has loading/skeleton states where appropriate
- [ ] Follows card/button/badge patterns
- [ ] Has reveal animations
- [ ] Meets accessibility requirements
- [ ] Works on mobile (responsive)
- [ ] Respects reduced motion preference
