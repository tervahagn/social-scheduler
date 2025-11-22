# Add OpenRouter Configuration to Settings UI

## Goal

Add OpenRouter API key and LLM model selection to the Settings page UI, allowing users to configure these settings through the web interface instead of manually editing the `.env` file. These settings will be stored in the database and take precedence over environment variables when set.

## User Review Required

> [!IMPORTANT]
> **Security Consideration**: The OpenRouter API key will be stored in the database in plain text. For production use, consider encrypting sensitive data. For now, we'll implement basic storage as a starting point.

> [!NOTE]
> **Fallback Behavior**: If settings are not found in the database, the system will fall back to using values from `.env` file, ensuring backward compatibility.

## Proposed Changes

### Backend

#### [MODIFY] [openrouter.service.js](file:///Users/tervahagn/REPORSITORIES/Social%20Scheduler/backend/src/services/openrouter.service.js)

Update to read OpenRouter API key and model from database settings first, with fallback to environment variables:
- Add function to fetch settings from database
- Update `openrouter` initialization to use database settings
- Update `DEFAULT_MODEL` to use database settings
- Keep `.env` as fallback for backward compatibility

#### [MODIFY] [settings.routes.js](file:///Users/tervahagn/REPORSITORIES/Social%20Scheduler/backend/src/api/settings.routes.js)

Add endpoint to fetch multiple settings at once for convenience:
- Add `GET /api/settings` endpoint to fetch all settings
- Keep existing `GET /api/settings/:key` and `PUT /api/settings/:key` endpoints

---

### Frontend

#### [MODIFY] [Settings.jsx](file:///Users/tervahagn/REPORSITORIES/Social%20Scheduler/frontend/src/pages/Settings.jsx)

Add UI components for OpenRouter configuration:
- Add input field for OpenRouter API key (masked password field)
- Add dropdown/select for choosing LLM model with popular options:
  - anthropic/claude-3.5-sonnet (default)
  - openai/gpt-4-turbo
  - openai/gpt-4o
  - google/gemini-pro-1.5
  - meta-llama/llama-3.1-70b-instruct
  - Custom option to enter any model ID
- Add fetch/save logic for these new settings
- Group settings into sections (OpenRouter Config, Master Prompt)
- Show current values from database or indicate if using `.env` fallback

## Verification Plan

### Automated Tests

No existing automated tests were found. We will perform manual testing.

### Manual Verification

1. **Test Settings UI**:
   - Open browser and navigate to `http://localhost:5173/settings`
   - Verify that OpenRouter API Key field is visible
   - Verify that Model Selection dropdown is visible with predefined options
   - Verify that current values are loaded from database or show placeholder

2. **Test Save Functionality**:
   - Enter a new API key (or test key)
   - Select a different model from dropdown
   - Click "Save" button
   - Verify success message appears
   - Refresh the page and verify settings persist

3. **Test OpenRouter Integration**:
   - Navigate to Briefs page
   - Create a new brief with sample content
   - Generate content for a platform
   - Verify that content generation uses the configured model (check logs)
   - Verify that the configured API key is being used

4. **Test Fallback to .env**:
   - Use database settings and verify it works
   - Clear OpenRouter settings from database (via API or direct DB access)
   - Verify system falls back to `.env` values
   - Check logs to confirm fallback behavior

5. **Test Different Models**:
   - Try generating content with different models
   - Verify content is generated successfully
   - Compare results from different models (optional, for quality check)
