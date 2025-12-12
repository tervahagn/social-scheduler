# Social Scheduler Roadmap

## Planned Features

### 🌐 Server Deployment
Currently the app runs locally. Planned server deployment will enable:
- Access from any device
- Always-on scheduling
- Team collaboration
- Make.com callback support

### 🔄 Make.com Callback Integration
WebSocket infrastructure is already implemented (`socket.service.js`), waiting for:

**Backend endpoint needed:**
```
POST /api/callback
```

**Make.com setup:**
1. After each platform module, add HTTP Request module
2. Send callback to: `https://your-server.com/api/callback`
3. Payload: `{ post_id, status: "published" | "failed", error_message }`

**Expected flow:**
```
Make.com → HTTP Request → Backend /api/callback
→ Update post status in DB
→ WebSocket emit → Frontend real-time update
```

### 📱 Mobile App (Future)
- React Native wrapper
- Push notifications for post status

---

## Current State (Dec 2025)

- ✅ Local-first SQLite database
- ✅ 9 platforms supported
- ✅ Quick Post + Calendar
- ✅ Make.com webhook integration (one-way)
- ✅ WebSocket server ready (unused until callback implemented)
- ⏳ Server deployment pending
- ⏳ Make.com callback pending
