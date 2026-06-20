# Vercel-Inspired Design System

Reference: [Vercel DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/vercel/DESIGN.md)

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#000` | Page background |
| `--bg-card` | `#0a0a0a` | Card / surface background |
| `--bg-elevated` | `#111` | Elevated surfaces (dropdowns, modals) |
| `--border` | `rgba(255,255,255,0.08)` | Hairline borders |
| `--text` | `#fafafa` | Primary text |
| `--text-muted` | `#aaa` | Secondary text |
| `--primary` | `#a855f7` | Accent (purple) |
| `--primary-hover` | `#9333ea` | Accent hover |
| `--radius` | `6px` | Default radius |
| `--radius-lg` | `12px` | Large radius (modals, cards) |
| `--radius-pill` | `100px` | Pill / CTA buttons |

## Typography (Display Scale)

| Element | Size | Weight | Letter-Spacing |
|---------|------|--------|----------------|
| Hero h1 | `clamp(2.5rem, 5vw, 4rem)` | 800 | `-0.03em` |
| Section h2 | `clamp(1.5rem, 3vw, 2.5rem)` | 700 | `-0.02em` |
| Card h3 | `1.05rem` | 600 | normal |
| Body | `0.9rem` | 400 | normal |
| Muted | `0.82rem` | 400 | normal |

## Principles
- Flat colors, no gradients
- No glow / box-shadow bleed effects
- Subtle border changes on hover
- Pill-shaped CTA buttons (`border-radius: 100px`)
- Minimal decorative elements
- Smooth but fast transitions (0.2s)
- text-box-trim / text-box-edge on headings
