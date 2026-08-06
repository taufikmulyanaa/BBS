---
name: Guyub Gowes
colors:
  surface: '#1a120a'
  surface-dim: '#1a120a'
  surface-bright: '#42372d'
  surface-container-lowest: '#140d06'
  surface-container-low: '#231a11'
  surface-container: '#271e15'
  surface-container-high: '#32281f'
  surface-container-highest: '#3d3329'
  on-surface: '#f1dfd1'
  on-surface-variant: '#dbc2ad'
  inverse-surface: '#f1dfd1'
  inverse-on-surface: '#392e25'
  outline: '#a38d7a'
  outline-variant: '#554434'
  surface-tint: '#ffb86f'
  primary: '#ffc082'
  on-primary: '#4a2800'
  primary-container: '#ff9900'
  on-primary-container: '#653a00'
  inverse-primary: '#8a5100'
  secondary: '#4ae183'
  on-secondary: '#003919'
  secondary-container: '#06bb63'
  on-secondary-container: '#00431f'
  tertiary: '#8ed5ff'
  on-tertiary: '#00344a'
  tertiary-container: '#04beff'
  on-tertiary-container: '#004965'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcbd'
  primary-fixed-dim: '#ffb86f'
  on-primary-fixed: '#2c1600'
  on-primary-fixed-variant: '#693c00'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7cd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#1a120a'
  on-background: '#f1dfd1'
  surface-variant: '#3d3329'
  cycling-orange: '#FF9900'
  action-yellow: '#FFD700'
  night-ride: '#121212'
  asphalt-gray: '#2A2A2A'
  easy-green: '#2ECC71'
  medium-yellow: '#F1C40F'
  hard-red: '#E74C3C'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-number:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

The design system is built on the philosophy of **"Gowes Bareng, Guyub Rukun, Sehat & Bahagia."** It targets a mature demographic of Indonesian cyclists who value community, reliability, and the joy of the open road. 

The aesthetic is **Corporate Modern with a "Premium Dark" lean**, combining the structured reliability of high-end cycling gear with the warmth of communal activity. It uses deep, high-contrast backgrounds to make energetic brand colors and scenic imagery pop, ensuring high legibility for users who may be viewing the app in bright outdoor conditions.

Visual principles:
- **Active & Energetic:** Using high-chroma accents to signify movement and action.
- **Communal (Guyub):** Softened corners and friendly typography to foster a sense of belonging.
- **Reliable (Rukun):** A disciplined grid and clear information hierarchy that feels as precise as a well-tuned derailleur.

## Colors

The palette is anchored by **Cycling Orange**, a high-visibility hue that evokes energy and safety gear. This is contrasted against a **Night Ride** dark mode default, which provides a premium, modern feel and reduces eye strain during early morning or late-evening ride planning.

- **Primary (Cycling Orange):** Used for primary actions, progress indicators, and key brand moments.
- **Secondary (Success Green):** Used for "Join" actions and positive status indicators.
- **Neutral (Asphalt & Night):** A range of grays inspired by road surfaces provides depth and separates content tiers without the harshness of pure black.
- **Status Colors:** Specific tints for route difficulty (Easy, Medium, Hard) to provide instant cognitive recognition in the directory.

## Typography

The typography system balances the friendly, modern character of **Plus Jakarta Sans** for headings with the utilitarian clarity of **Inter** for long-form content.

- **Headlines:** Set in Plus Jakarta Sans with tighter letter-spacing for a bold, impactful look.
- **Body Text:** Set in Inter to maximize legibility for route descriptions and forum discussions.
- **Data & Labels:** **JetBrains Mono** is introduced sparingly for technical data points like elevation, distance, and time (GPX data), giving the app a precise, "instrument-cluster" feel that resonates with cycling enthusiasts.

## Layout & Spacing

This design system utilizes a **12-column fluid grid** for web/desktop and a **4-column fluid grid** for mobile. 

The rhythm is based on an **8px linear scale**, ensuring consistent alignment across all components. 
- **Margins:** 20px on mobile to ensure content doesn't feel cramped against screen edges.
- **Density:** High information density is permitted for route listings and "Open Ride" details to allow experienced users to scan data (distance, elevation, pace) quickly.
- **Reflow:** On tablet/desktop, mobile "list items" should reflow into a multi-column card grid to utilize horizontal space.

## Elevation & Depth

To maintain the premium dark aesthetic, depth is communicated through **Tonal Layering** rather than heavy shadows.

- **Base Layer (L0):** Night Ride (#121212) for the main background.
- **Surface Layer (L1):** Asphalt Gray (#2A2A2A) for cards and persistent navigation elements.
- **Interaction Layer (L2):** Slightly lighter grays or subtle 1px inner borders to indicate interactivity.
- **Accents:** Use 15% opacity primary color overlays on surfaces to indicate "Active" states or selected tabs.
- **Glassmorphism:** Reserved exclusively for the bottom navigation bar and top app headers to maintain context of the underlying map or list content while scrolling.

## Shapes

The shape language is **Rounded (Level 2)** to emphasize the "Guyub" (communal/friendly) nature of the community. 

- **Cards & Containers:** 1rem (16px) corner radius creates a soft, modern container for rugged cycling content.
- **Buttons:** Fully pill-shaped (rounded-full) for primary actions to distinguish them clearly from informational cards.
- **Media:** Photography of scenic routes should use the standard 1rem radius, but may use a sharp bottom edge when paired with text content below in a unified card.

## Components

### Buttons
- **Primary:** High-visibility Cycling Orange background with black text. Pill-shaped.
- **Secondary/Join:** Success Green background for "Join Ride" buttons to provide a distinct psychological "Go" signal.
- **Ghost/Outline:** Used for secondary actions like "Share" or "Save," with a 1px border in a mid-tone gray.

### Cards (The "Ride" Card)
- **Structure:** Image at top (40% height), followed by a "Data Strip" (JetBrains Mono text for KM/Elev), and Title.
- **Hierarchy:** Route title should be the most prominent, followed by the "Difficulty Chip."

### Chips & Badges
- **Difficulty Badges:** Small, high-contrast labels with background colors mapped to Easy (Green), Medium (Yellow), and Hard (Red).
- **Category Chips:** Low-contrast Asphalt Gray backgrounds with white text for tags like [Kopi], [Tanjakan], [Pemandangan].

### Input Fields
- **Search:** Subtle Asphalt Gray background with a left-aligned icon.
- **Form Fields:** Clear labels using `body-sm` bold, with a focus state that adds a 1px Cycling Orange border.

### Lists (Forum & Open Ride)
- **Separators:** Use 1px wide "Asphalt" lines to divide posts. 
- **Avatars:** Always circular to reinforce the human/community aspect of the app.