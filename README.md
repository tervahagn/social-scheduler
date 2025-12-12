# Social Scheduler

Open-source tool for managing social media content. Post to 9 platforms from one place.

## Features

- ⚡ **Quick Post** — write once, publish to multiple platforms instantly
- 📅 **Calendar** — schedule posts, see everything in one view
- 🤖 **AI Generation** — create platform-specific posts from a single brief
- 🔗 **Make.com Integration** — webhook-based publishing to any platform
- 🏠 **Self-Hosted** — runs locally, your data stays on your machine

## Supported Platforms

LinkedIn (Personal & Company) · Facebook · Instagram · X (Twitter) · Reddit · YouTube Community · Google Business · Blog

## Quick Start

```bash
# Clone
git clone https://github.com/tervahagn/social-scheduler.git
cd social-scheduler

# Install
cd backend && npm install
cd ../frontend && npm install

# Configure
cp .env.example .env
# Edit .env with your OpenRouter API key

# Run
./start.sh
```

Open http://localhost:3000

## Configuration

Create `.env` in root:

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=x-ai/grok-4.1-fast:free
```

Get API key at [openrouter.ai](https://openrouter.ai/)

## Make.com Setup

1. Create a scenario with **Custom Webhook** trigger
2. Copy webhook URL
3. Paste in Settings → Webhook URL
4. Add Router + platform modules (LinkedIn, Facebook, etc.)

Payload sent to webhook:
```json
{
  "platform": "linkedin-personal",
  "content": "Your post text...",
  "media_url": "https://cloudinary.com/...",
  "brief_title": "For Reddit",
  "scheduled_at": "2025-12-12T10:00:00Z"
}
```

## Tech Stack

- **Backend:** Node.js, Express, SQLite
- **Frontend:** React, Vite
- **AI:** OpenRouter (GPT-4, Claude, Gemini, Llama)
- **Publishing:** Make.com webhooks
- **Media:** Cloudinary

## License

MIT
