import db from '../database/db.js';
import { generateContent, generateContentWithImage } from './openrouter.service.js';

/**
 * Generates initial master draft from brief
 */
export async function generateMasterDraft(briefId) {
    // Get brief
    const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(briefId);
    if (!brief) {
        throw new Error('Brief not found');
    }

    // Get master prompt from settings
    const masterPromptRow = await db.prepare("SELECT value FROM settings WHERE key = 'master_prompt'").get();
    const masterPrompt = masterPromptRow?.value || '';

    if (!masterPrompt) {
        throw new Error('Master prompt not configured in settings');
    }

    // Format full brief
    let fullBrief = brief.content;
    if (brief.link_url) {
        fullBrief += `\n\nLink: ${brief.link_url}`;
    }

    // Generate content using master prompt only (no platform-specific)
    let content;
    if (brief.media_url && brief.media_type?.startsWith('image/')) {
        // Use Vision model if image present
        const prompt = masterPrompt.replace('{{brief}}', fullBrief);
        content = await generateContentWithImage(fullBrief, brief.media_url, null, null, prompt);
    } else {
        // Text only
        const prompt = masterPrompt.replace('{{brief}}', fullBrief);
        // Call OpenRouter directly with just the master prompt
        const { default: OpenAI } = await import('openai');
        const openrouter = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'Social Scheduler'
            }
        });

        const completion = await openrouter.chat.completions.create({
            model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000
        });

        content = completion.choices[0].message.content.trim();
    }

    // Save as version 1
    const result = await db.prepare(`
        INSERT INTO master_drafts (brief_id, version, content, status)
        VALUES (?, 1, ?, 'draft')
    `).run(briefId, content);

    const masterDraft = await db.prepare('SELECT * FROM master_drafts WHERE id = ?').get(result.lastInsertRowid);

    console.log(`✅ Generated master draft v1 for brief ${briefId}`);

    return masterDraft;
}

/**
 * Creates a corrected version of master draft
 */
export async function correctMasterDraft(masterId, correctionPrompt) {
    // Get current master draft
    const currentDraft = await db.prepare('SELECT * FROM master_drafts WHERE id = ?').get(masterId);
    if (!currentDraft) {
        throw new Error('Master draft not found');
    }

    if (currentDraft.status === 'approved') {
        throw new Error('Cannot correct an approved master draft');
    }

    // Get brief
    const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(currentDraft.brief_id);

    // Build correction prompt
    const fullPrompt = `Here is the current version of the content:

${currentDraft.content}

Please make the following corrections:
${correctionPrompt}

Provide the complete corrected version.`;

    // Call LLM
    const { default: OpenAI } = await import('openai');
    const openrouter = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Social Scheduler'
        }
    });

    const completion = await openrouter.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7,
        max_tokens: 2000
    });

    const correctedContent = completion.choices[0].message.content.trim();

    // Get next version number
    const maxVersionRow = await db.prepare(`
        SELECT MAX(version) as max_version 
        FROM master_drafts 
        WHERE brief_id = ?
    `).get(currentDraft.brief_id);

    const nextVersion = (maxVersionRow?.max_version || 0) + 1;

    // Save new version
    const result = await db.prepare(`
        INSERT INTO master_drafts (brief_id, version, content, correction_prompt, status)
        VALUES (?, ?, ?, ?, 'draft')
    `).run(currentDraft.brief_id, nextVersion, correctedContent, correctionPrompt);

    const newDraft = await db.prepare('SELECT * FROM master_drafts WHERE id = ?').get(result.lastInsertRowid);

    console.log(`✅ Created master draft v${nextVersion} with corrections`);

    return newDraft;
}

/**
 * Approves a master draft
 */
export async function approveMasterDraft(masterId) {
    const draft = await db.prepare('SELECT * FROM master_drafts WHERE id = ?').get(masterId);
    if (!draft) {
        throw new Error('Master draft not found');
    }

    await db.prepare(`
        UPDATE master_drafts 
        SET status = 'approved'
        WHERE id = ?
    `).run(masterId);

    const approvedDraft = await db.prepare('SELECT * FROM master_drafts WHERE id = ?').get(masterId);

    console.log(`✅ Approved master draft ${masterId} (v${approvedDraft.version})`);

    return approvedDraft;
}

/**
 * Gets all master drafts for a brief
 */
export async function getMasterDrafts(briefId) {
    const drafts = await db.prepare(`
        SELECT * FROM master_drafts 
        WHERE brief_id = ?
        ORDER BY version DESC
    `).all(briefId);

    return drafts;
}

/**
 * Gets the latest master draft for a brief
 */
export async function getLatestMasterDraft(briefId) {
    const draft = await db.prepare(`
        SELECT * FROM master_drafts 
        WHERE brief_id = ?
        ORDER BY version DESC
        LIMIT 1
    `).get(briefId);

    return draft;
}

export default {
    generateMasterDraft,
    correctMasterDraft,
    approveMasterDraft,
    getMasterDrafts,
    getLatestMasterDraft
};
