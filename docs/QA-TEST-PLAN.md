# Social Scheduler — QA Test Plan

## Overview

| Component | Technology | Status |
|-----------|------------|--------|
| Frontend | React + Vite | `http://localhost:3000` |
| Backend | Express.js | `http://localhost:3001` |
| Database | SQLite | `backend/data/scheduler.db` |
| WebSocket | Socket.io | `ws://localhost:3001` |
| AI | OpenRouter API | Configurable model |
| Media | Cloudinary | Image/video upload |
| Automation | Make.com | Webhook integration |

---

## 1. Frontend Tests

### 1.1 Navigation
| Test | Steps | Expected |
|------|-------|----------|
| Logo click | Click logo | → `/intro` |
| Quick Post | Click "Quick" | → `/quick-post` |
| Create Brief | Click "Create" | → `/` (NewBrief) |
| Content | Click "Content" | → `/content` with tabs |
| Calendar | Click "Calendar" | → `/calendar` |
| Platforms | Click "Platforms" | → `/platforms` |
| Settings | Click "Settings" | → `/settings` |

### 1.2 Quick Post (`/quick-post`)
| Test | Steps | Expected |
|------|-------|----------|
| Text input | Enter text | Text displays in textarea |
| Platform selection | Toggle platforms | Checkboxes toggle, count updates |
| Image upload | Upload image | Preview shows, Cloudinary URL generated |
| Publish | Click "Publish" | Posts sent to Make.com, success toast |
| Empty validation | Publish without content | Error toast |

### 1.3 New Brief (`/new` or `/`)
| Test | Steps | Expected |
|------|-------|----------|
| Title input | Enter title | Saved to state |
| Content input | Enter content | Saved to state |
| Platform selection | Toggle platforms | Platforms selected |
| File upload | Upload document | File attached |
| Image upload | Upload image | Image attached |
| Link URL | Enter URL | Saved to state |
| Create Brief | Click "Create" | Brief created, redirect to editor |

### 1.4 Content Editor (`/brief/:id/edit`)
| Test | Steps | Expected |
|------|-------|----------|
| Load posts | Open editor | Posts loaded for each platform |
| Edit post | Edit textarea | Content updates |
| Approve post | Click "Approve" | Status → `approved` |
| Reject post | Click "Reject" | Post regenerated |
| Schedule post | Click "Schedule" | Modal opens, datetime picker |
| Publish single | Click "Publish" | Post sent to Make.com |
| Publish all | Click "Publish All" | All approved posts sent |

### 1.5 Content Page (`/content`)
| Test | Steps | Expected |
|------|-------|----------|
| Posts tab | Click "Posts" | All posts displayed |
| Briefs tab | Click "Briefs" | All briefs displayed |
| Status filter | Click status button | Filtered results |
| Source filter | Click source button | Brief/Quick filtered |
| Grid/List toggle | Toggle view | Layout changes |
| Click post | Click on post | Navigate to editor |
| Delete brief | Click delete | Confirmation, brief removed |

### 1.6 Calendar (`/calendar`)
| Test | Steps | Expected |
|------|-------|----------|
| Load posts | Open calendar | Posts with dates displayed |
| Quick posts | Check presence | Quick posts visible |
| Click post | Click on post | Navigate to editor |

### 1.7 Settings (`/settings`)
| Test | Steps | Expected |
|------|-------|----------|
| OpenRouter API Key | Enter/save | Key saved to DB |
| Model selection | Select model | Model saved |
| Make.com Webhook | Enter URL | URL saved to DB |
| Cloudinary config | Enter credentials | Saved to DB |
| Save button | Click save | Success toast |

### 1.8 Platforms (`/platforms`)
| Test | Steps | Expected |
|------|-------|----------|
| List platforms | Open page | All platforms listed |
| Toggle active | Toggle switch | Platform enabled/disabled |
| Edit prompt | Click edit | Prompt modal opens |
| Save prompt | Save changes | Prompt updated |

---

## 2. Backend API Tests

### 2.1 Briefs API

