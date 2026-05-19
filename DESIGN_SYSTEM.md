# Nothing But Net - Core Design Identity

This document outlines the foundational design principles and core visual elements for the "Nothing But Net" mobile ecosystem. It is intended as a high-level guide for the UI team to ensure consistency while allowing flexibility in implementation.

## 1. Design Vision: "Liquid Glass & Ember"
The brand identity is built on the contrast between **transparency** and **heat**.
- **The "Glass" (Structure)**: Semi-transparent, high-blur surfaces that create a sense of depth and modernism.
- **The "Ember" (Action)**: Vibrant basketball-inspired oranges and corals used to guide the user's eye and highlight interactive elements.
- **Atmosphere**: Always dark-mode first. Use deep, desaturated backgrounds to let the glass and accent colors pop.

---

## 2. Core Color Palette

| Role | Preferred Tone | Notes |
| :--- | :--- | :--- |
| **Primary Accent** | `#d64b17` (Ember Orange) | For main actions, active states, and primary branding. |
| **Secondary Accent**| `#ff4800` (Vibrant Coral) | For highlights and gradients. |
| **Background** | `#121212` (Deep Charcoal) | Never pure black (#000) to maintain visual depth. |
| **Text (High)** | `#ffffff` (White) | Maximum contrast for readability. |
| **Text (Low)** | `#b0b0b0` (Silver/Grey) | For secondary info and labels. |
| **Surface Tint** | `rgba(30, 30, 47, X)` | A navy/charcoal tint for glass surfaces. |

---

## 3. Typography Hierarchy

- **Headings (Display)**: A modern, high-impact sans-serif (e.g., *Cal Sans* or *Inter Bold*). 
  - **Philosophy**: Bold, authoritative, and energetic.
- **Body Content**: A clean, highly legible sans-serif (e.g., *Inter*, *Roboto*, or *System Sans*).
  - **Philosophy**: Optimal readability on mobile screens, emphasizing line height and spacing.

---

## 4. The Glassmorphism System

Rather than rigid CSS recipes, follow these three principles for all UI containers:
1. **Gaussian Blur**: Use high blur (16px+) to simulate heavy glass.
2. **Volumetric Borders**: Borders should feel like a light reflection. Use thin (1px) semi-transparent lines, often with a subtle gradient (light at the top, dark at the bottom).
3. **Layered Shadows**: Use soft, multi-layered shadows to give containers a sense of "floating" above the background.

---

## 5. Component Principles

### Interactive Elements (Buttons & Links)
- **Rounded Corners**: Use soft radiuses (12px to 24px) to feel modern and tactile.
- **Feedback**: Every interaction must provide visual feedback (scale changes, brightness shifts, or subtle haptic-style transitions).
- **Touch Targets**: Ensure a minimum target area of 44x44px for all mobile interactions.

### Inputs & Form Fields
- **Consistency**: Backgrounds should be slightly lighter than the page background to indicate interactivity.
- **Active State**: Use the "Ember" accent for focus states to provide clear user guidance.

---

## 6. Layout & Responsive Spirit

- **Mobile First**: Design for the vertical screen first. Use safe-area insets for modern mobile displays.
- **Negative Space**: Prioritize generous padding (standard 15px-20px) to prevent the UI from feeling cramped.
- **Micro-Animations**: Use subtle transitions (fade-ins, spring scales) to make the app feel "alive" and premium.

---

## 7. UI Team Guidance
The UI team has full control over the execution of these principles. The goal is to maintain the **"Liquid Glass"** premium feel while optimizing for mobile performance and user delight.
