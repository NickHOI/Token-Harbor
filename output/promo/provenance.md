# Promo Asset Provenance

## Final Production Route

The final campaign assets were composed deterministically from existing Token Harbor artwork. This keeps the brand name, English copy, dimensions, and feature claims exact.

- Export format: PNG
- Export size: 1080 x 1080
- Locale: `en`
- Final assets: 4
- Source artwork: existing harbor, voyage, pirate-raider, and fish PNG assets under `game/public/assets`
- Brand icon: the current Guia lighthouse pixel asset at `assets/guia-lighthouse-pixel.png`
- Composition script: retained locally and excluded from the public repository

## ImageGen Attempt

The built-in ImageGen route was attempted for four new text-free visual directions. Each direction was attempted twice, but all requests failed before producing an image because of a backend network error. No ImageGen output was used in the final exports.

The CLI fallback was not used because it requires explicit user approval and a locally configured `OPENAI_API_KEY`.

## Prompt Set

### 01 Brand Hero

Create a text-free square Token Harbor brand hero in the recognizable isometric handcrafted maritime game style: bright dawn over the central harbor, small fishing fleet leaving in several directions, lighthouse, sparkling sea, and a restrained stream of golden light motes implying Codex activity becoming Sail Power. Keep clean upper-left copy space. No text, letters, numbers, logos, watermark, UI, people, futuristic neon, or unsupported claims.

### 02 Voyage Action

Create a text-free square Token Harbor gameplay image in the recognizable isometric handcrafted maritime game style: a fishing skiff cutting across a vivid cobalt sea, a net lifting a small glinting catch with one colorful fish visible, islands at the horizon, dynamic wake, afternoon sun, and clean upper-left copy space. No text, letters, numbers, logos, watermark, UI, people, or unsupported claims.

### 03 Pirate Encounter

Create a text-free square Token Harbor action image faithful to its isometric handcrafted maritime game style: a small sturdy fishing vessel fires a bright cannon shot across stormy teal water toward a black-hulled pirate raider with worn dark-red sails, while a lighthouse beam cuts through the rain. Keep it family-friendly and leave upper-left copy space. No sinking ships, gore, text, letters, numbers, logos, watermark, or UI.

### 04 Harbor Growth

Create one continuous square Token Harbor progression scene in its isometric handcrafted pixel-diorama style: a modest sunny fishing dock in the lower left connects by a curved sea route and increasingly capable vessels to a larger, warmly lit harbor and lighthouse in the upper right; a subtle ghost ray shimmers below the water. Keep upper-left copy space. No collage, split panel, infographic, UI, text, letters, numbers, logos, watermark, people, pirate motifs, futuristic neon, or unsupported claims.
