# Webhook & Settings Architecture Refactoring

## Overview

This refactoring improves the application architecture by:
1. **Centralizing webhook URL** - Moving from per-platform to single Make.com webhook in Settings
2. **Reorganizing Settings** - Structuring into clear sections (OpenRouter, Make.com)
3. **Moving Master Prompt** - From Settings to Platforms page (more logical placement)
4. **Improving UX** - Adding collapsible guide sections to reduce visual clutter

## User Review Required

> [!IMPORTANT]
> **Breaking Change**: Webhook URL is removed from individual platforms and centralized in Settings. The system will fail to publish if no webhook URL is configured in Settings (with clear error message).

> [!NOTE]
> **Master Prompt Relocation**: Master Prompt is being moved from Settings page to Platforms page (top section) as it's more semantically related to platform-specific content generation.

---

## Proposed Changes

### Backend Services

#### [MODIFY] [publisher.service.js](file:///Users/tervahagn/REPORSITORIES/Social%20Scheduler/backend/src/api/../services/publisher.service.js)

**Changes:**
- Update `publishPost()` to fetch webhook URL from settings table instead of platforms table
- Remove platform-specific webhook URL fallback logic
- Add clear error message when webhook URL not configured in settings
- Update SQL query to remove webhook_url join from platforms

**Logic:**
```javascript
// Before: get webhook from platform
const post = await db.prepare(`
  SELECT posts.*, platforms.webhook_url, ...
  FROM posts JOIN platforms ...
`).get(postId);

// After: get webhook from settings
const webhookSetting = await db.prepare(
  "SELECT value FROM settings WHERE key = 'make_webhook_url'"
).get();
const webhookUrl = webhookSetting?.value;
if (!webhookUrl) {
  throw new Error('Make.com webhook URL not configured. Please add it in Settings.');
}
```

---

### Frontend - Settings Page

#### [MODIFY] [Settings.jsx](file:///Users/tervahagn/REPORSITORIES/Social%20Scheduler/frontend/src/pages/Settings.jsx)

**Changes:**

1. **Remove Master Prompt section** (lines 208-295) - Moving to Platforms page
2. **Reorganize into 3 clear sections:**
   - Section 1: OpenRouter Configuration (existing, add collapsible guide)
   - Section 2: Make.com Webhook Integration (new)
   - Section 3: Info box (existing)

3. **Add Make.com Webhook section** after OpenRouter:
   - Webhook URL input field
   - Icon: `Link` from lucide-react
   - Description explaining centralized approach
   - Save button (or use one unified save for all sections)

4. **Make guides collapsible:**
   - OpenRouter Guide: Add expand/collapse button
   - Webhook Setup Guide: Move from Platforms, make collapsible
   - Use state to track expanded/collapsed status

**New State:**
```javascript
const [webhookUrl, setWebhookUrl] = useState('');
const [showOpenRouterGuide, setShowOpenRouterGuide] = useState(false);
const [showWebhookGuide, setShowWebhookGuide] = useState(false);
```

**Section Structure:**
```
┌─ OpenRouter Configuration ─────────────────┐
│ API Key: [input]                           │
│ Model: [select]                            │
│ [Save Settings]                            │
│ ▼ OpenRouter Guide (collapsible)          │
└────────────────────────────────────────────┘

┌─ Make.com Webhook Integration ────────────┐
│ Webhook URL: [input]                       │
│ [Save Settings]                            │
│ ▼ Webhook Setup Guide (collapsible)       │
└────────────────────────────────────────────┘

┌─ ℹ️ How it works ──────────────────────────┐
│ • Info about settings                      │
└────────────────────────────────────────────┘
```

---

### Frontend - Platforms Page

#### [MODIFY] [Platforms.jsx](file:///Users/tervahagn/REPORSITORIES/Social%20Scheduler/frontend/src/pages/Platforms.jsx)

**Changes:**

1. **Remove webhook URL from PlatformCard component:**
   - Remove `webhookUrl` state (line 21)
   - Remove webhook section (lines 115-175)
   - Remove webhook from `handleSave()` (lines 30-44)
   - Keep only: platform enable/disable toggle, prompt settings

2. **Remove Webhook Setup Guide** (lines 366-433) - Moving to Settings

3. **Add Master Prompt section at top** (before platforms grid):
   - Fetch master prompt from settings
   - Display in a prominent card above platforms
   - Edit/save functionality
   - Icon: `FileCode` from lucide-react

**New Layout:**
```
Page Header
├─ Master Prompt Card (new, full width)
└─ Platforms Grid
   ├─ Platform Card 1 (simplified, no webhook)
   ├─ Platform Card 2
   └─ ...
```

**Master Prompt Card Features:**
- View/edit modes
- Syntax highlighting (monospace font)
- Description: "System prompt used for AI content generation across all platforms"
- Save/Cancel buttons in edit mode

---

## Verification Plan

### Automated Tests

```bash
# Start the application
./start.sh

# Verify Settings page loads without errors
# Check browser console for warnings
```

### Manual Verification

1. **Settings Page:**
   - [ ] OpenRouter section displays correctly
   - [ ] OpenRouter Guide is collapsible
   - [ ] Make.com Webhook section displays with input field
   - [ ] Webhook Guide is collapsible and displays setup steps
   - [ ] Master Prompt section is removed
   - [ ] Can save webhook URL to settings

2. **Platforms Page:**
   - [ ] Master Prompt card displays at top
   - [ ] Can view/edit Master Prompt
   - [ ] Master Prompt saves correctly
   - [ ] Platform cards no longer show webhook URL fields
   - [ ] Webhook Setup Guide is removed
   - [ ] Platform enable/disable still works
   - [ ] Platform-specific prompts still work

3. **Publishing Flow:**
   - [ ] Navigate to a brief with generated posts
   - [ ] Try publishing without webhook URL configured
   - [ ] Verify clear error message appears
   - [ ] Add webhook URL in Settings
   - [ ] Verify publishing works with centralized webhook
   - [ ] Check browser dev tools Network tab for webhook call

4. **UI/UX:**
   - [ ] Collapsible sections expand/collapse smoothly
   - [ ] Page layouts are clean and well-organized
   - [ ] Responsive design works on different screen sizes
   - [ ] No visual glitches or layout issues
