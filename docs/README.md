# Social Scheduler Documentation

## Overview
Social Scheduler is a modern content management system for creating and publishing platform-specific social media posts using AI.

## Key Features
- 🚀 **Simplified Workflow** - Direct platform content generation (no master draft step)
- 🎨 **Platform-First** - Content optimized for each platform from the start
- ✏️ **Individual Corrections** - Edit each platform separately with unlimited versions
- ✓ **Flexible Approval** - Approve/un-approve anytime before publishing
- 🔒 **Secure** - API keys and sensitive data stored locally only

## Documentation Index

### Getting Started
- [Setup Guide](./SETUP_GUIDE.md) - Installation and configuration
- [Simplified Workflow](./SIMPLIFIED_WORKFLOW.md) - **NEW!** Complete workflow walkthrough

### Security
- [Security & Settings](./SECURITY.md) - API key management and data protection

### Features
- [Platform Guide](./PLATFORM_GUIDE.md) - Platform-specific prompts and configuration
- [Brief Editing](./BRIEF_EDITING_FEATURE.md) - Edit briefs before generation
- [API Reference](./API.md) - Backend API endpoints

### Maintenance
- [Recent Fixes](./RECENT_FIXES.md) - Bug fixes and improvements

## Quick Start

### 1. Installation
```bash
# Clone repository
git clone [your-repo-url]
cd social-scheduler

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configuration
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your OpenRouter API key

# Start backend
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## Workflow

### Brief → Platform Content → Corrections → Approval → Publish

1. **Create Brief** - Write raw ideas/thoughts
2. **Generate Content** - AI creates platform-specific posts
3. **Review & Correct** - Request changes per platform (unlimited versions)
4. **Approve** - Mark ready for publishing
5. **Schedule/Publish** - Deploy via Make or platform APIs

## Architecture

### Backend
- **Node.js + Express** - API server
- **SQLite** - Local database (not tracked in git)
- **OpenRouter** - AI content generation
- **Multer** - File uploads

### Frontend  
- **React + Vite** - Modern UI framework
- **React Router** - Navigation
- **Lucide Icons** - Beautiful icons
- **Custom Context** - Theme & notifications

## Environment Variables

### Backend (.env)
```env
PORT=3001
DATABASE_PATH=./data/scheduler.db
UPLOADS_DIR=./uploads

# Optional (can be set via UI /settings)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=x-ai/grok-4.1-fast:free
```

### Frontend (automatic proxy via Vite)
- Proxies `/api` to `http://localhost:3001`
- Proxies `/uploads` to `http://localhost:3001`

## Database Schema

Key tables:
- `briefs` - User content briefs
- `posts` - Platform-specific generated posts
- `post_versions` - Correction history
- `platforms` - Platform configuration
- `settings` - Global settings (API keys, prompts)

## Security Notes

🔒 **NEVER commit sensitive data:**
- API keys stored in `settings` table (local database)
- Database files (`.db`, `.sqlite`) ignored by git
- `.env` files never tracked
- User uploads in `/uploads` directory (ignored)

See [SECURITY.md](./SECURITY.md) for details.

## Contributing

1. Make changes on a feature branch
2. Test locally with both frontend and backend
3. Commit with descriptive messages
4. Push to GitHub
5. Create pull request

## Support

For issues or questions:
- Check existing documentation
- Review [Recent Fixes](./RECENT_FIXES.md)
- Review [API Reference](./API.md)

## License

[Your License Here]
