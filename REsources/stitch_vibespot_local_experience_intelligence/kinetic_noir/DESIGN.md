---
name: Kinetic Noir
colors:
  surface: '#12131a'
  surface-dim: '#12131a'
  surface-bright: '#383940'
  surface-container-lowest: '#0d0e15'
  surface-container-low: '#1a1b22'
  surface-container: '#1e1f26'
  surface-container-high: '#292931'
  surface-container-highest: '#33343c'
  on-surface: '#e3e1eb'
  on-surface-variant: '#c4c9b1'
  inverse-surface: '#e3e1eb'
  inverse-on-surface: '#2f3038'
  outline: '#8e937d'
  outline-variant: '#444936'
  surface-tint: '#aad53d'
  primary: '#ffffff'
  on-primary: '#263500'
  primary-container: '#c5f258'
  on-primary-container: '#526d00'
  inverse-primary: '#4d6700'
  secondary: '#ffb59d'
  on-secondary: '#5d1900'
  secondary-container: '#b83900'
  on-secondary-container: '#ffddd2'
  tertiary: '#ffffff'
  on-tertiary: '#303032'
  tertiary-container: '#e4e2e4'
  on-tertiary-container: '#656466'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c5f258'
  primary-fixed-dim: '#aad53d'
  on-primary-fixed: '#151f00'
  on-primary-fixed-variant: '#394d00'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59d'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#832600'
  tertiary-fixed: '#e4e2e4'
  tertiary-fixed-dim: '#c8c6c8'
  on-tertiary-fixed: '#1b1b1d'
  on-tertiary-fixed-variant: '#474649'
  background: '#12131a'
  on-background: '#e3e1eb'
  surface-variant: '#33343c'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 20px
---

## Brand & Style
The design system is built on a "Cinematic Spatial" ideology, prioritizing depth, motion, and premium tactility. It targets urban explorers who value curation over crowdsourced ratings. The aesthetic is inspired by high-end automotive interfaces and premium fintech—dark, immersive, and intentional.

The style leverages **Glassmorphism** and **Tonal Layering** to create a sense of physical space within the digital screen. By utilizing deep blacks and warm neutrals, the interface recedes to let vibrant photography and the electric lime accent pop. Movement is not an afterthought; it is the primary navigator. Transitions use high-frequency spring physics to make the UI feel responsive and "alive."

## Colors
The palette is rooted in a warm, near-black foundation to reduce eye strain and provide a high-contrast stage for the primary accent. 

- **Primary (#C8F55A):** A high-energy "Electric Lime" used exclusively for calls to action, active states, and critical discovery paths.
- **Secondary (#FF6B35):** "Warm Coral" reserved for alerts, live status indicators, and badges.
- **Surfaces:** Depth is achieved through incremental lightness. Surface 1 (#1A1A1C) is for the base card layer, while Surface 2 (#242428) is for elements floating above the main content, such as modals or active input states.
- **Typography:** Text uses a warm white (#F0EFE8) to maintain the premium, soft-noir feel without the harshness of pure white.

## Typography
This design system utilizes **Hanken Grotesk** to replicate the clean, geometric, and high-end feel of Satoshi. The type hierarchy is designed for "glanceability."

Headlines use tighter letter-spacing and bold weights to command attention against the dark background. Body text maintains a generous line height for readability in low-light environments. Labels and small metadata use medium to semi-bold weights with slight tracking (letter-spacing) to ensure legibility when rendered in the secondary text color (#7C7C85).

## Layout & Spacing
The layout follows a **fluid grid** logic with a focus on edge-to-edge containers for a cinematic feel. 

- **Mobile:** Uses a 4-column system with 20px side margins and 16px gutters.
- **Spatial Rhythm:** Vertical spacing follows an 8px incremental scale. Cards and sections are separated by `lg` (24px) or `xl` (32px) units to provide breathing room and emphasize the "spatial" nature of the design.
- **Safe Areas:** Bottom sheets and floating action buttons (FABs) must respect a 32px bottom margin to account for gesture-based OS navigation and visual weight.

## Elevation & Depth
Depth is the cornerstone of this system. Rather than standard shadows, we use **Tonal Layers** combined with **Backdrop Blurs**.

- **Level 0 (Background):** #0F0F10. The foundation.
- **Level 1 (Cards/Lists):** #1A1A1C. These elements appear to sit just above the background. Use a subtle 1px inner stroke of #FFFFFF at 5% opacity to define edges.
- **Level 2 (Modals/Overlays):** #242428. Highly elevated. These use a 40px backdrop blur when positioned over images or map tiles.
- **Shadows:** Use large, ultra-soft "Ambient" shadows. Instead of black, use a tinted shadow (#000000 at 40% alpha) with a 24px blur and 8px Y-offset for Level 2 elements.

## Shapes
The shape language is varied to create a hierarchy of containment. 

- **Cards:** 16px (`rounded-lg`) corner radius for standard content containers.
- **Bottom Sheets:** 24px (`rounded-xl`) on top corners to signify a "pull-up" interaction.
- **Interactive Elements:** 999px (Pill-shaped) for buttons, chips, and tags to differentiate them from static content containers.
- **Map Pins:** Custom teardrop shapes with a 4px inner radius for the "point" and a circular top.

## Components
- **Buttons:** Primary buttons are pill-shaped, filled with #C8F55A, using black text for maximum contrast. Secondary buttons are outlined with a 1.5px stroke of #7C7C85.
- **Discovery Cards:** These must feature high-quality imagery with a subtle bottom-to-top dark gradient overlay to ensure text legibility. No star ratings; use a "Match %" or "Vibe Tag" (e.g., "Quiet," "Industrial") in a pill-shaped badge.
- **Chips/Filters:** Pill-shaped. Unselected: Surface 2 background. Selected: Primary Accent background with black text.
- **Input Fields:** Minimalist. Underline style or subtle #1A1A1C fill. Focus state triggers a 1px #C8F55A border.
- **Map Interface:** Tiles must be "Night Mode" (desaturated dark greys). Pins use the Primary Accent color with a spring-up animation on hover/tap.
- **Micro-interactions:** Every tap should trigger a subtle haptic feedback and a 0.98x scale-down "press" effect using a spring curve (stiffness: 300, damping: 20).