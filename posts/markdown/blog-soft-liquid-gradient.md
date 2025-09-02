---
title: Building a Soft Liquid Gradient Background with Three.js
date: 2025-09-02
summary: Pastel liquid background with a tiny shader and accessibility.
tags: design, webgl, threejs, shaders
---

# Building a Soft Liquid Gradient Background with Three.js

A quick write‑up of the liquid, pastel background effect used on this site: how it works, why the palette feels soft, and how to tune it. The goal is a calm, premium aesthetic that supports content without stealing focus.

## Demo

Open `index.html` and you’ll see the animated canvas layer (`#liquid-bg`) sitting behind a light glass UI. The effect blends five pastel tones with gentle motion and subtle texture.

## Design Goals

- Soft palette: pastel whites, creams, blue, lavender, off‑white.
- Gentle motion: slow drift with smoothed metaballs.
- Subtle texture: a hint of grain to avoid banding.
- Accessibility: honors `prefers-reduced-motion` and maintains readable contrast.

## The Palette

Colors are set in a small config, then passed to the shader.

```js
const CONFIG = {
  colors: ['#FFFFFF', '#FEFCFB', '#F0F4FF', '#F3E8FF', '#FEF9F6'],
  speed: 0.08,
  blur: 2.6,
  grain: 0.008,
  dprMax: 2.0
};
```

Tips:

- Replace or reorder swatches to shift the mood (cooler blues, warmer peach, or more neutral grays).
- Keep luminance close across colors for a soft, non‑contrasty blend.

## The Shader

The fragment shader combines:

- Procedural noise (fbm) to warp space.
- Five moving metaballs to generate an organic scalar field.
- A multi‑stop color mix function.

```glsl
uniform vec3 uColors[5];

vec3 multiMix(float t, vec3[5] cols){
  if(t<.25) return mix(cols[0],cols[1],smoothstep(0.,.25,t));
  else if(t<.5) return mix(cols[1],cols[2],smoothstep(.25,.5,t));
  else if(t<.75) return mix(cols[2],cols[3],smoothstep(.5,.75,t));
  else return mix(cols[3],cols[4],smoothstep(.75,1.,t));
}
```

Why this feels soft:

- Using five close‑luma colors avoids harsh edges.
- `blur` applies a small multi‑tap blur in‑shader to smooth transitions.
- Motion speed is low and eased by fbm warping.

## Performance & Quality

- Device pixel ratio is capped for efficiency (`dprMax`).
- Grain is minimal (`grain: 0.008`) to reduce banding without visible noise.
- The canvas clears to white to blend with the UI.

## Accessibility

We respect reduced motion preferences by scaling speed down when requested.

```js
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateSpeed(){
  material.uniforms.uSpeed.value = media.matches ? CONFIG.speed * 0.08 : CONFIG.speed;
}
```

## The Foreground “Glass” Aesthetic

The canvas sits under soft glass cards and a header. Background splashes are also painted with radial CSS gradients for depth.

```css
.backdrop {
  background: radial-gradient(42% 60% at 20% 30%, hsla(218,86%,55%,.18), transparent 55%),
              radial-gradient(40% 55% at 78% 25%, hsla(266,85%,62%,.16), transparent 60%),
              radial-gradient(70% 70% at 50% 90%, hsla(194,86%,54%,.14), transparent 60%);
  filter: blur(40px) saturate(120%);
}
```

## Tuning Cheatsheet

- Colors: swap any value in `CONFIG.colors` for a quick mood change.
- Motion: lower `speed` for calmer drift; raise for more energy.
- Softness: increase `blur` for creamier blends; decrease for texture.
- Texture: tweak `grain` between `0.004`–`0.012` depending on display.

## Drop‑in Usage

If you want to reuse the effect elsewhere:

1) Copy the `<canvas id="liquid-bg">` element and the `<script type="module">` block from the homepage.
2) Keep the CSS for `#liquid-bg` and the `.backdrop` layer for depth.
3) Adjust `CONFIG` to match your brand palette.

