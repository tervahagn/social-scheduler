# Additional Files to Remove - Round 2

## ✅ Found More Items to Clean Up!

### 🔴 HIGH PRIORITY - Broken Code

#### 1. Dead Link in Preview.jsx (Lines 289-296)
**File**: `frontend/src/pages/Preview.jsx`

**Issue**: Button tries to navigate to deleted Master Draft page
```javascript
<button
    onClick={() => navigate(`/master/${briefId}`)}
    className="button button-secondary mb-4 ml-2"
>
    <Edit2 size={16} />
    View Master Draft
</button>
```

**Action**: Remove this button (lines 289-296)

**Impact**: This button currently does nothing since `/master/:briefId` route was deleted

---

### 🟡 MEDIUM PRIORITY - Duplicate/Outdated Docs

#### 2. Duplicate SECURITY.md files
- `docs/SECURITY.md` (3,723 bytes)
- `docs/security_fixes.md` (3,723 bytes)

**Status**: Files are **100% identical** (diff shows no differences)

**Action**: Keep `SECURITY.md`, delete `security_fixes.md`

**Reason**: Standard convention is `SECURITY.md` (GitHub recognizes this name)

---

#### 3. Outdated Master Draft Documentation
**File**: `docs/MASTER_DRAFT_WORKFLOW.md` (2,172 bytes)

**Content**: Describes the Master Draft workflow that was just removed
- "We have successfully implemented the iterative Master Draft workflow!"
- Step-by-step guide for using Master Draft
- Technical details about master_drafts table and /api/masters/* endpoints

**Status**: **Outdated** - This workflow no longer exists

**Action**: Delete this file

**Reason**: Describes a removed feature, will confuse users

---

### 🟢 LOW PRIORITY - Consider Reviewing

#### 4. Preview.jsx - Potentially Unused
**File**: `frontend/src/pages/Preview.jsx` (337 lines, 15KB)

**Referenced by**:
- `App.jsx` - Route: `/preview/:briefId`
- `Calendar.jsx` - Navigation on event click

**Question**: Is this page still used in your new ContentEditor workflow?

**Current workflow**: `NewBrief → ContentEditor → Publish`

**Old workflow**: `Brief → Master Draft → Posts → Preview → Publish`

**Recommendation**: 
- If you're using ContentEditor for all editing/approving, Preview.jsx might be redundant
- Check if you actually need a separate "preview" page vs doing everything in ContentEditor
- If unused, could remove ~337 lines

---

#### 5. Double Back Button
**File**: `frontend/src/pages/Preview.jsx` (Lines 284-286)

**Issue**: Duplicate ArrowLeft icons
```javascript
<ArrowLeft size={16} />
<ArrowLeft size={16} />
Back
```

**Action**: Remove duplicate icon (minor bug)

---

## 📋 Summary of Recommended Actions

### Immediate (Breaking Code)
1. ✅ Remove "View Master Draft" button from Preview.jsx (lines 289-296)
2. ✅ Fix double back arrow in Preview.jsx (line 285)

### Cleanup (Duplicates/Outdated)
3. ✅ Delete `docs/security_fixes.md` (duplicate of SECURITY.md)
4. ✅ Delete `docs/MASTER_DRAFT_WORKFLOW.md` (describes removed feature)

### Review (Potentially Unused)
5. ❓ Evaluate if Preview.jsx is still needed in ContentEditor workflow

---

## Quick Fix Commands

```bash
# Navigate to project root
cd "/Users/tervahagn/REPORSITORIES/Social Scheduler"

# Delete duplicate/outdated docs
rm docs/security_fixes.md
rm docs/MASTER_DRAFT_WORKFLOW.md

# Fix Preview.jsx needs manual edit:
# 1. Remove lines 289-296 (View Master Draft button)
# 2. Remove line 285 (duplicate ArrowLeft icon)
```

---

## Files to Update

### frontend/src/pages/Preview.jsx

**Remove lines 289-296:**
```javascript
<button
    onClick={() => navigate(`/master/${briefId}`)}
    className="button button-secondary mb-4 ml-2"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
>
    <Edit2 size={16} />
    View Master Draft
</button>
```

**Fix lines 284-286 (remove duplicate icon):**
```javascript
// Before:
<ArrowLeft size={16} />
<ArrowLeft size={16} />
Back

// After:
<ArrowLeft size={16} />
Back
```

---

## Impact Assessment

| Item | Type | Impact |
|------|------|--------|
| Remove Master Draft button | Bug fix | ✅ Fixes broken navigation |
| Delete security_fixes.md | Cleanup | ✅ Removes duplicate (0 impact) |
| Delete MASTER_DRAFT_WORKFLOW.md | Cleanup | ✅ Removes outdated doc |
| Fix double arrow | Bug fix | ✅ Visual improvement |
| Review Preview.jsx usage | Decision needed | ❓ Depends on workflow |

---

## Total Savings (if all removed)

- **Broken code**: 1 dead button
- **Documentation**: 2 files (~6 KB)
- **Bugs**: 1 duplicate icon
- **Potential**: 1 page (337 lines) if Preview.jsx is unused

Would you like me to execute these cleanups?
