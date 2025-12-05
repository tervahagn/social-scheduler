# Social Scheduler Landing Page - Context & Design Doc

## Overview
This document captures the design decisions, technical implementation details, and content strategy for the landing page. Updated December 2025 to reflect v2.0 features.

## 1. Design System
The design philosophy is **"Dark, Professional, Clean"**. No marketing fluff.

### Color Palette
- **Background**: Deep Space (`#030712`)
- **Accents**:
  - Primary: Purple (`#8b5cf6`)
  - Secondary: Cyan (`#06b6d4`)
- **Glassmorphism**:
  - Background: `rgba(255, 255, 255, 0.03)`
  - Border: `rgba(255, 255, 255, 0.05)`
  - Backdrop Filter: `blur(12px)`

### Typography
- **Headings**: `Space Grotesk` (Google Fonts)
- **Body**: `Outfit` (Google Fonts)

### Key Visual Elements
- **Zig-Zag Layout**: Alternating Text/Image sections
- **Animated Logo**: Cycles through 4 icons every 3 seconds
- **Glass cards**: Semi-transparent with blur effect

## 2. Content Strategy
The landing page communicates what the product actually does:

1. **Hero**: "Post to 9 Platforms from One Place" — direct, no buzzwords
2. **Quick Post**: Fast mode for direct posting without briefs
3. **Calendar**: Visual scheduling and timeline view
4. **Brief**: The AI content generation workflow
5. **Integrations**: OpenRouter, Make.com, 9 platforms listed
6. **FAQ**: Common questions with JSON-LD schema for SEO

## 3. SEO Implementation

### JSON-LD Schemas (in `<head>`)
1. **SoftwareApplication** — app metadata, features, author
2. **FAQPage** — 6 common questions for rich snippets

### Meta Tags
- Description focuses on features, not marketing speak
- Keywords: social media scheduler, open source, self-hosted
- Open Graph tags for social sharing

## 4. File Structure
```
Social-Scheduler-Landing/
├── index.html       # Main page with JSON-LD schemas
├── style.css        # Pure CSS, no Tailwind
├── script.js        # Scroll animations
├── CNAME            # GitHub Pages custom domain
└── assets/
    ├── demo.webp    # Hero animation
    ├── brief.png    # Screenshot
    ├── results.png  # Screenshot
    ├── editor.png   # Screenshot
    └── ...
```

## 5. Deployment
- **Platform**: GitHub Pages
- **Custom Domain**: tervahagn.github.io/social-scheduler/
- **CNAME**: Configured for custom domain

## 6. Features Documented

### Mentioned on Landing Page
- Quick Post (multi-platform simultaneous posting)
- Content Calendar with scheduling
- Brief → AI → Platform-native posts workflow
- 9 platforms: LinkedIn, Facebook, Instagram, X, YouTube, Reddit, Google Business, Blog
- OpenRouter integration (any LLM)
- Make.com/Zapier webhooks
- Self-hosted, SQLite database
- Version history for content

### Not Yet on Landing Page (Future)
- WebSocket real-time updates
- Cloudinary media upload
- Dark/Light theme toggle

## 7. Writing Style
- **No buzzwords**: "sovereign influence", "orchestrating", "ecosystem" removed
- **Plain English**: "Post to 9 platforms" > "Multi-channel content orchestration"
- **Direct answers**: FAQ gives real answers, not marketing
- **Honest limitations**: "You need Node.js skills" in FAQ