```bash
# Create brief
curl -X POST http://localhost:3001/api/briefs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content","selected_platforms":"[1,2]"}'

# List briefs
curl http://localhost:3001/api/briefs

# Get brief
curl http://localhost:3001/api/briefs/1

# Generate posts
curl -X POST http://localhost:3001/api/briefs/1/generate

# Get posts for brief
curl http://localhost:3001/api/briefs/1/posts

# Delete brief
curl -X DELETE http://localhost:3001/api/briefs/1
```

### 2.2 Posts API

```bash
# Get post
curl http://localhost:3001/api/posts/1

# Edit post
curl -X PUT http://localhost:3001/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"edited_content":"Updated content"}'

# Approve post
curl -X POST http://localhost:3001/api/posts/1/approve

# Publish post
curl -X POST http://localhost:3001/api/posts/1/publish

# Schedule post
curl -X POST http://localhost:3001/api/posts/1/schedule \
  -H "Content-Type: application/json" \
  -d '{"scheduled_at":"2025-12-10T10:00:00Z"}'

# Status callback (from Make.com)
curl -X POST http://localhost:3001/api/posts/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"published","platform":"linkedin","link_url":"https://linkedin.com/post/123"}'
```

### 2.3 Quick Post API

```bash
# Create quick post
curl -X POST http://localhost:3001/api/quick-post \
  -H "Content-Type: application/json" \
  -d '{"content":"Quick test","platforms":[1,2]}'
```

### 2.4 History API

```bash
# Get unified history
curl "http://localhost:3001/api/history?status=published&source=quick"
```

### 2.5 Calendar API

```bash
# Get all posts for calendar
curl http://localhost:3001/api/calendar/all
```

---

## 3. Make.com Integration Tests

### 3.1 Webhook Configuration

**Webhook URL:** Stored in Settings → Make.com Webhook URL

**Payload sent to Make.com:**
```json
{
  "post_id": 123,
  "platform": "linkedin",
  "content": "Post content here...",
  "media_url": "https://res.cloudinary.com/...",
  "link_url": "https://example.com/article",
  "brief_title": "Brief title"
}
```

### 3.2 Test Scenarios

#### Test A: LinkedIn Company Post (with image)
```bash
curl -X POST https://hook.us1.make.com/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 1,
    "platform": "linkedin",
    "content": "Test post for LinkedIn Company",
    "media_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  }'
```

#### Test B: LinkedIn Personal Post (text only)
```bash
curl -X POST https://hook.us1.make.com/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 2,
    "platform": "linkedin-personal",
    "content": "Test post for LinkedIn Personal"
  }'
```

#### Test C: Twitter Post
```bash
curl -X POST https://hook.us1.make.com/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 3,
    "platform": "twitter",
    "content": "Test tweet #test"
  }'
```

#### Test D: Reddit Post
```bash
curl -X POST https://hook.us1.make.com/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 4,
    "platform": "reddit",
    "content": "Test Reddit post",
    "title": "Test Title"
  }'
```

#### Test E: Blog (HubSpot)
```bash
curl -X POST https://hook.us1.make.com/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 5,
    "platform": "hubspot-blog",
    "content": "<p>Blog content HTML</p>",
    "title": "Blog Title"
  }'
```

### 3.3 Make.com Scenario Structure

```
┌─────────────────┐
│    Webhook      │
│ (Custom Webhook)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Router      │
└────────┬────────┘
         │
    ┌────┼────┬────┬────┐
    ▼    ▼    ▼    ▼    ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│ LI   ││ LI   ││Twitter││Reddit││Blog  │
│Company││Personal│      │      │      │
└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘
   │       │       │       │       │
   ▼       ▼       ▼       ▼       ▼
┌──────────────────────────────────────┐
│         HTTP Callback Module         │
│   POST /api/posts/:id/status         │
└──────────────────────────────────────┘
```

### 3.4 Router Filter Conditions

