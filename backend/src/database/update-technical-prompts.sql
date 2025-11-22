-- Update platforms with technical constraints instead of creative prompts
UPDATE platforms SET ultra_short_prompt = 'Max 3000 characters. Use professional tone. No hashtags in the first comment.' WHERE name = 'linkedin';
UPDATE platforms SET ultra_short_prompt = 'Max 63,206 characters (keep it under 500 for engagement). Use engaging visuals. 1-3 hashtags.' WHERE name = 'facebook';
UPDATE platforms SET ultra_short_prompt = 'Max 2200 characters. 30 hashtags max (use 3-5 relevant ones). Square (1:1) or Portrait (4:5) aspect ratio for images.' WHERE name = 'instagram';
UPDATE platforms SET ultra_short_prompt = 'Max 280 characters. 1-2 hashtags max. Casual and concise tone.' WHERE name = 'twitter';
UPDATE platforms SET ultra_short_prompt = 'Max 1500 characters. No hashtags. Focus on updates, offers, or events.' WHERE name = 'google-business';
UPDATE platforms SET ultra_short_prompt = 'Min 300 words, Max 2000 words. Use H2/H3 headers. SEO friendly title.' WHERE name = 'blog';
UPDATE platforms SET ultra_short_prompt = 'Max 40,000 characters. Use Markdown. Follow subreddit rules. No hashtags.' WHERE name = 'reddit';
UPDATE platforms SET ultra_short_prompt = 'Max 1000 characters. Can use polls/images. Casual tone. No hashtags.' WHERE name = 'youtube-posts';
