---
name: Amber Peak
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#39393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1b1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#d7c3af'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#a08e7b'
  outline-variant: '#524435'
  surface-tint: '#ffb960'
  primary: '#ffba62'
  on-primary: '#472a00'
  primary-container: '#ea9b28'
  on-primary-container: '#5c3800'
  inverse-primary: '#855300'
  secondary: '#f0bf65'
  on-secondary: '#422d00'
  secondary-container: '#7c5800'
  on-secondary-container: '#ffd283'
  tertiary: '#cdc7b8'
  on-tertiary: '#333026'
  tertiary-container: '#b1ac9e'
  on-tertiary-container: '#434035'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb960'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#f0bf65'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#e8e2d3'
  tertiary-fixed-dim: '#ccc6b7'
  on-tertiary-fixed: '#1e1c12'
  on-tertiary-fixed-variant: '#4a473c'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
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
  base: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1280px
---

## Brand & Style
The design system embodies a "Dark Premium" aesthetic tailored for a high-performance cycling community. The visual direction is masculine, modern, and rugged, utilizing a high-contrast palette that mimics the transition from asphalt to the golden hour.

The style leverages **Minimalism** with a touch of **Tactile** depth. It prioritizes expansive negative space, precise alignment, and subtle environmental lighting effects to create an interface that feels like high-end cycling gear—durable, functional, and prestigious.

## Colors
The color strategy is built on a "Deep Midnight" foundation with "Golden Amber" highlights. 

- **Primary & Secondary:** Used for high-action items, progress indicators, and performance metrics.
- **Surface Strategy:** The deep black background (#141415) provides maximum contrast for legibility during outdoor use. Surface layers (#232322) differentiate content cards and modular sections.
- **Accents:** Use the secondary light amber (#F7C56A) sparingly for interactive hover states or to highlight peak achievements.
- **Status:** Semantic colors (Success, Danger, Info) are desaturated to maintain the premium feel while remaining functional.

## Typography
The system utilizes **Plus Jakarta Sans** across all levels to maintain a contemporary and athletic feel. 

- **Headlines:** Use Bold (700) or ExtraBold (800) weights with tight letter-spacing to evoke strength.
- **Body:** Regular (400) weight ensures high legibility against dark backgrounds.
- **Labels:** Small labels use semi-bold weights and uppercase styling for technical data points (e.g., "AVG SPEED," "ELEVATION").
- **Scale:** Maintain a clear hierarchy where data-heavy stats are prioritized over descriptive text.

## Layout & Spacing
The layout follows a **Fluid Grid** system based on an 8px square rhythm.

- **Desktop:** 12-column grid with 24px gutters. Use wide margins to maintain the premium, focused feel.
- **Mobile:** 4-column grid with 16px gutters and margins.
- **Consistency:** All component padding and margins should be multiples of 8px. Use larger gaps (32px+) between distinct content sections to reinforce the minimalist aesthetic.

## Elevation & Depth
In this dark theme, depth is communicated through **Tonal Layering** rather than traditional shadows.

- **Level 0 (Base):** Deep Black (#141415) for the main background.
- **Level 1 (Card):** Surface Gray (#232322) for content containers.
- **Level 2 (Interaction):** Surface Alt (#464338) for raised elements or active states.
- **Overlays:** Use a subtle 1px "Outline" (#68645D) at 50% opacity to define card boundaries, ensuring they don't get lost in the dark environment.
- **Glow:** Only the Primary Amber may use a soft, low-spread outer glow (8px blur, 20% opacity) for "active" indicators like a live cycling route.

## Shapes
A consistent 8px (0.5rem) corner radius is applied to all primary containers, buttons, and input fields.

- **Buttons:** 8px radius for a solid, structural appearance. 
- **Icons:** Use a "Linear" or "Duotone" style with a 2px stroke weight to match the technicality of cycling components.
- **Media:** Photography of bikes or landscapes should also maintain the 8px radius or remain sharp-edged if full-bleed.

## Components
- **Buttons:** Primary buttons use the Amber fill (#EA9B28) with Black text. Secondary buttons use an outline (#68645D) with Amber text.
- **Cards:** Surface color (#232322) with a 1px border (#68645D). Content inside cards should follow the 16px internal padding rule.
- **Inputs:** Dark backgrounds (#141415) with a bottom-border or full-border in the Outline color. Focus state shifts the border to Primary Amber.
- **Chips/Badges:** Use "Surface Alt" (#464338) backgrounds for categorization, with Text Secondary (#B9BEC3) for high readability.
- **Data Visuals:** Line charts for heart rate or power should use the Primary Amber. Secondary metrics (Cadence) use Primary Light (#F7C56A).
- **Navigation:** Bottom navigation (mobile) or Top Bar (desktop) should use a slight blur (Glassmorphism) over the Surface color to keep the focus on the content.