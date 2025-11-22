# Brief Editing & Content Branching Features

## Overview

Two new features to improve content workflow:
1. **Edit Brief Before Generation**: Allow users to review and edit brief details before generating master content
2. **Branch/Fork Master Content**: Create alternative versions from existing master drafts to explore different content directions

---

## Feature 3: Landing Page & Routing Logic (Revised)

### Goal Description
- **Platforms**: Restore full functionality (webhooks + prompt editing) while keeping new UI.
- **Documentation**: Save artifacts to `/docs` folder.
- **Routing**:
    - Default (`/`) -> `New Brief`.
    - Logo Click -> `Intro` page.
    - **First Time User**: Redirect `/` to `Intro` if first visit.

### Proposed Changes

#### [MODIFY] frontend/src/pages/Platforms.jsx
- Restore `PlatformCard` component structure.
- Re-implement `prompt_content` and `ultra_short_prompt` editing fields.
- Keep the new "Transparent Icon" design.

#### [NEW] frontend/src/pages/Intro.jsx
- Rename `Home.jsx` to `Intro.jsx`.

#### [MODIFY] frontend/src/App.jsx
- Create `Root` component:
    - Checks `localStorage.getItem('hasSeenIntro')`.
    - If false -> Redirect to `/intro`.
    - If true -> Render `NewBrief`.
- Update Routes:
    - `/` -> `Root`
    - `/intro` -> `Intro`
    - `/new` -> `NewBrief`
- Update Navigation:
    - Logo links to `/intro`.

#### [NEW] docs/
- Create directory.
- Copy `walkthrough.md` and `implementation_plan.md`.

## Verification Plan
- **Platforms**: Verify I can edit and save prompts again.
- **Routing**:
    - Clear LocalStorage -> Visit `/` -> Should go to `/intro`.
    - Click "Get Started" on Intro -> Should go to `/new` and set flag.
    - Visit `/` again -> Should stay on `/new`.
    - Click Logo -> Should go to `/intro`.
- **Docs**: Verify files exist in `/docs`.g
- Show edit form when editing
- Add "Save" and "Cancel" buttons in edit mode

Brief editing card (when no drafts exist):
- Show brief details in editable form by default
- Allow full editing before first generation
- "Generate Master Draft" button only becomes prominent after brief details are finalized

**[MODIFY] frontend/src/services/api.js**
- Add `updateBrief(briefId, data)` function
- Make PUT request to `/api/briefs/:id`

---

## Feature 2: Branch/Fork Master Content

### Problem
Users may want to explore alternative directions from a master draft without losing the original. Currently, corrections create a linear version history.

### Solution  
Add "branching" capability where users can fork from any master draft to create an alternative path.

### Design Decision

**Approach: Use existing `master_drafts` table with `parent_id` field**
- Add `parent_id` and `branch_name` columns to `master_drafts` table
- Corrections continue to use `correction_prompt` (linear path)
- Branches use `parent_id` (tree structure)
- Each branch can have its own corrections

**Alternative rejected**: Separate `branches` table would add unnecessary complexity.

### Database Schema Changes

**[MODIFY] backend/src/database/schema.sql**
```sql
ALTER TABLE master_drafts ADD COLUMN parent_id INTEGER REFERENCES master_drafts(id);
ALTER TABLE master_drafts ADD COLUMN branch_name TEXT;
ALTER TABLE master_drafts ADD COLUMN is_branch BOOLEAN DEFAULT 0;
```

### Implementation

#### Backend Changes

**[MODIFY] backend/src/api/briefs.routes.js**

Add new endpoint:
```javascript
POST /api/master-drafts/:id/branch
Body: { branch_name: string, correction_prompt?: string }
```

Logic:
- Get source master draft
- Create new master draft with:
  - Same `brief_id`
  - `parent_id` = source draft id
  - `branch_name` from request
  - `version` = parent version + 1 (or separate branch numbering)
  - `content` = parent content (or regenerate with correction_prompt)
  - `is_branch` = true
  - `status` = 'draft'

#### Frontend Changes

**[MODIFY] frontend/src/pages/MasterDraft.jsx**

Add branching UI:
1. **Branch button**: Next to "Approve" button
   - Only show for approved drafts or current draft
   - Icon: `GitBranch` from lucide-react

2. **Branch modal/form**:
   - Branch name input (required)
   - Optional: correction prompt for the branch
   - "Create Branch" button

3. **Branch visualization**:
   - Show branch tree in version history
   - Indicate which draft is a branch vs correction
   - Display branch names
   - Allow switching between branches

**[MODIFY] frontend/src/services/api.js**
- Add `branchMasterDraft(draftId, branchName, correctionPrompt)` function

### UI Design

**Version History Enhancement**:
```
Version 1 [approved]
├── Version 2 (correction)
└── Branch: "Casual Tone" [selected]
    └── Version 3 (correction in branch)
```

**Visual Indicators**:
- Branches: Different background color or icon
- Branch names: Show prominently
- Parent draft: Show link to parent

---

## Verification Plan

### Feature 1: Brief Editing

**Test Cases**:
1. Create brief, land on master draft page
2. Click "Edit Brief" button
3. Modify title, content, link
4. Click "Save" - verify updates persist
5. Click "Cancel" - verify changes discarded
6. Generate master draft after editing
7. Verify generated content uses updated brief

### Feature 2: Content Branching

**Test Cases**:
1. Generate master draft
2. Approve it
3. Click "Create Branch"
4. Enter branch name and optional correction
5. Verify new branch is created
6. Verify original draft is unchanged
7. Make corrections in branch
8. Switch back to main draft
9. Verify can work on both independently
10. Approve branch and generate posts from it

---

## Migration Script

For existing databases:

**File: backend/src/database/migrate-branching.sql**
```sql
-- Add branching columns to master_drafts
ALTER TABLE master_drafts ADD COLUMN parent_id INTEGER REFERENCES master_drafts(id);
ALTER TABLE master_drafts ADD COLUMN branch_name TEXT;
ALTER TABLE master_drafts ADD COLUMN is_branch BOOLEAN DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_master_drafts_parent_id ON master_drafts(parent_id);
```

---

## Files to Modify

### Backend
1. `backend/src/api/briefs.routes.js` - Add PUT endpoint, branch endpoint
2. `backend/src/database/schema.sql` - Add branching columns
3. `backend/src/database/migrate-branching.sql` - [NEW] Migration script

### Frontend
4. `frontend/src/pages/MasterDraft.jsx` - Add editing UI and branching UI
5. `frontend/src/services/api.js` - Add updateBrief and branchMasterDraft functions

---

## Benefits

**Brief Editing**:
- Users can fix typos or add details before generation
- Reduces wasted API calls
- Better control over input

**Content Branching**:
- Explore alternative content directions
- A/B test different approaches
- Keep all variations organized
- No lost work when experimenting

---

## Future Enhancements

- Compare branches side-by-side
- Merge branches
- Tag branches (e.g., "formal", "casual", "technical")
- Branch templates
