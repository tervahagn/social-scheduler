/**
 * Simple test script to verify LLM integration works with OpenRouter
 */

import db from './backend/src/database/db.js';
import { generateContent } from './backend/src/services/openrouter.service.js';

async function testLLM() {
    console.log('🧪 Testing LLM Connection via OpenRouter...\n');

    try {
        // Check settings
        console.log('📋 Checking settings...');
        const settings = await db.prepare('SELECT * FROM settings WHERE key IN (?, ?)').all('openrouter_api_key', 'openrouter_model');

        const apiKeySetting = settings.find(s => s.key === 'openrouter_api_key');
        const modelSetting = settings.find(s => s.key === 'openrouter_model');

        if (apiKeySetting?.value) {
            console.log('✅ API Key is configured in database');
            console.log('   Key preview:', apiKeySetting.value.substring(0, 15) + '...');
        } else {
            console.log('⚠️  API Key not in database, will use .env file');
        }

        if (modelSetting?.value) {
            console.log('✅ Model configured:', modelSetting.value);
        } else {
            console.log('⚠️  Model not configured, will use default');
        }

        // Check platforms
        console.log('\n📋 Checking platforms...');
        const platforms = await db.prepare('SELECT * FROM platforms WHERE is_active = 1').all();
        console.log(`✅ Found ${platforms.length} active platforms`);
        platforms.forEach(p => {
            console.log(`   - ${p.display_name} (${p.name})`);
        });

        if (platforms.length === 0) {
            console.log('❌ No active platforms found! Please activate at least one platform.');
            return;
        }

        // Test generation with the first platform
        const testPlatform = platforms[0];
        console.log(`\n🚀 Testing content generation with ${testPlatform.display_name}...`);

        const testBrief = 'Write a short social media post about the benefits of regular exercise.';
        console.log('Test brief:', testBrief);

        console.log('\n⏳ Generating content... (this may take a few seconds)');
        const startTime = Date.now();

        const content = await generateContent(
            testBrief,
            testPlatform.id,
            testPlatform.prompt_file,
            '' // no master prompt for this test
        );

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n✅ SUCCESS! Content generated in', duration, 'seconds');
        console.log('\n📝 Generated Content:');
        console.log('─'.repeat(60));
        console.log(content);
        console.log('─'.repeat(60));

        console.log('\n🎉 LLM integration is working correctly!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        console.error('\nFull error:', error);
    }
}

// Run the test
testLLM().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
