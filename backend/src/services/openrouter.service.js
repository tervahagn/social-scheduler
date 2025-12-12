import OpenAI from 'openai';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Get prompts directory - works in both dev and bundled mode
const getPromptsDir = () => {
    // In bundled Tauri app, prompts are in resources directory
    const resourcesPrompts = join(process.cwd(), 'prompts');
    if (existsSync(resourcesPrompts)) {
        return resourcesPrompts;
    }
    // In development, relative to backend folder
    return join(process.cwd(), 'prompts');
};

// OpenRouter configuration helper
async function getOpenRouterConfig() {
    let apiKey = process.env.OPENROUTER_API_KEY;
    let model = process.env.OPENROUTER_MODEL || 'x-ai/grok-4.1-fast:free';

    try {
        // Dynamic import to avoid circular dependencies if any
        const { default: db } = await import('../database/db.js');

        const settings = await db.prepare('SELECT * FROM settings WHERE key IN (?, ?)').all('openrouter_api_key', 'openrouter_model');

        const keySetting = settings.find(s => s.key === 'openrouter_api_key');
        const modelSetting = settings.find(s => s.key === 'openrouter_model');

        if (keySetting && keySetting.value) {
            apiKey = keySetting.value;
        }

        if (modelSetting && modelSetting.value) {
            model = modelSetting.value;
        }
    } catch (error) {
        console.warn('Failed to fetch settings from DB, using env vars:', error.message);
    }

    if (!apiKey) {
        console.error('OpenRouter Config Error: API Key missing');
        throw new Error('OpenRouter API Key is not configured in settings or .env');
    }

    // Debug logging (masked key)
    console.log('OpenRouter Config:', {
        model,
        keyConfigured: !!apiKey,
        keyPrefix: apiKey.substring(0, 10) + '...',
        keyLength: apiKey.length
    });

    const client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Social Scheduler'
        }
    });

    return { client, model };
}

/**
 * Loads prompt from DB or .md file (fallback)
 */
async function loadPrompt(platformId, promptFile) {
    // Try loading from DB
    if (platformId) {
        try {
            const { default: db } = await import('../database/db.js');
            const platform = await db.prepare('SELECT prompt_content FROM platforms WHERE id = ?').get(platformId);
            if (platform && platform.prompt_content) {
                return platform.prompt_content;
            }
        } catch (error) {
            console.warn('Could not load prompt from DB, falling back to file:', error.message);
        }
    }

    // Fallback: load from file
    const promptPath = join(getPromptsDir(), promptFile);
    return readFileSync(promptPath, 'utf8');
}

/**
 * Generates content for platform
 */
export async function generateContent(brief, platformId, promptFile, masterPrompt = '', modelOverride = null) {
    try {
        const { client, model: configModel } = await getOpenRouterConfig();
        const model = modelOverride || configModel;

        // Load platform-specific prompt from DB or file
        const platformPromptTemplate = await loadPrompt(platformId, promptFile);

        // Combine master prompt + platform prompt
        let fullPrompt = '';
        if (masterPrompt) {
            fullPrompt = masterPrompt.replace('{{brief}}', brief) + '\n\n' + platformPromptTemplate;
        } else {
            fullPrompt = platformPromptTemplate;
        }

        // Replace brief placeholder
        const prompt = fullPrompt.replace(/\{\{brief\}\}/g, brief);

        // Call OpenRouter
        const completion = await client.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const content = completion.choices[0].message.content.trim();
        return content;
    } catch (error) {
        console.error('OpenRouter error:', error);
        throw new Error(`Failed to generate content: ${error.message}`);
    }
}

/**
 * Generates content with image (for Vision-compatible models)
 */
export async function generateContentWithImage(brief, imageUrl, platformId, promptFile, masterPrompt = '', modelOverride = null) {
    try {
        const { client, model: configModel } = await getOpenRouterConfig();
        const model = modelOverride || configModel;

        const platformPromptTemplate = await loadPrompt(platformId, promptFile);

        // Combine master prompt + platform prompt
        let fullPrompt = '';
        if (masterPrompt) {
            fullPrompt = masterPrompt.replace('{{brief}}', brief) + '\n\n' + platformPromptTemplate;
        } else {
            fullPrompt = platformPromptTemplate;
        }

        const prompt = fullPrompt.replace(/\{\{brief\}\}/g, brief);

        const completion = await client.chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenRouter Vision error:', error);
        throw new Error(`Failed to generate content with image: ${error.message}`);
    }
}

export default {
    generateContent,
    generateContentWithImage
};
