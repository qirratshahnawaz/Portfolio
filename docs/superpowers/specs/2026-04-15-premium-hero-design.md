# Design Specification: Premium "Ethereal Split" Hero Section

**Date**: 2026-04-15
**Status**: Draft
**Role**: Senior UI/UX Engineer

## Goal
Transform the existing Hero Section into a more "attractive," "premium," and "engaging" experience while maintaining the separate **Sakura** (Pink) and **Momiji** (Yellow) modes and respecting the existing **Leaf Trail** cursor animation.

## User Context & Constraints
*   **Preserve Split Layout**: Maintain the 1.2fr / 0.8fr grid to accommodate the Profile Image from Sanity.
*   **Less Rounded Borders**: Avoid overly rounded shapes; stick to subtle, modern rounding (e.g., `rounded-xl` or `rounded-lg`) for cards and buttons.
*   **Mode Compatibility**: Ensure all enhancements work seamlessly across both Sakura and Momiji themes.
*   **Leaf Trail Harmony**: Ensure background animations and card intensity do not clash with the falling sakura/momiji leaves.
*   **Responsive**: Must work seamlessly across mobile, tablet, and desktop breakpoints.

## Design Details

### 1. Typography & Content (Left Column)
*   **Name & Headline**: Bold, staggered reveal animations using Framer Motion.
*   **Bento-Lite Information**: Details like *Email*, *Location*, and *Availability* will be encapsulated in small, sleek, translucent "Bento" cards with modern, subtle rounding.
*   **Call to Action**: Social links will be presented as magnetic glass buttons with mode-specific borders and `rounded-xl` corners.

### 2. Profile Image & Background (Right Column)
*   **Dynamic Glow Aura**: Behind the transparent PNG profile image, a radial glow aura will pulse gently.
    *   **Sakura**: `rgba(245, 175, 175, 0.2)` glow with subtle pink bokeh.
    *   **Momiji**: `rgba(255, 242, 204, 0.2)` glow using exact Buttery Yellow (#fff2cc).
*   **3D Influence**: The image container will feature a subtle 3D tilt effect on mouse hover.

### 3. Background & Effects
*   **Theme Integration**: Background paths and ambient auras will shift colors based on the `data-mode` (Sakura vs Momiji).
*   **Clarity**: The background will remain dark and deep to provide maximum contrast for the cursor's leaf trail.

## Technical Approach
*   **Framework**: Next.js 16 (App Router).
*   **Styling**: Tailwind CSS (using CSS variables from `globals.css`).
*   **Animation**: Framer Motion for text reveals, magnetic effects, and background glows.
*   **Data**: Fetches content from Sanity CMS via existing `HERO_QUERY`.

## Verification Plan
1.  **Visual Test**: Verify both Sakura and Momiji modes for color accuracy and "wow" factor.
2.  **Interaction Test**: Test "magnetic" pull on social buttons and 3D tilt on the profile image.
3.  **Conflict Test**: Ensure the Leaf Trail (falling leaves) is clearly visible and performance stays smooth.
4.  **Responsive Test**: Check layout at 375px (mobile) and 1280px+ (desktop).
