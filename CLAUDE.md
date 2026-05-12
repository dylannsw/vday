# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page Valentine's Day proposal app built with React, Vite, Tailwind CSS, Framer Motion, and canvas-confetti. Deployed to GitHub Pages at `https://dylannsw.github.io/vday/`.

## Commands

```bash
npm install      # install dependencies
npm run dev      # start dev server (http://localhost:5173/vday/)
npm run build    # production build → ./dist/
```

There are no test or lint scripts configured.

## Architecture

The entire application is a single React component in `src/App.jsx` with no routing. Page switching is purely state-driven via the `accepted` boolean:

- **`accepted === false`** → Home page: Valentine's proposal with Yes/No buttons
- **`accepted === true`** → Yes page: animated acceptance screen with typing effect, emoji rain, sparkle particles, and a Google Calendar link

### Key State & Behaviors

**No-button escalation** (`noClicks` 0–6+):
- Clicks 1–3: button teleports to a random position (`moveNoButton`)
- Clicks 4–5: "panic" mode — tighter dodge threshold, faster cooldown, continuous micro-shake animation
- Click 6+: `yesFullScreen = true`, Yes button expands to fill the screen via Framer Motion scale, No button disappears

**No-button modes** (`noMode`): `"move"` | `"shake"` | `"dodge"` — randomly picked on each click. Dodge mode uses `onMouseMove` + proximity detection to flee the cursor. The button becomes `position: absolute` once freed (`noFreed`).

**Yes-button scale**: grows by `1.6^noClicks` using Framer Motion `animate={{ scale }}`.

**Emoji rain**: Spawns emoji drops at intervals, capped at 160 simultaneous drops. Uses inline `<style>` with a CSS custom property `--drift` for horizontal drift — Tailwind can't express this keyframe so it's done inline.

**Cursor-tracking eyes** on the No button: `pupilOffset()` calculates angle from eye center to cursor and moves the pupil within a clamped radius.

**Word-by-word typing** on the Yes page: `setInterval` advancing word index into `typedYesMessage`.

### Asset Paths

Static assets in `public/` must be referenced using `import.meta.env.BASE_URL` because Vite is configured with `base: '/vday/'`. Example: `` `${import.meta.env.BASE_URL}Frame183.png` ``.

### Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm install && npm run build` and deploys `./dist` to GitHub Pages. The `base: '/vday/'` in `vite.config.js` is required for all asset paths to resolve correctly on GitHub Pages — do not change it.

### Styling Conventions

- Tailwind utility classes for all standard styling
- Inline `<style>` blocks with `@keyframes` for animations that require CSS custom properties (`emojiFall`, `blink`, `sparkle`) — these cannot be expressed in Tailwind
- Framer Motion `animate`/`transition` props for interactive motion (button scale, position, shake)
