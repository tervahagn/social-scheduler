# Recent Changes - November 24, 2025

## Edit Page Improvements

### 1. Content Review Section Removal
**Changes:**
- Removed "Content Review" status card
- Moved all action buttons to view switcher area
- Consolidated "Publish Now", "Un-approve All", and "Approve All" buttons

**Files:**
- `frontend/src/pages/ContentEditor.jsx`

### 2. Individual Platform Publishing
**Changes:**
- Added "Publish" button for each approved platform post
- Platform-specific publishing via `/api/posts/:id/publish`
- Fixed platform name disappearing bug in `handleApprove`

**Features:**
- Users can publish each platform individually
- "Publish" button appears next to "Un-approve" for approved posts
- Green color scheme matching "Approve" button

**Files:**
- `frontend/src/pages/ContentEditor.jsx` (handlePublishSingle, handleApprove)

### 3. Grid View as Default
**Changes:**
- Set default view mode to 'grid' instead of 'list'

**Files:**
- `frontend/src/pages/ContentEditor.jsx`
- `frontend/src/pages/History.jsx`

### 4. Platform Prompt Update Fix
**Bug:** 500 error when editing platform prompts

**Root Cause:** Missing `req.body` destructuring in PUT route

**Fix:**
```javascript
const { display_name, webhook_url, is_active, prompt_content } = req.body;
```

**Files:**
- `backend/src/api/platforms.routes.js`

## Progressive Platform Content Loading

### Overview
Instant visual feedback when generating platform content - cards appear immediately with loading states, then populate progressively as LLM generates content.

### Implementation
**Backend:**
- Created `createPlaceholderPosts()` function
- Created `generateContentForPosts()` function
- Modified `/api/content/brief/:briefId/generate` route

**Frontend:**
- Modified `handleGenerateContent()` with polling
- Immediate card display with loading states
- Progressive updates every 1.5 seconds

**Files:**
- `backend/src/services/content-generator.service.js`
- `backend/src/api/content.routes.js`
- `frontend/src/pages/ContentEditor.jsx`

### Benefits
- Instant visual feedback
- Better perceived performance
- More engaging UX
- Real-time progress visibility

See `docs/features/progressive-loading.md` for detailed documentation.

## Summary

**Total Changes:** 6 features/fixes
**Files Modified:** 5 files
**New Features:** 2 major (progressive loading, individual publishing)
**Bug Fixes:** 2 (platform name, prompt update)
**UX Improvements:** 2 (content review removal, grid default)

---

**Session Date:** November 24, 2025  
**All changes tested and verified ✅**
