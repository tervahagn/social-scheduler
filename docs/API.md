# API Documentation

## Base URL
`http://localhost:3001/api`

---

## Endpoints

### Briefs

#### Create Brief
```
POST /api/briefs
Content-Type: multipart/form-data

Body:
- title: string
- content: string
- link_url: string (optional)
- selected_platforms: JSON array of platform IDs
- media: file[] (optional)
- documents: file[] (optional)
```

#### Get Brief
```
GET /api/briefs/:id
```

#### Get All Briefs
```
GET /api/briefs
```

---

### Master Drafts

#### Get Master Drafts for Brief
```
GET /api/briefs/:briefId/master-drafts
```

#### Generate Master Draft
```
POST /api/briefs/:briefId/master-draft
```

#### Correct Master Draft
```
POST /api/master-drafts/:id/correct
Body: { correction_prompt: string }
```

#### Approve Master Draft
```
POST /api/master-drafts/:id/approve
```

#### Generate Posts from Master
```
POST /api/master-drafts/:id/generate-posts
```

---

### Posts

#### Get Posts for Brief
```
GET /api/briefs/:briefId/posts
```

#### Update Post
```
PUT /api/posts/:id
Body: { edited_content: string }
```

#### Approve Post
```
POST /api/posts/:id/approve
```

#### Publish Post
```
POST /api/posts/:id/publish
```

---

### Platforms

#### Get All Platforms
```
GET /api/platforms
Returns platforms in preferred order
```

#### Get Platform
```
GET /api/platforms/:id
```

#### Update Platform
```
PUT /api/platforms/:id
Body: {
  webhook_url: string,
  is_active: boolean,
  prompt_content: string
}
```

---

### Settings

#### Get All Settings
```
GET /api/settings
```

#### Get Setting
```
GET /api/settings/:key
```

#### Update Setting
```
PUT /api/settings/:key
Body: { value: string }
```

**Available Settings:**
- `master_prompt`: Master content generation prompt
- `openrouter_api_key`: OpenRouter API key
- `openrouter_model`: LLM model ID

---

### Analytics

#### Get Dashboard Data
```
GET /api/analytics/dashboard

Response: {
  funnel: {
    briefs: number,
    generated: number,
    approved: number,
    published: number
  },
  platforms: [{
    platform: string,
    total_posts: number,
    avg_edits: number,
    avg_gen_time: number,
    published_count: number
  }],
  topPosts: [{
    id: number,
    platform: string,
    content: string,
    likes: number,
    comments: number,
    shares: number,
    engagement_rate: number
  }]
}
```

#### Submit Post Metrics (Webhook)
```
POST /api/analytics/posts/:id/metrics
Body: {
  likes: number,
  comments: number,
  shares: number,
  impressions: number,
  reach: number,
  clicks: number
}
```

---

## Database Schema

### Tables

**briefs**
- id, title, content, media_url, media_type, link_url
- selected_platforms (JSON array)
- created_at, updated_at

**platforms**
- id, name, display_name, webhook_url
- prompt_file, prompt_content, ultra_short_prompt
- is_active, config (JSON)
- created_at

**master_drafts**
- id, brief_id, version, content
- correction_prompt, status
- created_at

**posts**
- id, brief_id, platform_id, master_draft_id
- content, edited_content, status
- generation_time_ms, edit_count
- scheduled_at, approved_at, published_at
- created_at, updated_at

**brief_files**
- id, brief_id, file_path, original_name
- mime_type, file_size, category
- created_at

**post_metrics**
- id, post_id, collected_at
- likes, comments, shares
- impressions, reach, clicks
- engagement_rate, raw_data (JSON)

**settings**
- id, key, value
- created_at, updated_at

**analytics_events**
- id, event_type, entity_id, entity_type
- metadata (JSON), created_at

**publish_queue**
- id, post_id, status
- attempts, max_attempts
- last_error, scheduled_at, completed_at

---

## Platform Sequence

Platforms are always returned in this order:
1. blog
2. linkedin (Company)
3. linkedin-personal (Personal)
4. reddit
5. google-business
6. twitter (X)
7. youtube-posts
8. facebook
9. instagram

This order is maintained in:
- GET /api/platforms
- Post generation
- Frontend displays

---

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad request (validation error)
- 404: Resource not found
- 500: Server error

---

## File Uploads

**Supported file types:**
- Images: jpg, jpeg, png, gif, webp
- Videos: mp4, mov, avi
- Documents: pdf, doc, docx, txt

**Size limits:**
- Configurable in backend
- Default: Check multer configuration

**Storage:**
- Files stored in `backend/uploads/`
- Organized by brief ID
- Original filenames preserved

---

## LLM Integration

### OpenRouter Configuration

The app uses OpenRouter API for content generation.

**Priority:**
1. Database settings (openrouter_api_key, openrouter_model)
2. Environment variables (OPENROUTER_API_KEY, OPENROUTER_MODEL)
3. Default model: `x-ai/grok-4.1-fast:free`

**Request Format:**
```javascript
{
  model: "x-ai/grok-4.1-fast:free",
  messages: [{
    role: "user",
    content: "Combined prompt + brief content"
  }]
}
```

**Timeout:**
- 60 seconds for generation
- Handles rate limits
- Error messages returned to user