| Path | Condition |
|------|-----------|
| LinkedIn Company | `{{1.platform}} = linkedin` AND `{{1.media_url}} exists` |
| LinkedIn Company (text) | `{{1.platform}} = linkedin` AND `{{1.media_url}} NOT exists` |
| LinkedIn Personal | `{{1.platform}} = linkedin-personal` |
| Twitter | `{{1.platform}} = twitter` |
| Reddit | `{{1.platform}} = reddit` |
| HubSpot Blog | `{{1.platform}} = hubspot-blog` |

### 3.5 Callback Configuration

**After each platform module, add HTTP module:**

```
Method: POST
URL: http://YOUR_SERVER:3001/api/posts/{{1.post_id}}/status
Headers: Content-Type: application/json
Body:
{
  "status": "published",
  "platform": "{{1.platform}}",
  "link_url": "{{result.url}}"
}
```

**On error:**
```json
{
  "status": "failed",
  "platform": "{{1.platform}}",
  "error": "{{error.message}}"
}
```

---

## 4. WebSocket Tests

### 4.1 Connection Test
1. Open browser DevTools → Network → WS
2. Look for connection to `ws://localhost:3001`
3. Should see `🔌 Client connected` in backend logs

### 4.2 Notification Test
```bash
# Simulate callback from Make.com
curl -X POST http://localhost:3001/api/posts/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"published","platform":"linkedin"}'
```

**Expected:** Toast notification appears in browser

---

## 5. Database Verification

### 5.1 Check Tables
```bash
sqlite3 backend/data/scheduler.db ".tables"
```

### 5.2 Verify Settings
```bash
sqlite3 backend/data/scheduler.db "SELECT key, value FROM settings"
```

### 5.3 Verify Platforms
```bash
sqlite3 backend/data/scheduler.db "SELECT id, name, display_name, is_active FROM platforms"
```

### 5.4 Check Posts Status
```bash
sqlite3 backend/data/scheduler.db "SELECT id, status, platform_id, published_at FROM posts ORDER BY id DESC LIMIT 10"
```

### 5.5 Check Quick Posts
```bash
sqlite3 backend/data/scheduler.db "SELECT * FROM quick_posts ORDER BY id DESC LIMIT 5"
sqlite3 backend/data/scheduler.db "SELECT * FROM quick_post_items ORDER BY id DESC LIMIT 10"
```

---

## 6. Error Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| No OpenRouter API key | Error toast on generate |
| No Make.com webhook | Error toast on publish |
| No Cloudinary config | Error on image upload |
| Invalid platform | 404 error |
| Network error | Retry or error toast |
| Rate limit | Error message displayed |

---

## 7. Checklist

### Pre-Launch
- [ ] OpenRouter API key configured
- [ ] Make.com webhook URL configured
- [ ] Cloudinary credentials configured
- [ ] All platforms have prompts
- [ ] At least one platform is active
- [ ] Database initialized

### E2E Flow Test
- [ ] Create brief with content and image
- [ ] Select multiple platforms
- [ ] Generate posts (AI)
- [ ] Edit post content
- [ ] Approve all posts
- [ ] Publish all posts
- [ ] Verify in Make.com history
- [ ] Verify callback received
- [ ] Verify toast notification
- [ ] Check post status in DB
- [ ] Check Calendar shows post

### Quick Post Flow
- [ ] Enter content
- [ ] Select platforms
- [ ] Upload image
- [ ] Publish
- [ ] Verify in Calendar
- [ ] Verify in Content → Posts

---

## 8. Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| Google My Business API v4 deprecated | 🔴 Blocked | Wait for Make.com module update |
| LinkedIn duplicate content error | ⚠️ Normal | Use unique content |
| WebSocket reconnection | ⚠️ Manual | Refresh page |

---

## 9. Make.com Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Webhook not receiving data` | Wrong URL | Check Settings → Webhook URL |
| `422 Validation failed` | Missing fields | Check Router filters |
| `401 Unauthorized` | Token expired | Reconnect platform in Make.com |
| `429 Rate limit` | Too many requests | Add delay module |
| `500 Internal error` | Platform issue | Check Make.com logs |

### Debug Steps
1. Open Make.com → Scenario → History
2. Click failed execution
3. Check input bundle data
4. Check module error message
5. Fix filter or mapping issue
