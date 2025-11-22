# Analytics & Engagement Metrics Walkthrough

## 🚀 Features Implemented

1.  **Analytics Dashboard**: A new "Analytics" page in the sidebar showing:
    *   **Funnel**: Briefs → Generated → Approved → Published
    *   **Platform Performance**: Which platforms are most active
    *   **Top Performing Posts**: Best posts based on engagement

2.  **Internal Tracking**:
    *   Generation time (how long AI takes)
    *   Edit counts (how much you modify AI output)
    *   Approval & Publishing timestamps

3.  **Post-Publication Metrics**:
    *   Support for receiving engagement data (likes, comments, etc.) from Make.com

## 📊 How to View Analytics

1.  Open the application (http://localhost:3000)
2.  Click on **Analytics** in the sidebar
3.  You will see the dashboard with real-time data

## 🔗 Make.com Integration (For Engagement Metrics)

To track likes, comments, and shares, you need to configure Make.com to send data back to Social Scheduler.

### Step 1: Create a "Fetch Metrics" Scenario in Make.com

1.  **Trigger**: Schedule (e.g., every 6 hours)
2.  **Action**: Get Posts from LinkedIn/Facebook/Twitter (API call)
3.  **Action**: HTTP Request (Send data to Social Scheduler)

### Step 2: Configure HTTP Request

*   **URL**: `http://your-machine-ip:3001/api/analytics/posts/{post_id}/metrics`
    *   *Note: You might need `ngrok` to expose your local server to Make.com*
*   **Method**: `POST`
*   **Body Type**: `Raw` -> `JSON`
*   **Content**:

```json
{
  "likes": 10,
  "comments": 2,
  "shares": 1,
  "impressions": 500,
  "reach": 450,
  "clicks": 25,
  "raw_data": { ... }
}
```

### Step 3: Link Post IDs

When publishing via Make.com, ensure you save the `post_id` from Social Scheduler in your external database or Google Sheet so you can map it back when fetching metrics.

## 🧪 Verification

1.  Create a new brief and generate posts.
2.  Approve and publish a post.
3.  Go to **Analytics** and check if the counters increased.
4.  (Advanced) Use Postman to send a test metric:
    ```bash
    curl -X POST http://localhost:3001/api/analytics/posts/1/metrics \
      -H "Content-Type: application/json" \
      -d '{"likes": 50, "impressions": 1000}'
    ```
    Then refresh the dashboard to see the engagement data.
