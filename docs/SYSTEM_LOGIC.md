# System Logic & Architecture

## Core Logic: Iterative Master Drafts

The system has been restructured to support an iterative "Master Draft" workflow, separating the core content refinement from platform-specific adaptation.

### The Flow

1.  **Brief Ingestion**: User provides raw content, links, and media.
2.  **Master Draft Generation**:
    *   System uses the `master_prompt` (Global Settings) to generate a platform-agnostic "Master Draft".
    *   This draft is stored in the `master_drafts` table.
3.  **Iterative Refinement**:
    *   User provides feedback (correction prompts).
    *   System generates a *new version* of the master draft based on the previous version + feedback.
    *   All versions are preserved in history.
4.  **Approval**:
    *   User explicitly approves a specific version of the Master Draft.
5.  **Platform Adaptation**:
    *   The *Approved Master Draft* is used as the source content.
    *   System iterates through selected platforms (LinkedIn, Twitter, etc.).
    *   Applies platform-specific prompts (`platforms` table) to the Master Draft.
    *   Generates individual posts in the `posts` table.
6.  **Publication**:
    *   Approved posts are sent to Make.com webhooks.

### Database Schema

#### `master_drafts` Table
Stores the history of master text versions.

```sql
CREATE TABLE master_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brief_id INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    correction_prompt TEXT,
    status TEXT DEFAULT 'draft', -- 'draft' or 'approved'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE
);
```

#### `posts` Table Updates
*   Added `master_draft_id` column to link posts back to the source master draft.

### API Structure

*   **`POST /api/masters/generate`**: Create initial v1 draft.
*   **`POST /api/masters/:id/correct`**: Create v(N+1) draft based on feedback.
*   **`POST /api/masters/:id/approve`**: Lock a version as the approved source.
*   **`POST /api/masters/:id/generate-posts`**: Trigger platform generation using the approved master.

### Key Files

*   `backend/src/services/master-content.service.js`: Core logic for master draft lifecycle.
*   `backend/src/api/masters.routes.js`: API endpoints.
*   `frontend/src/pages/MasterDraft.jsx`: UI for the iterative workflow.
