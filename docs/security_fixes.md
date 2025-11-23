# Security & Settings Documentation

## Critical Security Measures

### 1. API Keys and Sensitive Data Storage

**✅ SECURE: All sensitive data is stored LOCALLY only**

- **OpenRouter API Key**: Stored in `backend/data/scheduler.db` (settings table)
- **User Prompts**: Stored in `backend/data/scheduler.db` (settings table)
- **Platform Webhooks**: Stored in `backend/data/scheduler.db` (platforms table)

**🔒 These files are NEVER committed to GitHub:**
- `*.db` - All database files
- `*.sqlite*` - All SQLite database variants
- `.env` - Environment variables
- `backend/data/` - Data directory
- `uploads/` - User uploaded files

### 2. How Settings Are Saved

When you update settings in the UI (`/settings`):

1. Click "Save Settings" button
2. Frontend sends API request: `PUT /api/settings/:key`
3. Backend saves to database: `INSERT OR REPLACE INTO settings (key, value)`
4. Settings are immediately available for content generation

**Priority Order:**
1. Database settings (highest priority)
2. `.env` file (fallback)
3. Default values (if neither exists)

### 3. What Gets Committed to GitHub

**✅ Safe to commit:**
- Source code (`.js`, `.jsx`, `.css`)
- Configuration files (`vite.config.js`, `package.json`)
- Documentation (`.md` files)
- Schema migrations (`.sql` files)

**❌ NEVER committed:**
- Database files (`*.db`, `*.sqlite`)
- API keys or credentials
- User-generated content
- Uploaded media files
- Environment variables (`.env`)

### 4. Security Verification

Run these commands to verify nothing sensitive is tracked:

```bash
# Check what's tracked in git
git ls-files | grep -E '\.db$|\.env$|scheduler\.db|\.sqlite'

# Should return NOTHING. If it returns files, they need to be removed:
git rm --cached <filename>
git commit -m "Remove sensitive file"
git push
```

### 5. Setting Up a New Environment

1. Clone the repository
2. Create `.env` file (NOT tracked):
   ```env
   # Optional: Only needed if not setting via UI
   OPENROUTER_API_KEY=your-key-here
   OPENROUTER_MODEL=x-ai/grok-4.1-fast:free
   ```
3. Run migrations to create database
4. Configure via UI at `/settings`

## Fixed Issues

### Issue 1: API Key Not Persisting
**Problem**: Settings UI saved to DB, but `master-content.service.js` was reading from `process.env` only.

**Solution**: Updated `generateMasterDraft()` and `correctMasterDraft()` to read from database first:
```javascript
const apiKeySetting = await db.prepare("SELECT value FROM settings WHERE key = 'openrouter_api_key'").get();
const apiKey = apiKeySetting?.value || process.env.OPENROUTER_API_KEY;
```

### Issue 2: Database File in Git
**Problem**: `backend/database.sqlite` was accidentally committed to repository.

**Solution**: 
- Removed from git: `git rm --cached backend/database.sqlite`
- Enhanced `.gitignore` with explicit patterns
- Database now stays local only

### Issue 3: .gitignore Too Permissive
**Problem**: Only `*.db` pattern, missing variants like `.sqlite`, `.db-shm`, etc.

**Solution**: Enhanced `.gitignore` with comprehensive patterns:
```gitignore
*.db
*.db-journal
*.db-shm
*.db-wal
*.sqlite
*.sqlite3
*.sqlite-journal
backend/data/
backend/database.sqlite
```

## Port Configuration

**Current Setup:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

**Note**: The URL format `localhost:SS` is not valid. URLs require numeric ports (e.g., `localhost:3000`). 

If you want a custom domain, you would need to:
1. Set up a local DNS entry (e.g., in `/etc/hosts`)
2. Use a reverse proxy (e.g., nginx)
3. Or use a custom port like `3333` (easier)

To change the port, edit:
- **Frontend**: `frontend/vite.config.js` → `server.port`
- **Backend**: `backend/src/index.js` → `PORT` const
