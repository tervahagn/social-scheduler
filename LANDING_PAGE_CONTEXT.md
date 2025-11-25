# Social Scheduler Landing Page - Context & Design Doc

## Overview
This document captures the design decisions, technical implementation details, and content strategy established during the "Juicy" landing page overhaul (November 2025). Use this as a reference for future iterations to maintain consistency.

## 1. Design System ("The Juicy Look")
The design philosophy is **"Arch-Professional yet Vibrant"**. It avoids generic SaaS looks in favor of a deep, immersive aesthetic.

### Color Palette
- **Background**: Deep Space (`#030014`) to Void (`#0f0728`) gradients.
- **Accents**:
  - Primary: Electric Indigo (`#6366f1`)
  - Secondary: Hot Pink/Purple (`#a855f7`)
  - Text Gradient: `linear-gradient(to right, #c084fc, #6366f1)`
- **Glassmorphism**:
  - Background: `rgba(255, 255, 255, 0.03)`
  - Border: `rgba(255, 255, 255, 0.05)`
  - Backdrop Filter: `blur(10px)`

### Typography
- **Headings**: `Outfit` (Google Fonts) - Bold, modern, geometric.
- **Body**: `Space Grotesk` (Google Fonts) - Tech-forward, readable.

### Key Visual Elements
- **Zig-Zag Layout**: Alternating Text/Image sections for the "Brief", "Engine", and "Editor" features.
- **Animated Logo**: A custom JS/CSS implementation that cycles through 4 icons (Zap, Calendar, Share, Message) every 3 seconds.
- **Micro-interactions**: Hover glows (`btn-glow`), floating elements (`float` animation), and pulse rings.

## 2. Content Strategy
The landing page tells a specific story about the product's value proposition:

1.  **Hero**: "Operating System for Sovereign Influence". Focus on self-hosting and ownership.
2.  **The Brief (Strategy Center)**: Emphasizes starting with a strategy, not just a post.
3.  **The Engine (Generation)**: Explains the "Cascading Prompt Architecture" (Master -> Platform -> Brief prompts).
4.  **The Editor (Version Control)**: Highlights "Git for Copy" - version history and safety.
5.  **Integrations**: Showcases OpenRouter (LLM Agnostic), Make.com (Automation), and Self-Hosting.

## 3. Technical Implementation

### File Structure
```
Social-Scheduler-Landing/
├── index.html       # Main entry point (Single Page)
├── style.css        # All styles (Tailwind-free, pure CSS variables)
├── script.js        # Scroll animations & interaction logic
└── assets/          # Images and media
    ├── demo.webp    # Hero video loop
    ├── brief.png    # Feature 1 screenshot
    ├── results.png  # Feature 2 screenshot
    ├── editor.png   # Feature 3 screenshot
    └── ...
```

### Key Code Components
- **Logo Animation**: Logic resides in `index.html` script tag (cycling `active` class on SVGs).
- **Scroll Reveal**: `IntersectionObserver` in `script.js` triggers `.visible` class on `.fade-in-section` elements.
- **Responsive Grid**: The `.integration-grid` and `.feature-row` use CSS Grid/Flexbox to stack on mobile and expand on desktop.

## 4. Deployment
- **Platform**: GitHub Pages
- **Branch**: `gh-pages`
- **URL**: `https://tervahagn.github.io/social-scheduler/`

## 5. Future Considerations
- **Performance**: Ensure `demo.webp` remains optimized (<500KB).
- **SEO**: Maintain the meta tags in `index.html` if page content changes.
- **Dark Mode**: The site is "Dark Mode Only" by design. Do not add a light mode toggle without a full redesign.
