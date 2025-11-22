# Social Scheduler - Setup & Usage Guide

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenRouter API key (get from [openrouter.ai](https://openrouter.ai))

### Installation

1. **Clone and Install**
   ```bash
   cd "Social Scheduler"
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your OPENROUTER_API_KEY
   ```

3. **Initialize Database**
   ```bash
   cd backend
   node src/database/init.js
   ```

4. **Start the Application**
   ```bash
   # From project root
   ./start.sh
   # Or manually:
   # Terminal 1: cd backend && npm run dev
   # Terminal 2: cd frontend && npm run dev
   ```

5. **Access the App**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

---

## Application Workflow

### 1. Configure Settings
1. Go to **Settings** page
2. Add your OpenRouter API key
3. Select LLM model (default: `x-ai/grok-4.1-fast:free`)
4. Optional: Customize the master prompt

### 2. Configure Platforms
1. Go to **Platforms** page
2. Review 9 available platforms (ordered):
   - Blog
   - LinkedIn (Company)
   - LinkedIn (Personal)
   - Reddit
   - Google Business
   - X (Twitter)
   - YouTube Posts
   - Facebook
   - Instagram
3. Toggle platforms on/off as needed
4. Optional: Add webhook URLs for publishing
5. Optional: Customize platform-specific prompts

### 3. Create a Brief
1. Go to **New Brief** page
2. Enter title and content
3. Optional: Add link URL
4. Optional: Upload media files or documents
5. Select target platforms (all selected by default)
6. Click **Create & Start Draft**

### 4. Master Content Workflow
1. System generates master content using Master Prompt
2. **Review** the generated content
3. **Request changes** if needed (creates new version)
4. **Approve** when satisfied
5. Click **Generate Posts** to create platform-specific content

### 5. Review & Publish Posts
1. Review generated posts for each platform
2. Edit posts if needed
3. Approve posts
4. Publish to platforms (manual copy or webhook)

### 6. Track Analytics
1. Go to **Analytics** page
2. View funnel metrics (briefs → generated → approved → published)
3. Check platform performance
4. Monitor top performing posts (when metrics are collected)

---

## Key Features

### Master Draft System
- Create a refined master version of your content
- Iterate with AI corrections until perfect
- Version history tracks all changes
- Approve when ready to proceed

### Platform-Specific Generation
- Each platform gets tailored content
- Respects character limits and format requirements
- Platform-specific tone and style
- Automatic optimization for each channel

### Multi-File Support
- Upload images, documents, videos
- AI considers all uploaded content
- Separate media and document categories

### Webhook Integration
- Configure webhook URLs per platform
- Automated publishing (when implemented)
- Direct integration with Make.com or Zapier

---

## Database Location

- SQLite database: `backend/data/scheduler.db`
- Uploaded files: `backend/uploads/`
- To reset: Delete database file and run `node src/database/init.js`

---

## Default Model

The application defaults to `x-ai/grok-4.1-fast:free` which is:
- Free to use
- Fast generation
- Good quality for social content

You can change this in Settings or via the `OPENROUTER_MODEL` environment variable.

---

## Troubleshooting

### API Key Issues
- Ensure API key starts with `sk-or-v1-`
- Check OpenRouter account has credits
- API key can be in Settings or `.env` file

### Platform Not Showing
- Check platform is active in Platforms page
- Database should have all 9 platforms
- Restart backend if platforms were just added

### Generation Fails
- Check API key is valid
- Verify OpenRouter has credits
- Check backend logs for errors
- Ensure network connection is stable

### Database Issues
- Backup important data first
- Delete `backend/data/scheduler.db`
- Run `node src/database/init.js` to recreate
- All platforms will be re-seeded

---

## Support

For issues or questions:
1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify `.env` file is configured correctly
4. Ensure all npm packages are installed
