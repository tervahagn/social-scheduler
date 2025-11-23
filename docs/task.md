# Simplified Platform-First Workflow Implementation

## Overview
Remove master draft layer and generate platform-specific content directly from briefs.

**User Requirements:**
- ✅ Unlimited correction versions
- ✅ Stay in draft after correction (human approval required)
- ✅ Bulk "Approve All" button
- ✅ "Regenerate/Start Over" per platform

## Phase 1: Database Changes
- [x] Create `post_versions` table for correction history
- [x] Add `version` column to `posts` table
- [x] Create migration script
- [x] Run migration

## Phase 2: Backend Services
- [x] Update `content-generator.service.js`:
  - [x] Skip master draft generation
  - [x] Generate platform content directly from brief
  - [x] Combine master prompt + platform prompt
- [x] Add version management:
  - [x] Save version before correction
  - [x] Track correction prompts
  - [x] Enable rollback
- [x] Update approval system:
  - [x] Allow un-approve
  - [x] Track approval timestamp
- [x] Add API endpoints:
  - [x] `POST /api/content/brief/:id/generate` - Generate all platforms
  - [x] `POST /api/content/post/:id/correct` - Correct specific post
  - [x] `POST /api/content/post/:id/regenerate` - Start over
  - [x] `GET /api/content/post/:id/versions` - Get version history
  - [x] `POST /api/content/brief/:id/approve-all` - Bulk approve

## Phase 3: Frontend UI - Content Editor Page
- [x] Create new route `/brief/:id/edit`
- [x] Build platform card component:
  - [x] Platform icon and color
  - [x] Content display
  - [x] Version selector
  - [x] Status badge (draft/approved)
  - [x] Action buttons (Correct, Approve, Regenerate)
- [x] Build correction modal:
  - [x] Show current content
  - [x] Text input for corrections
  - [x] Generate button
- [x] Add bulk actions bar:
  - [x] Approve All
  - [x] Un-approve All
  - [x] Publish Now Button
- [x] Version history viewer:
  - [ ] List all versions
  - [ ] Show correction prompts
  - [ ] Rollback option

## Phase 4: Update Existing Pages
- [x] Update `NewBrief.jsx`:
  - [x] After creation, redirect to `/brief/:id/edit`
- [x] Update `Preview.jsx` (if needed):
  - [x] Remove master draft references
  - [x] Show platform content directly
- [x] Update History:
  - [x] Link to new ContentEditor instead of MasterDraft
- [x] Update Platforms Page:
  - [x] Fix platform names (ID vs Name)
  - [x] Add colored icons
  - [x] Add Webhook Setup Guide (Sticky Sidebar)
- [x] Update Settings Page:
  - [x] Add OpenRouter Guide (Sticky Sidebar)
  - [x] 2-Column Layout

## Phase 5: Polish & Testing
- [x] Loading states and animations
- [x] Error handling (Fixed 500 errors)
- [ ] Keyboard shortcuts (Cmd+Enter to approve)
- [x] Mobile responsiveness
- [ ] End-to-end testing

## Phase 5.5: UI Enhancements (User Request)
- [x] Animated Logo & Modern Navigation
- [x] View Switcher (Grid/List) for Platforms Page
- [x] View Switcher (Grid/List) for History Page
- [x] View Switcher (Grid/List) for Content Editor Page
- [x] Fix Settings Page Layout (Syntax Error)
- [x] Fix Content Editor Crashes (Missing Imports)

## Phase 6: Cleanup
- [ ] Remove master draft code:
  - [ ] `master-content.service.js` (or repurpose)
  - [ ] `masters.routes.js` (or repurpose)
  - [ ] `MasterDraft.jsx` page
  - [ ] `master_drafts` table references
- [x] Update documentation
- [x] Commit and push to GitHub
