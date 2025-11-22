# Recent Fixes & Updates

This document tracks important fixes and improvements made to the Social Scheduler application.

---

## Latest Updates (November 2024)

### ✅ Platform Display Fix
**Issue**: Platforms were not showing in the UI (Platforms page and New Brief page)

**Root Cause**: Base `schema.sql` was missing columns and platforms added via migrations

**Fix**:
- Updated `schema.sql` to include all required columns:
  - `prompt_content` and `ultra_short_prompt` in platforms table
  - `selected_platforms` in briefs table
  - All migration tables included in base schema
- Added all 9 platforms with complete prompts to schema
- Added missing tables: settings, master_drafts, brief_files, analytics_events, post_metrics

**Verification**: Database re-initialization now works correctly with all platforms seeded

---

### ✅ Settings Page Improvements
**Issues Fixed**:
1. Show/Hide API key button not clickable
2. Custom model not saving properly
3. Default model outdated

**Fixes**:
1. Added `paddingRight: '60px'` to API key input for button space
2. Improved null handling in `fetchSettings()` for custom models
3. Changed default model to `x-ai/grok-4.1-fast:free` (free tier)

**Files Modified**:
- `frontend/src/pages/Settings.jsx`
- `backend/src/services/openrouter.service.js`
- `.env.example`

---

### ✅ Analytics Page Fixes
**Issue**: Analytics endpoint returning 500 error

**Root Cause**: SQL queries referenced non-existent `platform` column in posts table

**Fix**: Updated `analytics.service.js` to join with platforms table:
```javascript
// Before
SELECT platform, COUNT(*) FROM posts GROUP BY platform

// After  
SELECT plat.display_name as platform, COUNT(*)
FROM posts p
JOIN platforms plat ON p.platform_id = plat.id
GROUP BY plat.id, plat.display_name
```

**Files Modified**: `backend/src/services/analytics.service.js`

---

### ✅ Analytics UI Redesign
**Issue**: Statistics display was cluttered and hard to read

**Improvements**:
- Removed heavy chart libraries (Recharts)
- Replaced with clean, minimal card-based design
- Platform performance shown as horizontal progress bars
- Better visual hierarchy and scanability
- Used project's CSS variables for consistency

**Files Modified**: `frontend/src/pages/Analytics.jsx`

---

### ✅ Master Draft Page Redesign
**Issue**: Confusing layout, unclear workflow, hard to understand next steps

**Improvements**:
- Single-column layout for better focus
- Clear status banners showing what to do next
- Compact brief summary with expandable details
- Version history as simple pills instead of sidebar
- Prominent action buttons with clear labels
- Better visual hierarchy and workflow progression

**Files Modified**: `frontend/src/pages/MasterDraft.jsx`

---

### ✅ LinkedIn Personal Platform Added
**Enhancement**: Added second LinkedIn platform for personal content

**Changes**:
- Created `linkedin-personal` platform with personal-focused prompt
- Renamed original LinkedIn to "LinkedIn (Company)"
- Different tone: Company = professional/business, Personal = authentic/storytelling
- Both platforms use same character limit (3,000) but different styles

**Files Modified**:
- `backend/src/database/schema.sql`
- Database updated with new platform

---

### ✅ Platform Ordering
**Requirement**: Consistent platform sequence across entire app

**New Order**:
1. Blog
2. LinkedIn (Company)
3. LinkedIn (Personal)
4. Reddit
5. Google Business
6. X (Twitter)
7. YouTube Posts
8. Facebook
9. Instagram

**Implementation**:
- Updated platform sequence in `content-generator.service.js`
- Added sorting to `platforms.routes.js` API endpoint
- Ensures consistent order in New Brief page and Platforms page

---

## Key Learnings

### Database Schema Management
- Keep `schema.sql` up-to-date with all migrations
- Include all tables and columns in base schema
- Document migration history

### Platform Configuration
- Store prompts in database for easy customization
- Use display names for UI clarity
- Maintain consistent ordering across app

### UI/UX Best Practices
- Use project's CSS variables, not external frameworks
- Clear visual hierarchy guides users
- Action buttons should be prominent and clearly labeled
- Minimize clutter, maximize readability

### API Design
- Always sort results consistently
- Join tables for complete data
- Handle null values gracefully
- Return meaningful error messages

---

## Configuration Quick Reference

### Default LLM Model
`x-ai/grok-4.1-fast:free` (free tier, fast, good quality)

### Database Location
`backend/data/scheduler.db`

### Upload Directory
`backend/uploads/`

### API Port
`3001` (backend), `5173` (frontend)

### Platform Count
9 total platforms (8 original + 1 new LinkedIn Personal)

---

## Common Issues & Solutions

### Platforms Not Showing
1. Check database has all platforms: `sqlite3 data/scheduler.db "SELECT * FROM platforms;"`
2. Verify platforms are active
3. Restart backend server

### API Key Not Working
1. Verify format: `sk-or-v1-...`
2. Check OpenRouter account has credits
3. Try setting in both Settings page and `.env` file

### Generation Fails
1. Check API key validity
2. Verify model exists on OpenRouter
3. Check network connection
4. Review backend logs

### Database Corruption
1. Backup `backend/data/scheduler.db`
2. Delete database file
3. Run `node src/database/init.js`
4. All platforms will be re-seeded

---

## Future Improvements

### Planned Features
- Automated publishing via webhooks
- Real-time metrics collection
- Bulk post generation
- Template library
- Content calendar view

### Performance Optimizations
- Caching for platform data
- Batch post generation
- Optimistic UI updates
- Database query optimization
