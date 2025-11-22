# Walkthrough - File Uploads for Briefs

I have implemented the ability to upload multiple files for briefs (documents for LLM context) and media (images/videos for posts).

## Changes

### Backend
- **Database**: Added `brief_files` table to store file metadata.
- **API**: Updated `POST /api/briefs` to handle `multipart/form-data` with multiple fields (`media`, `documents`).
- **Service**: Updated `content-generator.service.js` to:
    - Read text content from uploaded documents (.txt, .md, .csv, .json, etc.) and append it to the brief content for the LLM.
    - Use uploaded media files for Vision-capable models.

### Frontend
- **New Component**: `FileUploader`
    - Supports Drag & Drop.
    - Validates file count (max 5) and size (max 5MB).
    - Displays list of selected files with remove option.
    - Shows tooltip with requirements.
- **Page Update**: `NewBrief.jsx`
    - Replaced single media input with `FileUploader`.
    - Added new `FileUploader` for "Brief Files".

## Verification Results

### Automated Test
Ran `test-upload.js` to verify API functionality:
```
Sending request...
Response status: 200
Brief created: 1
Files attached: 2
✅ SUCCESS: 2 files uploaded correctly.
```

### Manual Verification Checklist
- [x] **Upload Limits**: Backend enforces 50MB limit (via multer) and logic checks for max 5 files per category.
- [x] **Brief Creation**: Successfully created brief with both document and media files.
- [x] **Context Injection**: Text files are read and added to the prompt context.
