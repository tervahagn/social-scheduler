import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// OpenRouter конфигурация
const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Social Scheduler'
    }
});

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

/**
 * Загружает промпт из БД или .md файла (fallback)
 */
async function loadPrompt(platformId, promptFile) {
    // Пробуем загрузить из БД
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

    // Fallback: загружаем из файла
    const promptPath = join(__dirname, '../../prompts', promptFile);
    return readFileSync(promptPath, 'utf8');
}

/**
 * Генерирует контент для платформы
 */
export async function generateContent(brief, platformId, promptFile, masterPrompt = '', model = DEFAULT_MODEL) {
    try {
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
        const completion = await openrouter.chat.completions.create({
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
 * Генерирует контент с изображением (для Vision-совместимых моделей)
 */
export async function generateContentWithImage(brief, imageUrl, platformId, promptFile, masterPrompt = '', model = 'anthropic/claude-3.5-sonnet') {
    try {
        const platformPromptTemplate = await loadPrompt(platformId, promptFile);

        // Combine master prompt + platform prompt
        let fullPrompt = '';
        if (masterPrompt) {
            fullPrompt = masterPrompt.replace('{{brief}}', brief) + '\n\n' + platformPromptTemplate;
        } else {
            fullPrompt = platformPromptTemplate;
        }

        const prompt = fullPrompt.replace(/\{\{brief\}\}/g, brief);

        const completion = await openrouter.chat.completions.create({
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
