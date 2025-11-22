# Brief Editing & Content Branching - Implementation Walkthrough

## Overview

Implemented two major features to improve content workflow:
1. ✅ **Brief Editing** - Edit brief details before generating master content
2. 🚧 **Content Branching** - Foundation laid, ready for branching UI (in progress)

---

## Feature 1: Brief Editing (Completed)

### Problem
Users couldn't modify brief details after creation and before generating master draft. If there was a typo or missing information, they had to start over.

### Solution
Added full editing capability on the Master Draft page, allowing users to review and modify:
- Title
- Content
- Link URL

### Implementation

#### Backend Changes

**[MODIFIED] `backend/src/api/briefs.routes.js`**

Added `PUT /api/briefs/:id` endpoint:
```javascript
router.put('/:id', async (req, res) => {
    const { title, content, link_url, selected_platforms } = req.body;
    // Validates brief exists and content is not empty
    // Updates brief in database
    // Returns updated brief with files
});
```

**API Usage:**
```bash
curl -X PUT http://localhost:3001/api/briefs/123 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "content": "Updated content"}'
```

#### Frontend Changes

**[MODIFIED] `frontend/src/services/api.js`**

Added `updateBrief` function:
```javascript
export const updateBrief = async (id, data) => {
    const response = await api.put(`/briefs/${id}`, data);
    return response.data;
};
```

**[MODIFIED] `frontend/src/pages/MasterDraft.jsx`**

Major changes:
1. Added editing state and form fields
2. Created save and cancel handlers
3. Replaced compact brief summary with full edit form

**New State:**
```javascript
const [editingBrief, setEditingBrief] = useState(false);
const [briefTitle, setBriefTitle] = useState('');
const [briefContent, setBriefContent] = useState('');
const [briefLink, setBriefLink] = useState('');
```

**UI Behavior:**
- **No drafts yet**: Brief form is editable by default
- **Drafts exist**: Brief shown in view mode with "Edit" button
- **Edit mode**: Full form with Save/Cancel buttons
- **View mode**: Clean display of brief details

---

## Feature 2: Content Branching (Foundation Complete)

### Database Changes

**[NEW] `backend/src/database/migrate-branching.sql`**

Added columns to `master_drafts` table:
```sql
ALTER TABLE master_drafts ADD COLUMN parent_id INTEGER REFERENCES master_drafts(id);
ALTER TABLE master_drafts ADD COLUMN branch_name TEXT;
ALTER TABLE master_drafts ADD COLUMN is_branch BOOLEAN DEFAULT 0;
CREATE INDEX idx_master_drafts_parent_id ON master_drafts(parent_id);
```

**Migration Status:** ✅ Applied to database

**Schema Changes:**
- `parent_id`: Links branch to its source draft
- `branch_name`: User-friendly name for the branch
- `is_branch`: Flag to distinguish branches from corrections

### Remaining Work

**Backend:**
- [ ] Add `POST /api/master-drafts/:id/branch` endpoint
- [ ] Handle branch creation logic

**Frontend:**
- [ ] Add "Create Branch" button (GitBranch icon)
- [ ] Add branch creation modal
- [ ] Update version history to show branch tree
- [ ] Add `branchMasterDraft` API function

---

## How Brief Editing Works

### Workflow

1. **Create Brief** → User creates brief via New Brief page
2. **Navigate to Master Draft** → User clicks "Create & Start Draft"
3. **Review Brief** → Brief details shown in editable form
4. **Edit if Needed** → User can modify title, content, or link
5. **Save Changes** → Click "Save Brief" button
6. **Generate Master** → Click "Generate Master Draft" when ready

### UI States

**Before First Draft:**
```
┌─────────────────────────────┐
│ Brief Details          [?]  │
├─────────────────────────────┤
│ Title: [_______________]     │
│ Content: [____________]      │
│          [____________]      │
│ Link: [________________]     │
│                              │
│ ℹ️ Review and edit before   │
│    generating master content│
│                              │
│ [Save Brief]                 │
└─────────────────────────────┘
```

**After Drafts Exist (View Mode):**
```
┌─────────────────────────────┐
│ Brief Details     [Edit]    │
├─────────────────────────────┤
│ Title: My Brief Title       │
│ Content: Brief content here │
│ Link: https://example.com   │
└─────────────────────────────┘
```

**Edit Mode:**
```
┌─────────────────────────────┐
│ Brief Details               │
├─────────────────────────────┤
│ Title: [My Brief Title__]   │
│ Content: [Brief content__]  │
│          [______________]    │
│ Link: [https://example.com] │
│                              │
│ [Save Brief] [Cancel]        │
└─────────────────────────────┘
```

---

## Files Modified

### Backend
1. `backend/src/api/briefs.routes.js` - Added PUT endpoint
2. `backend/src/database/migrate-branching.sql` - [NEW] Migration script

### Frontend
3. `frontend/src/services/api.js` - Added updateBrief function
4. `frontend/src/pages/MasterDraft.jsx` - Added editing UI and handlers

---

## Testing

### Brief Editing
1. ✅ Create a brief
2. ✅ Land on Master Draft page
3. ✅ See brief in editable form (no drafts yet)
4. ✅ Modify title, content, link
5. ✅ Click "Save Brief"
6. ✅ Verify changes persist
7. ✅ Generate master draft
8. ✅ Click "Edit" button
9. ✅ Modify brief
10. ✅ Click "Save" - changes saved
11. ✅ Click "Cancel" - changes discarded

### Database Migration
- ✅ Migration script created
- ✅ Applied to database
- ✅ Columns added successfully
- ✅ Index created

---

## Benefits

### Brief Editing
- ✅ Fix typos before generation
- ✅ Add forgotten details
- ✅ Adjust content scope
- ✅ Saves API costs (no wasted generations)
- ✅ Better user control

### Content Branching (When Complete)
- 🔄 Explore alternative content directions
- 🔄 A/B test different approaches
- 🔄 Keep all variations organized
- 🔄 No lost work when experimenting

---

## Next Steps

To complete the branching feature:

1. **Backend**: Add branch creation endpoint
2. **Frontend**: Add branching UI with modal
3. **Frontend**: Update version history to show branches
4. **Testing**: Verify branch creation and switching

---

## API Summary

### New Endpoints

**Update Brief**
```
PUT /api/briefs/:id
Body: { title, content, link_url, selected_platforms }
Returns: Updated brief object
```

**Create Branch** (To be implemented)
```
POST /api/master-drafts/:id/branch
Body: { branch_name, correction_prompt? }
Returns: New branched master draft
```

---

## User Impact

Users can now:
1. ✅ Review briefs before generating content
2. ✅ Edit briefs at any point
3. ✅ Save changes without regenerating
4. 🚧 Create alternative content versions (coming soon)
5. 🚧 Switch between content branches (coming soon)

This significantly improves the content creation workflow and reduces friction in the creative process.
