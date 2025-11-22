# Social Scheduler

**Content Distribution Automation** — a proprietary system for generating and publishing posts to social networks with full control.

## Features

- 📝 **Single Brief** → posts for all platforms (LinkedIn, Facebook, Instagram, X, Google Business)
- 🤖 **OpenRouter Generation** — use any LLM model (GPT-4, Claude, Gemini, Llama)
- ✏️ **Preview and Editing** — full control before publishing
- 🚀 **Auto-publishing** via Make.com webhooks
- 🔧 **Extensibility** — easily add new platforms via prompts in .md files

## 🏗️ Architecture

**Self-hosted, local-first application** running on your machine. All data stored in SQLite database in project folder.

👉 **See [ARCHITECTURE.md](./ARCHITECTURE.md)** for detailed architecture documentation.

```
social-scheduler/
├── backend/           # Express.js + SQLite + OpenRouter
│   ├── src/
│   │   ├── api/       # REST endpoints
│   │   ├── services/  # Generation and publishing
│   │   └── database/  # SQLite schema
│   └── prompts/       # .md prompts for platforms
└── frontend/          # React + Vite
    └── src/
        ├── pages/     # NewBrief, Preview, History, Platforms
        └── services/  # API client
```

## Quick Start

### 1. Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configuration

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
PORT=3001
DATABASE_PATH=./data/scheduler.db
UPLOADS_DIR=./uploads
```

Get your API key at [openrouter.ai](https://openrouter.ai/)

### 3. Database Initialization

```bash
cd backend
npm run init-db
```

### 4. Launch

```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

Open http://localhost:3000

## Make.com Setup

Create a scenario for each platform:

1. **Webhook → Watch for incoming data**
2. Get the webhook URL (e.g.: `https://hook.eu1.make.com/xxxxx`)
3. In Social Scheduler: **Platforms** → select platform → **Configure** → paste webhook URL
4. In Make.com configure publishing (LinkedIn API, Facebook API, etc.)

**Payload structure from Social Scheduler:**

```json
{
  "platform": "linkedin",
  "content": "Ready post...",
  "media_url": "/uploads/image.jpg",
  "media_type": "image/jpeg",
  "link_url": "https://example.com",
  "post_id": 123,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Workflow

1. **Create Brief** — text, link, media
2. **Generation** — posts are automatically created for all active platforms
3. **Edit** — modify content if needed
4. **Approve** — mark ready posts
5. **Publish** — click "Publish All" → posts go to Make.com → publication

## Adding a New Platform

### 1. Create Prompt

Create file `backend/prompts/youtube.md`:

```markdown
You are creating a description for a YouTube video...

**Requirements:**
- Up to 5000 characters
- SEO-optimized

**Brief:**
{{brief}}
```

### 2. Add to Database

```sql
INSERT INTO platforms (name, display_name, prompt_file, is_active) 
VALUES ('youtube', 'YouTube', 'youtube.md', 1);
```

Or via UI: **Platforms** → **Add** (if implemented)

### 3. Configure Make.com webhook

## Editing Prompts

Simply edit the `.md` files in `backend/prompts/`:

- `linkedin.md`
- `facebook.md`
- `instagram.md`
- `twitter.md`
- `google-business.md`

Changes apply immediately on the next generation.

## API Endpoints

### Briefs

- `POST /api/briefs` — create brief
- `GET /api/briefs` — list briefs
- `POST /api/briefs/:id/generate` — generate posts

### Posts

- `PUT /api/posts/:id` — edit
- `POST /api/posts/:id/approve` — approve
- `POST /api/posts/:id/publish` — publish

### Publishing

- `POST /api/publish/brief/:id` — publish all approved

### Platforms

- `GET /api/platforms` — list
- `PUT /api/platforms/:id` — update settings

## Troubleshooting

**OpenRouter generation error:**
- Check `OPENROUTER_API_KEY` in `.env`
- Check balance at openrouter.ai
- Try a different model in `OPENROUTER_MODEL`

**Publishing not working:**
- Check webhook URL in platform settings
- Check Make.com scenario logs
- Ensure post is approved (status = 'approved')

**Database:**
- Reinitialize: `npm run init-db`
- Database file: `./data/scheduler.db`

## Technologies

- **Backend:** Express.js, SQLite (better-sqlite3), OpenRouter (OpenAI SDK)
- **Frontend:** React, Vite, React Router, Lucide Icons
- **Generation:** OpenRouter API (GPT-4, Claude, Gemini, etc.)
- **Publishing:** Make.com webhooks

## License

MIT — do whatever you want 🚀
