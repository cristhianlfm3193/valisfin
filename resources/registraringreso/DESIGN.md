---
name: Family Wealth Bento
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#2b6954'
  on-secondary: '#ffffff'
  secondary-container: '#adedd3'
  on-secondary-container: '#306d58'
  tertiary: '#4648d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#6063ee'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: '1.35'
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: '1.45'
    letterSpacing: 0.005em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  financial-display:
    fontFamily: JetBrains Mono
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  financial-body:
    fontFamily: JetBrains Mono
    fontSize: 0.9375rem
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  bento-gap-desktop: 1.5rem
  bento-gap-mobile: 0.875rem
  layout-margin-desktop: 2rem
  layout-margin-mobile: 1rem
---

## Brand & Style

This design system sets the visual standard for an ultra-premium family wealth intelligence platform. It fuses the architectural clarity of modular **Bento Grid** layouts with a pristine **Soft UI** finish. The brand voice balances Swiss-precision institutional banking with the warmth and approachable unity required for collective family financial stewardship.

### Personality & Values
- **Security & Mastery:** Deep forest tones and structured grids convey solvency, protection, and rigorous accounting.
- **Vibrant Growth:** Luminous emerald and mint accents celebrate financial milestones, compound interest, and collective wealth creation.
- **Clarity & Calm:** Crisp white canvas layers against gentle cool slate backgrounds eliminate clutter and financial anxiety.

### Aesthetic Principles
1. **Modular Bento Composition:** Information is chunked into proportional, self-contained interactive surfaces with crisp hierarchy.
2. **Subtle Tactility:** Low-radius diffuse ambient occlusion shadows, hairline borders (0.5px–1px), and soft surface layering create real depth without skeuomorphic weight.
3. **Financial Legibility:** Dedicated tabular numerical styling for assets, currency markers, and balance metrics, ensuring immediate scanning across shared multi-generational accounts.

## Colors

The system is configured in an authoritative, radiant **light mode**. The palette uses emerald and deep forest greens to signal prosperity and institutional safety, accompanied by deliberate semantic signals for debts, liquidity, and aspirational goals.

### Palette Roles & Usage
- **Canvas Base (`#F8FAFC` to `#F1F5F9`):** Subdued, cool slate canvas that lets foreground containers shine cleanly.
- **Surface Elevation (`#FFFFFF`):** High-opacity pure white for all primary bento tiles, cards, and modal sheets.
- **Primary Brand (`#059669` / Emerald, `#10B981` / Mint Accent):** Used for primary conversion points, positive cash flow, growth charts, and interactive toggles.
- **Secondary Anchor (`#064E3B` / Deep Forest):** Used for deep headers, secure state indicators, primary summary pills, and high-emphasis focal nodes.
- **Tertiary Accent (`#6366F1` / Electric Indigo):** Reserved for family milestone trackers, long-term investments, and college/patrimony savings goals.
- **Semantic Accents:**
  - *Debits & Critical Expenses:* `#EF4444` (Coral Red) with `#FEF2F2` tint for badges.
  - *Pending & Attention:* `#F59E0B` (Warm Amber) with `#FFFBEB` background washes.
- **Borders & Dividers:** Crisp hairline borders in `#E2E8F0` or translucent `rgba(226, 232, 240, 0.85)` to define boundaries without visual noise.

## Typography

The type system pairs **Plus Jakarta Sans** for modern, approachable editorial communication with **JetBrains Mono** for numerical values and balance ledgers.

### Hierarchy Guidelines
- **Editorial Voice:** Use tight tracking on Display and Headline variants (`-0.02em` to `-0.03em`) to deliver modern fintech brand poise.
- **Financial Monospace (`financial-*`):** Any metric tracking the balboa currency (`B/.`), interest rates, percentages, and debit/credit columns must strictly use `JetBrains Mono` with tabular lining figures enabled (`font-feature-settings: 'tnum' on, 'lnum' on`).
- **Data Labels:** Micro-badges, transaction timestamps, and category tags utilize `label-sm` in all-caps or medium weights to anchor dense data lists.

## Layout & Spacing

The layout is built around a **12-column adaptive Bento Grid** structure that shifts from modular horizontal spreads on wide viewports into vertical multi-card sequences on mobile.

