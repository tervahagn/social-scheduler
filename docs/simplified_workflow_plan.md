# Simplified Platform-First Workflow

## User's Vision

**Eliminate the "master draft" step** and go directly from brief to platform-specific content.

### Complete Workflow
```
1. Brief Creation → 2. Platform Content → 3. Individual Corrections → 4. Approval → 5. Deployment
```

**Detailed Steps:**
1. **Brief**: Write naked ideas/thoughts (no structure required)
2. **Generate**: LLM creates platform-specific content immediately
3. **Iterate**: Request changes per platform (each platform corrected individually)
4. **Approve**: Mark platforms as ready (can un-approve before deployment)
5. **Deploy**: Schedule/publish via Make

---

## Current vs. New System

### Current (Complex)
```
Brief → Master Draft → Correct Master → Approve Master → Generate Posts → Approve Posts → Publish
        [Generic]      [Iterations]                      [Platform-specific]
```

### New (Simplified)
```
Brief → Platform Content → Correct Individual → Approve → Publish
        [Platform-specific] [Per platform]
```

**Key Changes:**
- ❌ Remove: Master drafts table/workflow
- ✅ Direct: Brief → Platform Content
- ✅ Individual: Each platform corrected separately
- ✅ Flexible: Can un-approve before deployment

---

## Database Changes

### What We Already Have (Perfect!)
The `posts` table is already set up for this:
```sql
CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    brief_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft',  -- draft, approved, published
    edited_content TEXT,           -- For corrections
    approved_at DATETIME,
    -- ... other fields
)
```

### What We Need to Add
**Post Versions** (for correction history):
```sql
CREATE TABLE post_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    correction_prompt TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

This allows:
- Version history per platform
- Track what corrections were requested
- Rollback if needed

---

## Backend Changes

### 1. Generate Platform Content Directly
**File**: `backend/src/services/content-generator.service.js`

**New function**: `generatePlatformContent(briefId)`

**Logic**:
1. Get brief + selected platforms
2. For each platform:
   - Get master prompt + platform prompt
   - Combine prompts
   - Call LLM
   - Save to `posts` table (status: 'draft')
3. Return array of posts

### 2. Correction System
**New function**: `correctPlatformContent(postId, correctionPrompt)`

**Logic**:
1. Get current post
2. Save current version to `post_versions`
3. Build correction prompt
4. Call LLM with correction
5. Update post content
6. Increment version number
7. Set status back to 'draft'

### 3. Approval System
**Update function**: `approvePost(postId)`

**Logic**:
- Set `status = 'approved'`
- Set `approved_at = CURRENT_TIMESTAMP`
- Allow re-calling to un-approve (for editing)

---

## Frontend UI/UX Redesign

### Page Flow

#### 1. New Brief Page (Existing)
**Already good**, just emphasize:
- Simple, clean input
- No structure required
- Platform selection clear

#### 2. Content Editor Page (NEW - replaces MasterDraft)
**Route**: `/brief/:id/edit`

**Layout**:
```
┌────────────────────────────────────────┐
│  Back to Briefs                        │
│                                        │
│  Brief: "thinking about productivity"  │
│  [Edit Brief] [Generate All]           │
└────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🔵 LinkedIn (Company)            v2   [⋮]         │
│  ─────────────────────────────────────              │
│                                                     │
│  [Platform-specific content here...]               │
│                                                     │
│  ─────────────────────────────────────              │
│  Status: Draft                                      │
│  [Request Changes] [✓ Approve]                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📘 Facebook                      v1   [⋮]         │
│  ─────────────────────────────────────              │
│  Status: ✓ Approved                                 │
│  [Un-approve] [Schedule]                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Bulk Actions                                       │
│  [Approve All] [Generate Missing]                   │
└─────────────────────────────────────────────────────┘
```

**Platform Card Features:**
- 🎨 Platform color/icon (brand identity)
- 📝 Content display (read-only unless editing)
- 🔄 Version selector (v1, v2, v3...)
- 📊 Status badge (Draft, Approved, Published)
- ⚡ Quick actions (Correct, Approve, Schedule)
- ⋮ Menu (View history, Delete, Regenerate)

**Correction Modal:**
```
┌─────────────────────────────────────┐
│  Request Changes - LinkedIn         │
│  ─────────────────────────────────  │
│                                     │
│  Current version:                   │
│  [Content preview...]               │
│  ─────────────────────────────────  │
│                                     │
│  What to change?                    │
│  [Make it shorter and more formal] │
│  ─────────────────────────────────  │
│                                     │
│  [Cancel]         [Generate v3] →   │
└─────────────────────────────────────┘
```

#### 3. Preview/Posts Page (Update existing)
**Current good**, add:
- Clear approval status
- Un-approve button
- Version history

---

## UI/UX Principles

### Clean & Modern Design
1. **Card-based layout** (not tables)
2. **Platform colors** (brand recognition)
3. **Clear status indicators** (visual badges)
4. **Minimal clicks** (inline actions)
5. **Smart defaults** (auto-save, optimistic UI)

### User-Friendly Features
1. **Undo/Redo** corrections
2. **Version diff** (show what changed)
3. **Keyboard shortcuts** (Cmd+Enter to approve)
4. **Bulk actions** (approve all, generate missing)
5. **Progress indicators** (generation/correction in progress)

### Mobile Responsive
- Stack cards vertically
- Touch-friendly buttons
- Swipe for actions

---

## Implementation Steps

### Phase 1: Database (15 min)
- [ ] Create `post_versions` table
- [ ] Add version column to `posts`
- [ ] Migration script

### Phase 2: Backend (1 hour)
- [ ] `generatePlatformContent(briefId)` - skip master draft
- [ ] `correctPlatformContent(postId, prompt)` - create new version
- [ ] Update approval logic - allow toggle
- [ ] API routes for versions

### Phase 3: Frontend (2-3 hours)
- [ ] Create `/brief/:id/edit` page
- [ ] Platform card component
- [ ] Correction modal
- [ ] Version selector
- [ ] Approval toggle
- [ ] Bulk actions

### Phase 4: Polish (1 hour)
- [ ] Animations/transitions
- [ ] Loading states
- [ ] Error handling
- [ ] Keyboard shortcuts

---

## Benefits

1. ✅ **Simpler workflow** - fewer steps
2. ✅ **Faster** - no intermediate "master draft"
3. ✅ **Platform-first** - content optimized from the start
4. ✅ **Flexible** - individual corrections, un-approve
5. ✅ **Modern UI** - card-based, clean, intuitive

---

## Questions for User

1. **Version limit**: How many correction versions to keep per platform? (Recommend: 10)
2. **Default behavior**: Auto-approve after correction or stay in draft?
3. **Bulk operations**: "Approve all" button helpful?
4. **Regenerate**: Should each platform have a "start over" button?
