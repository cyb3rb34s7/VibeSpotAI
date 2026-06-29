# VibeSpot Kinetic Noir Prototype Design

## Goal

Create a high-fidelity web prototype that establishes the final VibeSpot product feel before rebuilding the native Expo app. The prototype must feel premium, spatial, smooth, and native-iOS-inspired, not like a review app or dashboard.

## North Star

Use the existing Lovable/Stitch references as art direction, especially the Kinetic Noir palette, cinematic map home, waveform noise screen, place detail page, profile ownership screen, and reward reveal. Rebuild the experience cleanly rather than reusing iframe/static HTML architecture.

## Screens

1. Map Home: dark spatial map, meaningful place chips, floating search, bottom discovery sheet, selected-place preview.
2. Place Detail: image-led place identity, AI vibe intelligence, live signals, social proof, and a strong Drop a Vibe CTA.
3. Story Vibe Check: full-screen one-question-per-step flow with visual controls, starting with a reactive waveform noise selector.
4. Reward Reveal: cinematic Vibe Dropped moment with rank/pioneer/streak feedback.
5. Profile: taste identity, progress, badges, city map ownership, and streak state.

## Interaction Principles

- One dominant job per screen.
- Progressive disclosure over dense visible content.
- Large touch targets, generous spacing, safe bottom areas.
- Motion should clarify state changes and make taps feel tactile.
- Electric lime is reserved for active, live, reward, and primary action states.
- Coral/teal accents are supporting signals, never competing dominant themes.
- Avoid star ratings, generic review language, and crowded feeds.

## Technical Scope

Build a standalone web prototype in `apps/prototype` using Vite, React, TypeScript, Tailwind, Framer Motion, and Lucide icons. Use static product data and CSS-rendered map styling for the first iteration so visual iteration is fast and not blocked by map provider credentials.

## Acceptance Criteria

- Prototype runs locally in browser.
- All five core screens/flows are reachable.
- Vibe check is full-screen and story-like, not a form.
- Noise step has reactive waveform visual feedback.
- Map pins/chips carry place identity and expand into a premium selected card.
- Layout is checked at mobile and desktop-sized browser viewports.
- No obvious overlapping text, cramped bottom nav, broken placeholders, or clipped primary CTAs.
