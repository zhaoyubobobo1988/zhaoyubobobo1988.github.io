# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
使用中文回复我

## What this is

A single self-contained Vue 3 SFC (`SplashScreen.vue`) for the **SKYVEO 低空智能操作系统** product. It is a multi-scene splash/intro screen that plays on app launch and emits a `complete` event when the user exits.

## Component architecture

The component has four sequential scenes controlled by `activeScene` (0–3):

| Scene | Content |
|-------|---------|
| 0 | Boot sequence — typewriter log lines + animated progress checks |
| 1 | Algorithm deep-dive — four domains (`algoDomains[]`), each with pipeline nodes and application scenarios |
| 2 | 3D rotating constellation — `starNodes[]` rendered on a `<canvas>` with `requestAnimationFrame`, mouse-drag to rotate, click to select industry |
| 3 | Brand finale — logo animation + "进入系统" button that emits `complete` |

## Key dependencies (not in this directory)

- `@/components/TechBackground.vue` — animated background layer
- `@/composables/useTypewriter` — returns a reactive string that types out character by character

## 3D star map engine

`project3D(x, y, z, rotY, rotX)` applies two Euler rotations then a simple perspective divide (`d / (d + z)`). Results are stored in `projectedNodes` (reactive ref) and redrawn every frame in `drawStarMap()`. Drag velocity (`velY`, `velX`) decays by 0.92 each frame for inertia.

## CSS

All styles are scoped inside `<style>` at the bottom of the file (~1358 lines total). CSS custom properties (`--accent-primary`, `--accent-success`, etc.) are expected from the parent theme. The component uses `color-mix(in oklab, …)` for glow effects — requires a modern browser.

## Typical edit patterns

- **Add a new industry node**: append to `starNodes[]` and add edges to `connections[]` using index references.
- **Add an algorithm domain**: append to `algoDomains[]`; the tab list and panels render from that array automatically.
- **Change typewriter strings**: edit the `tw[]` array in Scene 0; timing is the second argument to `useTypewriter`.
- **Adjust scene timing**: scene auto-advance is driven by `setTimeout`/`watch` logic in `onMounted`; search for `activeScene.value =` to find all transition points.
