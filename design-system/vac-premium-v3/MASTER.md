# VAC Premium V3 — Design System

This file is the public-site visual source of truth for Visual Archive Club.

## Product direction

VAC is both a university organization and a creative-media portfolio. The interface
therefore combines the credibility of an institutional site with the visual standard
of a premium photography/film studio.

The direction is informed by UI UX Pro Max's verified guidance for Photography Studio,
Creative Agency, editorial media and university/research experiences:

- storytelling-driven + hero-centric structure
- motion-driven minimalism / Swiss-style alignment
- editorial hierarchy and strong portfolio imagery
- black/white foundation with one restrained brand accent
- high-quality full-bleed visual work; never low-resolution filler
- motion must communicate depth without slowing navigation

## Visual tokens

- Background: #080808
- Elevated: #10100f
- Surface: rgba(255,255,255,.045)
- Foreground: #f4f0e8
- Muted: #9b978f
- VAC Orange: #ff6a00
- Champagne: #d6b37e
- Border: rgba(255,255,255,.10)
- Radius: 18–28px on editorial media; pills only for compact controls

## Typography

- Body/UI: Manrope
- Editorial display/italics: Playfair Display
- Large headings use tight tracking and restrained line length.
- Body copy never drops below 14px on public pages.
- Labels may be 10–12px only when nonessential and high-contrast.

## Layout

- Max content width: 1280px
- Mobile-first reflow at 900px and 640px
- Hero uses a two-column editorial composition, collapsing to one column.
- Committee cards remain uniform except the President feature.
- Coordinator and advisors keep official order but receive no oversized treatment.
- Images preserve aspect ratio and never use fake black backgrounds around transparent logos.

## Motion

- Only opacity + transform for entrance/parallax interactions.
- Pointer parallax is requestAnimationFrame throttled.
- No width/height animation and no continuously expensive filters.
- All motion is disabled/reduced for prefers-reduced-motion.
- Reveal delays are short (0–210ms) and content stays usable without JavaScript.

## Accessibility / interaction

- Visible focus states.
- Minimum 44px touch targets for primary controls.
- Text contrast target >= 4.5:1.
- Dialogs close with Escape and keep semantic labels.
- Contact details use native tel: and mailto: links.
- No information depends on color alone.

## Image standard

Public showcase images must be crisp, cinematic and relevant to photography,
videography or post-production. The website may use properly licensed remote media;
VAC event/gallery media uploaded by Admin always takes priority over decorative imagery.

## Performance

- Public Supabase queries remain cached.
- Public navigation does not run authentication middleware.
- Decorative images lazy-load except the hero visual.
- Avoid heavy WebGL for core navigation; 3D depth is GPU-friendly CSS transform/perspective.