### Grid Anatomy & Breakpoints
- **Desktop (≥1024px):** Fixed left navigation rail (260px) paired with a 12-column responsive fluid grid. Bento boxes conform to 3-col, 4-col, 6-col, 8-col, or 12-col spans with a standardized `1.5rem` gutter.
- **Tablet (768px - 1023px):** 6-column grid with collapsed icon-only navigation rail (72px). Bento boxes reflow into 3-col or 6-col segments.
- **Mobile (≤767px):** Single-column stacked stream with a bottom safe-area floating dock navigation. Bento tiles span full width with `0.875rem` vertical spacing.

### Bento Rhythms
- Bento boxes internal padding scales between `1.5rem` (standard metric tiles) and `2rem` (hero portfolio analytics).
- Related transactional clusters use inner sub-grids of `space-xs` and `space-sm` to maintain proximity cohesion.

## Elevation & Depth

This system implements **Soft UI Luminescence**: high-diffuse, low-contrast shadows combined with razor-thin structural borders. Instead of heavy dark drop-shadows, elevation is suggested through layered lighting.

### Surface Tiers
1. **Level 0 (Canvas):** Tone `#F8FAFC`, zero shadow, completely flat backdrop.
2. **Level 1 (Bento Tile Default):** Solid `#FFFFFF` background with border `1px solid rgba(226, 232, 240, 0.8)` and micro-ambient shadow: `0px 1px 3px rgba(15, 23, 42, 0.03), 0px 6px 16px -4px rgba(15, 23, 42, 0.04)`.
3. **Level 2 (Hover / Active Bento Tile):** Border shifts to `#CBD5E1` with elevated depth: `0px 8px 24px -6px rgba(5, 150, 105, 0.08), 0px 2px 6px rgba(15, 23, 42, 0.04)`.
4. **Level 3 (Modals, Overlays & Floating Navigation):** High-frosted background blur (`backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.85);`), border `1px solid rgba(255, 255, 255, 0.6)`, and ambient spread: `0px 20px 40px -12px rgba(15, 23, 42, 0.12)`.

## Shapes

The geometric identity relies on friendly yet structured curvature. Standard elements leverage `rounded-lg` (16px), while outer Bento boxes and dialog shells expand to `rounded-2xl` (24px) or `rounded-3xl` (32px) to reinforce the premium, ergonomic feel.

### Shape Application Guidelines
- **Bento Containers:** `rounded-2xl` (24px) for compact tiles; `rounded-3xl` (32px) for hero balance panels and main portfolio modules.
- **Buttons & Input Elements:** Rounded pill-style (`rounded-full`) for high-action filters, status badges, and primary action buttons. Form inputs adhere to `rounded-xl` (12px).
- **Progress Trackers & Metric Gauges:** Fully rounded caps with inner capsule tracks (`rounded-full`).

## Components

### Buttons
- **Primary:** Background in `#059669` gradient to `#047857`, text `#FFFFFF`, subtle inner highlight (`box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.2)`). Height: 44px (desktop), 48px (mobile). Rounded full.
- **Secondary / Ghost:** Translucent slate wash `#F1F5F9` on hover, border `1px solid #E2E8F0`, text `#0F172A`.

### Status Pills & Family Member Chips
- Compact pills (28px height) using 10% opacity tints of the respective semantic color (e.g., `#ECFDF5` background with `#059669` text for positive cash flow; `#FEF2F2` background with `#EF4444` for recurring debit).
- Family member selector chips display rounded avatar initials alongside personalized color dot indicators.

### Bento Cards
- Always rendered on `#FFFFFF` base surfaces with standard padding (`1.5rem`).
- Header includes a categorical label (`label-sm`), tile title (`headline-sm`), and top-right actionable icon or badge.
- Footers feature high-contrast mono values (`financial-body`) with trend deltas (+% / -%).

### Form Inputs & Selectors
- Background `#FFFFFF` surrounded by a `1px solid #E2E8F0` hairline boundary.
- Focused state features a crisp emerald ring: `box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18); border-color: #059669`.
- Integrated currency prefix (`B/.`) styled with monospaced subdued slate text.

### Segmented Controls & Interactive Tabs
- Contained within a pill-shaped `#F1F5F9` track. Active tab moves with a spring-like micro-transition, colored in `#FFFFFF` with Level 1 micro-shadow.

### Navigation Systems
- **Desktop Sidebar:** Semi-transparent border on right; clean, stacked nav items featuring emerald indicator bars on active selections.
- **Mobile Bottom Navigation:** Floating pill container pinned 16px above screen bottom with `backdrop-filter: blur(20px)`, holding 4-5 core family financial hubs (Resumen, Gastos, Metas, Familia).