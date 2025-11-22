# Master Draft Workflow Walkthrough

We have successfully implemented the iterative **Master Draft** workflow! 🚀

## New Workflow Overview

1. **Create Brief** → 2. **Master Draft** (Iterate & Refine) → 3. **Approve** → 4. **Generate Platform Posts** → 5. **Publish**

---

## Step-by-Step Guide

### 1. Create Brief & Start Draft
- Go to **New Brief** page.
- Enter your content, link, and select platforms.
- Click **"Create & Start Draft"** (previously "Create & Generate").
- You will be redirected to the new **Master Draft** page.

### 2. Refine Master Draft
On the Master Draft page, you will see the initial AI-generated text based on your `master_prompt`.

**If you want changes:**
- Type your feedback in the "Request Changes" box (e.g., *"Make it more professional"* or *"Focus more on the pricing"*).
- Click **Send**.
- A **new version** (v2, v3, etc.) will be generated.
- You can switch between versions using the **History** sidebar.

### 3. Approve Master Draft
- Once you are happy with a version, click **"Approve This Version"**.
- The status changes to **Approved**.
- The "Generate Platform Posts" button appears.

### 4. Generate Platform Posts
- Click **"Generate Platform Posts"**.
- The system will take your **Approved Master Draft** and adapt it for each selected platform (LinkedIn, Twitter, etc.) using their specific prompts.
- You are redirected to the **Preview** page.

### 5. Final Polish & Publish
- Review the platform-specific posts.
- Edit if necessary.
- **Approve** each post.
- Click **"Publish All"** to send to Make.com.

---

## Key Changes

### 🆕 Master Draft Page
A dedicated workspace to perfect your core message before splitting it into platform-specific formats.

### 🔄 Version History
Track changes and revert to previous versions if needed.

### 🎯 Better Quality
By refining the master text first, all platform posts share a higher-quality, approved foundation.

---

## Technical Details
- **Database**: New `master_drafts` table stores all versions.
- **API**: New endpoints for iterative generation (`/api/masters/*`).
- **Migration**: Existing data is preserved; new flow applies to new briefs.
