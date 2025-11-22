# Social Scheduler - Architecture

## Overview

**Type**: Self-Hosted Personal Application  
**Deployment**: Local development server (localhost)  
**Database**: SQLite file in project folder  
**Access**: Web browser (localhost:3000)

---

## Architecture Decision

### Chosen: Local SQLite + Node.js Backend

This project uses a **local-first, self-hosted architecture** where everything runs on your machine.

```
┌─────────────────────────────────────────┐
│  Your Computer                          │
├─────────────────────────────────────────┤
│                                         │
│  Browser (localhost:3000)               │
│      ↓                                  │
│  Frontend (React + Vite)                │
│      ↓                                  │
│  Backend (Express.js :3001)             │
│      ↓                                  │
│  SQLite Database (data/scheduler.db)    │
│  Uploads (uploads/)                     │
│                                         │
└─────────────────────────────────────────┘
         ↓
    OpenRouter API (external)
         ↓
    Make.com Webhooks (external)
```

### Why This Architecture?

**✅ Advantages:**

1. **Privacy**: All your data stays on your machine
2. **No hosting costs**: No cloud services needed
3. **Full control**: Own your data, code, and infrastructure
4. **Git-friendly**: Can version control everything including data
5. **Easy backup**: Just copy the project folder
6. **Cross-platform**: Works on Mac, Windows, Linux (Node.js)
7. **No vendor lock-in**: SQLite files are portable
8. **Offline-capable**: Works without internet (except AI generation)

**✅ Perfect for:**
- Personal use
- Single user workflows
- Privacy-sensitive content
- Learning/experimentation
- Full customization control

**❌ Trade-offs:**

- No automatic multi-device sync
- Manual startup required (can be automated)
- Not accessible from other devices
- Requires Node.js installed

---

## Data Storage

### Location
```
/Users/you/REPORSITORIES/Social Scheduler/
├── backend/
│   ├── data/
│   │   └── scheduler.db          ← All your data (SQLite)
│   ├── uploads/                   ← Media files
│   └── prompts/                   ← AI prompt templates
└── frontend/
```

### Database: SQLite

- **File**: `backend/data/scheduler.db`
- **Tables**: briefs, posts, platforms, publish_queue, settings
- **Size**: ~1-10 MB for typical usage
- **Backup**: Copy the file or commit to Git
- **Migration**: Copy file to new machine

### Why SQLite?

1. **Zero configuration**: No database server needed
2. **Portable**: Single file contains everything  
3. **Fast**: Perfect for < 100GB data
4. **Reliable**: Used by iOS, Android, Chrome, Firefox
5. **SQL support**: Full relational database features
6. **Git-friendly**: Can track schema changes

---

## Alternatives Considered

### ❌ Cloud Database (PostgreSQL/MySQL)
- **Why not**: Requires hosting, costs money, data leaves your machine
- **When to use**: Multi-user, team collaboration, public service

### ❌ IndexedDB (Browser storage)
- **Why not**: Data tied to browser, cleared with cache, no Git versioning
- **When to use**: Pure client-side apps, maximum portability

### ❌ Desktop App (Electron/Tauri)
- **Why not**: Adds complexity, larger bundle size, OS-specific builds
- **When to use**: Distribution to non-technical users

### ❌ Cloud Services (Firebase/Supabase)
- **Why not**: Vendor lock-in, costs, data privacy concerns
- **When to use**: Mobile apps, real-time sync, third-party auth

---

## Running the Application

### Development Mode (Current)

```bash
# Terminal 1: Backend
cd backend
npm run dev          # Runs on localhost:3001

# Terminal 2: Frontend  
cd frontend
npm run dev          # Runs on localhost:3000
```

### Simplified Startup (Recommended)

See `scripts/start.sh` for single-command startup.

---

## External Services

The app integrates with two external services:

### 1. OpenRouter API
- **Purpose**: AI content generation (LLM models)
- **Data sent**: Brief content, prompts
- **Privacy**: Your content is sent to AI models
- **Configuration**: `OPENROUTER_API_KEY` in `.env`

### 2. Make.com Webhooks
- **Purpose**: Social media publishing automation
- **Data sent**: Generated post content, scheduling info
- **Privacy**: Posts sent to Make.com, then to social platforms
- **Configuration**: Webhook URLs in Platforms page

**Note**: These are the ONLY external connections. All other data stays local.

---

## Backup Strategy

### Manual Backup
```bash
# Copy entire project
cp -r "Social Scheduler" ~/Backups/social-scheduler-$(date +%Y%m%d)

# Or just the database
cp backend/data/scheduler.db ~/Backups/
```

### Git Backup
```bash
# Add data to Git (optional)
git add backend/data/scheduler.db
git commit -m "Backup: $(date)"
git push
```

### Automated Backup (Optional)
```bash
# Add to crontab for daily backup
0 2 * * * cp ~/REPORSITORIES/Social\ Scheduler/backend/data/scheduler.db ~/Backups/scheduler-$(date +\%Y\%m\%d).db
```

---

## Scaling Considerations

**Current capacity**: Handles thousands of briefs/posts without issues

**If you need to scale:**

1. **Multi-user**: Switch to PostgreSQL + deploy to cloud
2. **Multi-device**: Add sync layer (rsync, Syncthing, Git)
3. **Team collaboration**: Migrate to Next.js + Vercel + Supabase
4. **Public service**: Containerize (Docker) + deploy

**For personal use**: Current architecture is optimal! 🎯

---

## Security

### Local Security
- Data accessible to anyone with access to your machine
- No authentication by default (localhost is trusted)
- Use OS-level encryption (FileVault, BitLocker) for disk protection

### API Keys
- Store in `.env` (not committed to Git)
- Never share `OPENROUTER_API_KEY`
- Rotate keys if exposed

### Network Security
- Backend only accepts localhost connections
- No public internet exposure by default
- Make.com webhooks use HTTPS

---

## Future Enhancements

Potential additions while keeping local-first architecture:

1. **Optional Cloud Sync**: Dropbox/Google Drive file sync
2. **Export/Import**: JSON backup format
3. **Desktop Wrapper**: Package as Electron app for non-technical users
4. **Mobile App**: React Native with SQLite sync
5. **Plugin System**: Custom platform integrations

---

## Summary

**Architecture**: Self-hosted, local-first, privacy-focused  
**Stack**: React + Express + SQLite  
**Deployment**: Run locally, access via browser  
**Philosophy**: You own your data, code, and workflow

This is the **recommended architecture** for Social Scheduler.
