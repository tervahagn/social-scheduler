# 🔌 The Ultimate Make.com Integration Guide
*For Social Scheduler*

This guide will walk you through connecting your Social Scheduler to the outside world using **Make.com**. We will build a "Mission Control" scenario that receives all your posts and intelligently routes them to the correct platform (LinkedIn, Instagram, HubSpot, etc.).

---

## 🧠 The Concept
Instead of creating a separate connection for every single platform, we use **one master connection**. 

1. **Social Scheduler** sends a package (your post) to **Make.com**.
2. **Make.com** opens the package and checks the label (e.g., "This is for LinkedIn").
3. **Make.com** sends it to the correct destination.

---

## Phase 1: The Handshake (Connecting the Apps)

### Step 1: Create the Scenario
1. Log in to **Make.com**.
2. Click **+ Create a new scenario** (top right).
3. Click the big purple **+** button in the middle of the screen.

### Step 2: Create the Webhook (The Receiver)
1. Search for **"Webhooks"** (look for the purple icon with a lightning bolt/hook).
2. Select **"Custom webhook"**.
3. Click **Add**.
4. Give it a name like *"Social Scheduler Master Hook"*.
5. Click **Save**.
6. You will see a URL that looks like `https://hook.make.com/...`. **Click "Copy address to clipboard"**.

### Step 3: Connect Social Scheduler
1. Open your **Social Scheduler** app.
2. Go to the **Settings** page.
3. Find the **Make.com Webhook Integration** section.
4. **Paste** the URL you just copied into the "Webhook URL" field.
5. Click **Save Settings**.

✅ **Checkpoint:** Your Social Scheduler can now talk to Make.com!

---

## Phase 2: The Traffic Controller (The Router)

Now we need to tell Make.com how to sort the mail.

1. Go back to your Make.com scenario.
2. You should see your Webhook module. Hover over its right side to see a little "ear" or semi-circle.
3. Click that "ear" to add a new module connected to it.
4. Search for **"Flow Control"** (icon looks like two arrows splitting).
5. Select **"Router"**.

**What you see now:**
You should have the **Webhook** connected to a **Router**, which splits into two (or more) empty paths.

---

## Phase 3: The Destinations (Setting up Platforms)

You will create a "path" for each platform you use. Let's set up **HubSpot Blog** first, as requested.

### 📝 Path A: The Blog (HubSpot CMS)

1. Click one of the empty dots coming out of the **Router**.
2. Search for **"HubSpot CRM"** (orange icon).
3. Select **"Create a Blog Post"** (you might need to search for "blog" inside the HubSpot list).
4. **Connection**: Click "Add" to connect your HubSpot account if you haven't already.

#### Configuration (The Important Part)
Now you map the data from Social Scheduler to HubSpot fields:

*   **Name (Title)**: Click inside the box. A panel appears. Find and click `brief` -> `title`.
*   **Post Body**: Click inside. Find and click `content`.
*   **Blog Author**: Select your author from the list.
*   **Content Group (Blog)**: Select which blog you want to post to (e.g., "Company News").
*   **State**: Set to `PUBLISHED` (to go live immediately) or `DRAFT` (to review first).

#### The Filter (Ensuring only Blogs go here)
1. Click the **wrench icon** (settings) on the line *between* the Router and the HubSpot module.
2. **Label**: Type "Is Blog".
3. **Condition**:
    *   First box: Click and select `platform` (from the pink Webhook data).
    *   Middle box: Keep as "Equal to".
    *   Last box: Type `blog` (all lowercase).
4. Click **OK**.

---

## Phase 4: The Socials (LinkedIn, Twitter, etc.)

Repeat the process for your other platforms.

### 💼 Path B: LinkedIn (Example)
1. Click the **Router** center again to add another path.
2. Search for **"LinkedIn"**.
3. Select **"Create a Text Post"** (or Image Post).
4. **Connection**: Connect your LinkedIn account.
5. **Content**: Map the `content` field from the Webhook.
6. **Filter**:
    *   Click the line connecting Router to LinkedIn.
    *   Label: "Is LinkedIn".
    *   Condition: `platform` **Equal to** `linkedin`.

### 🐦 Path C: Twitter/X (Example)
1. Add another path from the Router.
2. Search for **"Twitter"** (or "X").
3. Select **"Create a Tweet"**.
4. **Content**: Map the `content` field.
5. **Filter**:
    *   Label: "Is Twitter".
    *   Condition: `platform` **Equal to** `twitter`.

---

## Phase 5: Turn it On!

1. Click the **Save** icon (floppy disk) at the bottom of Make.com.
2. Toggle the big **Scheduling** switch to **ON** (bottom left).

🎉 **You are done!**
Now, when you click "Publish" in Social Scheduler:
*   If it's a Blog post -> It zooms to HubSpot.
*   If it's a LinkedIn post -> It flies to LinkedIn.
*   If it's a Tweet -> It lands on Twitter.
