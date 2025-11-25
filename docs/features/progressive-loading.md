# Progressive Platform Content Loading

## Feature Overview
Progressive loading for platform content generation provides instant visual feedback by displaying platform cards immediately with loading states, then updating each card progressively as LLM generates content.

## User Experience

### Before
1. Click "Generate Platform Content"
2. Wait 10-20 seconds with single spinner
3. All platforms appear at once

### After
1. Click "Generate Platform Content"
2. **Instantly** see all platform cards with loading spinners
3. Watch each card populate as content is generated
4. Much better perceived performance

## Implementation Details

### Backend Changes

#### Files Modified:
- `backend/src/services/content-generator.service.js`
- `backend/src/api/content.routes.js`

#### New Functions:

**`createPlaceholderPosts(briefId)`**
```javascript
// Creates empty post records with status: 'generating'
// Returns immediately for instant UI feedback
// Posts have platform info but empty content
```

**`generateContentForPosts(briefId)`**
```javascript
// Updates existing placeholder posts asynchronously
// Generates content using LLM for each platform
// Changes status from 'generating' to 'draft' when complete
```

#### API Route:
```javascript
POST /api/content/brief/:briefId/generate

// Returns: Array of placeholder posts immediately
// Background: Generates content asynchronously
```

### Frontend Changes

#### File Modified:
- `frontend/src/pages/ContentEditor.jsx`

#### Implementation:
```javascript
handleGenerateContent() {
  1. Call API → get placeholder posts
  2. Display cards immediately with loading states
  3. Start polling every 1.5 seconds
  4. Update posts as content arrives
  5. Stop when all posts complete
}
```

### Status Flow

```
Created      → status: 'generating', content: ''
Generating   → (LLM processing in background)
Complete     → status: 'draft', content: '<text>'
```

### Polling Strategy

- **Interval:** 1.5 seconds
- **Check:** Posts with `status === 'generating'` or empty `content`
- **Update:** Refresh `loadingPosts` Set based on current state
- **Timeout:** 2 minutes maximum to prevent infinite polling

## Configuration

No configuration needed. Feature works out of the box.

## Performance Considerations

### Polling Load
- ~40 requests/minute during active generation
- Normal generation: 2-3 minutes for 3-4 platforms
- Acceptable tradeoff for better UX

### Future Optimizations
If polling becomes an issue:
- **Server-Sent Events (SSE)** - Real-time push updates
- **WebSockets** - Bi-directional communication
- **Webhooks** - Callback when content ready

## Error Handling

- Backend generation errors logged but don't crash
- Frontend polling errors don't break the cycle
- 2-minute timeout prevents stuck states
- Placeholder posts always created even if generation fails

## Testing

1. Navigate to brief edit page without existing posts
2. Click "Generate Platform Content"
3. Verify:
   - Cards appear instantly
   - Loading spinners show on each card
   - Cards populate progressively
   - Success message when complete

## Troubleshooting

**Cards don't appear immediately:**
- Check backend is creating placeholder posts
- Verify API returns placeholders array

**Cards never update:**
- Check polling is running (console logs)
- Verify background generation is working
- Check database for post status changes

**Infinite polling:**
- Verify timeout is set (2 minutes)
- Check posts eventually get `status: 'draft'`

## Related Features

- Individual platform publishing
- Platform name preservation
- Loading state management

---

**Implementation Date:** November 24, 2025  
**Version:** 1.0
