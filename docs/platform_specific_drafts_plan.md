# Platform-Specific Master Drafts - Implementation Plan

## User Request
Change the master draft workflow to generate **platform-specific drafts immediately** instead of a single generic master draft. Display each platform's draft in a separate box with individual edit/correction capabilities.

## Current Workflow
1. Create brief (with selected platforms)
2. Generate single master draft (generic content)
3. Correct/approve master draft
4. Generate posts for all platforms (master draft + platform-specific prompts)

## New Workflow
1. Create brief (with selected platforms)
2. Generate platform-specific master drafts **for each selected platform**
3. Display in separate boxes (Platform Cards)
4. Allow individual correction for each platform
5. Approve individually or all at once
6. Generate final posts from approved platform-specific drafts

## Database Changes

### Current Schema
```sql
CREATE TABLE master_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brief_id INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    correction_prompt TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Proposed Schema Addition
Add `platform_id` column to `master_drafts` table:

```sql
ALTER TABLE master_drafts ADD COLUMN platform_id INTEGER REFERENCES platforms(id);
CREATE INDEX IF NOT EXISTS idx_master_drafts_platform_id ON master_drafts(platform_id);
```

This allows:
- **One master draft per platform** (one-to-many: brief → platform drafts)
- Version history per platform (existing `version` column)
- Individual status per platform (existing `status` column)

## Backend Changes

### 1. Master Draft Generation Service
File: `backend/src/services/master-content.service.js`

**Current**: `generateMasterDraft(briefId)` → single draft
**New**: `generatePlatformMasterDrafts(briefId)` → array of drafts (one per selected platform)

Logic:
1. Get brief and selected platforms
2. For each platform:
   - Get master prompt + platform-specific prompt
   - Combine: master prompt → platform prompt
   - Call LLM
   - Save to `master_drafts` with `platform_id`
3. Return array of drafts

### 2. API Routes
File: `backend/src/api/masters.routes.js`

**Update**:
- `POST /api/masters/brief/:briefId/generate` - Generate all platform drafts
- `GET /api/masters/brief/:briefId` - Get all platform drafts for brief
- `POST /api/masters/:masterId/correct` - Correct specific platform draft (existing)
- `POST /api/masters/:masterId/approve` - Approve specific platform draft (existing)

## Frontend Changes

### 1. MasterDraft Page
File: `frontend/src/pages/MasterDraft.jsx`

**Current UI**: Single textarea with version selector

**New UI**: Platform Cards (similar to Posts/Preview pages)
- One card per platform
- Each card shows:
  - Platform icon + name
  - Draft content (read-only or editable)
  - Version selector (if multiple versions exist)
  - Actions: **Correct**, **Approve**, **Generate Post**
  - Status indicator (draft/approved)

**Layout**:
```
┌─────────────────────────────┐
│  Brief Details              │
└─────────────────────────────┘

┌─────────────────────────────┐
│  🔵 LinkedIn (Company) v2   │
│  Status: Draft              │
│  ─────────────────────────  │
│  [Content here...]          │
│  ─────────────────────────  │
│  [Correct] [Approve]        │
└─────────────────────────────┘

┌─────────────────────────────┐
│  📘 Facebook v1             │
│  Status: Approved ✓         │
│  ─────────────────────────  │
│  [Content here...]          │
│  ─────────────────────────  │
│  [Generate Post]            │
└─────────────────────────────┘
```

### 2. State Management
```javascript
const [platformDrafts, setPlatformDrafts] = useState([]);
// Structure: [{ platform_id, platform_name, drafts: [], selectedDraft: {} }]

// Group drafts by platform
const groupedDrafts = drafts.reduce((acc, draft) => {
  const key = draft.platform_id;
  if (!acc[key]) acc[key] = [];
  acc[key].push(draft);
  return acc;
}, {});
```

### 3. Individual Correction
Each platform card has its own correction modal/inline editor:
- Click "Correct" → open correction prompt for that specific platform
- Submit → creates new version for that platform only
- Other platforms remain unchanged

## Implementation Steps

### Phase 1: Database Migration
- [ ] Create migration file to add `platform_id` to `master_drafts`
- [ ] Add index on `platform_id`
- [ ] Test migration

### Phase 2: Backend Services
- [ ] Update `master-content.service.js`:
  - [ ] Implement `generatePlatformMasterDrafts(briefId)`
  - [ ] Update `getMasterDrafts(briefId)` to return platform info
  - [ ] Ensure `correctMasterDraft` and `approveMasterDraft` work with platform drafts
- [ ] Update API routes to handle platform drafts
- [ ] Test all endpoints

### Phase 3: Frontend UI
- [ ] Update `MasterDraft.jsx`:
  - [ ] Implement platform card layout
  - [ ] Add platform grouping logic
  - [ ] Individual correction UI per platform
  - [ ] Individual approval per platform
  - [ ] Bulk actions (approve all, generate all posts)
- [ ] Test workflow end-to-end

### Phase 4: Post Generation Update
- [ ] Update post generation to use platform-specific master drafts
- [ ] Ensure backward compatibility (if needed)

## Benefits
1. **User sees platform-specific content immediately** - no need to wait until final post generation
2. **Individual editing** - can fine-tune each platform's message
3. **Better content quality** - platform-specific from the start (not adapted later)
4. **Clear workflow** - each platform has its own lifecycle

## Backward Compatibility
**Migration strategy**:
- Existing master drafts (without `platform_id`) remain unchanged
- New briefs generate platform-specific drafts
- UI handles both cases gracefully (show single draft if no platform_id)

## Alternative: Simpler Approach
If we want to avoid DB changes, we could:
- Generate platform drafts on-the-fly (not persisted)
- Store only the approved final version
- **Downside**: No version history per platform, can't iterate

**Recommendation**: Full implementation with DB changes for better UX.
