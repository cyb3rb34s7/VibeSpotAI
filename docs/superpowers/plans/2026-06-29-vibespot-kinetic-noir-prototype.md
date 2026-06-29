# VibeSpot Kinetic Noir Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-testable high-fidelity VibeSpot prototype that captures the Kinetic Noir product direction.

**Architecture:** Create a standalone Vite React app in `apps/prototype`. Keep data, components, and screens focused so the prototype can be ported to Expo later.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.

## Global Constraints

- Do not modify the existing Expo app during this prototype pass.
- Use the Lovable/Stitch references as visual direction, not source architecture.
- Prioritize premium spacing, motion, and visual hierarchy over feature completeness.
- Verify in browser with screenshots before claiming completion.

---

### Task 1: Scaffold Prototype App

**Files:**
- Create: `apps/prototype/package.json`
- Create: `apps/prototype/index.html`
- Create: `apps/prototype/src/main.tsx`
- Create: `apps/prototype/src/App.tsx`
- Create: `apps/prototype/src/styles.css`
- Create: `apps/prototype/tsconfig.json`
- Create: `apps/prototype/vite.config.ts`

**Interfaces:**
- Produces: local app served by `npm run dev -- --host 0.0.0.0 --port 39201`.

- [ ] Install Vite React TypeScript dependencies and Tailwind-compatible styling.
- [ ] Render an initial shell with app navigation state.
- [ ] Run `npm run build`.

### Task 2: Build Design System And Data

**Files:**
- Create: `apps/prototype/src/data.ts`
- Create: `apps/prototype/src/components/Frame.tsx`
- Create: `apps/prototype/src/components/BottomNav.tsx`

**Interfaces:**
- Produces: `places`, `profile`, and shared navigation components.

- [ ] Define static place/profile/vibe-check data.
- [ ] Define reusable phone frame, nav, buttons, chips, and surface styles.
- [ ] Verify no placeholder copy appears in the UI.

### Task 3: Build Map Home

**Files:**
- Create: `apps/prototype/src/screens/MapHome.tsx`

**Interfaces:**
- Consumes: `places`, `BottomNav`.
- Produces: `onOpenPlace(placeId)` and `onStartVibeCheck(placeId)` callbacks.

- [ ] Create CSS-rendered dark map background.
- [ ] Create premium place chips with icon, name, category, match.
- [ ] Create bottom discovery sheet and selected Airbnb-style card.
- [ ] Verify mobile layout has no bottom nav collision.

### Task 4: Build Place Detail

**Files:**
- Create: `apps/prototype/src/screens/PlaceDetail.tsx`

**Interfaces:**
- Consumes: selected place and `onStartVibeCheck`.

- [ ] Build image-led place detail with AI summary, signals, social proof.
- [ ] Keep primary CTA visible and not clipped.
- [ ] Verify content hierarchy is readable on mobile.

### Task 5: Build Story Vibe Check

**Files:**
- Create: `apps/prototype/src/screens/VibeCheck.tsx`

**Interfaces:**
- Produces: `onComplete()`.

- [ ] Build full-screen step flow.
- [ ] Implement reactive waveform noise step.
- [ ] Implement crowd, workability, and note steps as immersive choices.
- [ ] Add progress, tap/next navigation, and spring motion.

### Task 6: Build Reward And Profile

**Files:**
- Create: `apps/prototype/src/screens/Reward.tsx`
- Create: `apps/prototype/src/screens/Profile.tsx`

**Interfaces:**
- Reward produces `onViewProfile()` and `onReturnHome()`.

- [ ] Build cinematic reward reveal.
- [ ] Build profile ownership screen with badges, rank, city map.
- [ ] Verify bottom nav and safe area spacing.

### Task 7: Browser QA And Critique

**Files:**
- Create screenshots under `docs/ui-screens/prototype/`.

- [ ] Run local dev server.
- [ ] Inspect with browser automation at mobile and desktop viewports.
- [ ] Capture screenshots of all core screens.
- [ ] Fix overlaps, cramped spacing, weak hierarchy, clipped content, and broken motion.
- [ ] Run `npm run build`.
- [ ] Commit and push final prototype changes.
