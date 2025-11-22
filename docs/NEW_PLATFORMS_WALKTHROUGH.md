# Walkthrough: New Platforms and Post Sequence

I have added support for **Blog**, **Reddit**, and **YouTube Posts** platforms, configured their prompts (including a new "Ultra-Short Prompt" attribute), and enforced a specific post generation sequence.

## Changes

### 1. Database Updates
- Added `ultra_short_prompt` column to `platforms` table.
- Inserted new platforms:
    - **Blog**
    - **Reddit**
    - **YouTube Posts**
- Populated default prompts and ultra-short prompts for all platforms.

### 2. Backend Logic
- Updated `content-generator.service.js` to enforce the following generation sequence:
    1. Blog
    2. LinkedIn
    3. Google Business
    4. Reddit
    5. X (Twitter)
    6. Facebook
    7. Instagram
    8. YouTube Posts
- Updated `platforms.routes.js` to allow updating `ultra_short_prompt` via the API.

### 3. Frontend Updates
- Updated `Platforms.jsx` to include a new field for editing the **Ultra-Short Prompt**.
- Verified that `NewBrief.jsx` dynamically loads all available platforms.

## Important Instructions

### Post Generation Sequence
The system now strictly enforces the following order when generating posts:
1. **Blog** (Long-form content)
2. **LinkedIn** (Professional update)
3. **Google Business** (Business update)
4. **Reddit** (Community discussion)
5. **X (Twitter)** (Short update)
6. **Facebook** (Social update)
7. **Instagram** (Visual update)
8. **YouTube Posts** (Community engagement)

### Ultra-Short Prompts
- A new "Ultra-Short Prompt" field has been added to all platforms.
- This is intended for generating very concise updates or summaries.
- You can edit this prompt in the **Platforms** page, under the "Prompt Settings" section.

## Verification Results

### API Verification
The `GET /api/platforms` endpoint now returns the new platforms with their configured prompts.

### User Interface
- **Platforms Page**: You can now see and configure Blog, Reddit, and YouTube Posts. You can also edit the "Ultra-Short Prompt" for any platform.
- **New Brief Page**: When creating a brief, you can select the new platforms.
- **Generation**: Posts will be generated in the specific order defined above.
