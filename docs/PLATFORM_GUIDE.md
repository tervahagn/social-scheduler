# Platform Configuration Guide

## Platform Overview

Social Scheduler supports 9 social media platforms, each optimized for its unique format and audience.

### Platform Order
Platforms appear in this sequence throughout the app:
1. Blog
2. LinkedIn (Company)
3. LinkedIn (Personal)
4. Reddit
5. Google Business
6. X (Twitter)
7. YouTube Posts
8. Facebook
9. Instagram

---

## Platform Details

### 1. Blog
- **Format**: Long-form content
- **Character Limit**: No limit (recommended 500+ words)
- **Features**: SEO optimization, structured headers, CTA
- **Best For**: Detailed explanations, tutorials, thought leadership

### 2. LinkedIn (Company)
- **Format**: Professional business posts
- **Character Limit**: 3,000 characters
- **Features**: Corporate tone, industry insights, B2B focus
- **Best For**: Company announcements, industry news, professional updates
- **Hashtags**: 3-5 relevant hashtags
- **Emojis**: Moderate use (1-3 per post)

### 3. LinkedIn (Personal)
- **Format**: Personal storytelling and insights
- **Character Limit**: 3,000 characters
- **Features**: Authentic tone, first-person narrative, personal experiences
- **Best For**: Career stories, personal growth, professional insights
- **Hashtags**: 3-5 relevant hashtags
- **Emojis**: Minimal use (0-2 per post for authenticity)

### 4. Reddit
- **Format**: Community discussions
- **Character Limit**: No practical limit
- **Features**: Authentic conversational tone, value-first approach
- **Best For**: Discussions, asking questions, sharing expertise
- **No Hashtags**: Reddit doesn't use hashtags
- **Key Rule**: Transparency when promoting products/services

### 5. Google Business
- **Format**: Local business updates
- **Character Limit**: 1,500 characters
- **Features**: Call-to-action focus, local relevance
- **Best For**: Promotions, events, business updates
- **Emojis**: Moderate use

### 6. X (Twitter)
- **Format**: Short, impactful tweets
- **Character Limit**: 280 characters (strict)
- **Features**: Concise messaging, strong hooks
- **Best For**: Quick updates, engagement, timely commentary
- **Hashtags**: Up to 2
- **Critical**: Must stay under 280 characters

### 7. YouTube Posts (Community)
- **Format**: Community engagement posts
- **Character Limit**: ~1,000 characters
- **Features**: Casual tone, audience interaction
- **Best For**: Updates, polls, behind-the-scenes, video teasers
- **Emojis**: Welcome

### 8. Facebook
- **Format**: Conversational social posts
- **Character Limit**: Practically 500-1,000 characters
- **Features**: Emotional connection, storytelling
- **Best For**: Community building, engagement, stories
- **Hashtags**: Up to 5 (optional)
- **Emojis**: Encouraged for emotional impact

### 9. Instagram
- **Format**: Visual captions
- **Character Limit**: 2,200 characters
- **Features**: First line is crucial (preview), visual language
- **Best For**: Inspirational content, visual storytelling
- **Hashtags**: 10-15 in a separate block at the end
- **Emojis**: Welcome and encouraged

---

## Customizing Platform Prompts

Each platform has a customizable prompt that defines:
- Tone and style
- Character limits
- Formatting requirements
- Content structure
- Hashtag usage
- Emoji guidelines

### How to Edit Prompts

1. Navigate to **Platforms** page
2. Find the platform you want to customize
3. Click **Edit Prompt**
4. Modify the prompt text
5. Use `{{brief}}` placeholder for content insertion
6. Click **Save**

### Prompt Best Practices

- Keep character limits accurate
- Define clear tone guidelines
- Specify structural requirements
- Include formatting instructions
- Add examples if helpful
- Use `{{brief}}` to insert user content

---

## Webhook Configuration

### Setting Up Webhooks

1. Go to **Platforms** page
2. Click **Edit** on a platform
3. Enter webhook URL
4. Save changes

### Webhook Use Cases

- **Make.com**: Automate posting to platforms
- **Zapier**: Connect to social media APIs
- **Custom**: Build your own integration
- **Testing**: Use webhook.site for testing

### Webhook Payload

When a post is approved and published, a POST request is sent with:
```json
{
  "platform": "linkedin",
  "content": "Post content here...",
  "brief_id": 123,
  "post_id": 456
}
```

---

## Platform Activation

### Enabling/Disabling Platforms

1. Go to **Platforms** page
2. Toggle the platform status
3. Inactive platforms won't appear in brief creation
4. Can be reactivated anytime without losing configuration

### When to Disable Platforms

- Not currently using that channel
- Testing specific platforms only
- Focusing on high-priority channels
- Platform temporarily unavailable

---

## Two LinkedIn Strategy

### Why Two LinkedIn Platforms?

- **Company**: Official brand voice, business updates, B2B content
- **Personal**: Individual thought leadership, career insights, personal brand

### Best Practices

**Company LinkedIn:**
- Corporate announcements
- Product launches
- Industry reports
- Team achievements
- Partnership news

**Personal LinkedIn:**
- Career journey stories
- Lessons learned
- Personal insights
- Professional development
- Networking and connection

### Content Differentiation

The AI automatically adjusts:
- **Company**: Professional, authoritative, business-focused
- **Personal**: Authentic, vulnerable, story-driven

---

## Platform Performance

Track metrics in the **Analytics** page:
- Total posts per platform
- Publish rate
- Average edits needed
- Generation time
- Engagement (when metrics collected)

Use this data to:
- Optimize platform selection
- Refine prompts
- Focus on high-performing channels
- Adjust content strategy
