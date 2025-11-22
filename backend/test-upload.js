import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api/briefs';

async function testUpload() {
    try {
        // Create dummy files
        fs.writeFileSync('test-doc.txt', 'This is a test document content.');
        fs.writeFileSync('test-media.jpg', 'fake image content'); // Not a real image, but enough for upload test

        const formData = new FormData();
        formData.append('title', 'Test Brief with Files');
        formData.append('content', 'This is the brief content.');
        formData.append('selected_platforms', JSON.stringify([1])); // Assuming platform 1 exists

        // Append files
        formData.append('documents', fs.createReadStream('test-doc.txt'));
        formData.append('media', fs.createReadStream('test-media.jpg'));

        console.log('Sending request...');
        const response = await axios.post(API_URL, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('Response status:', response.status);
        console.log('Brief created:', response.data.id);
        console.log('Files attached:', response.data.files ? response.data.files.length : 0);

        if (response.data.files && response.data.files.length === 2) {
            console.log('✅ SUCCESS: 2 files uploaded correctly.');
        } else {
            console.error('❌ FAILURE: Incorrect number of files uploaded.');
        }

        // Cleanup
        fs.unlinkSync('test-doc.txt');
        fs.unlinkSync('test-media.jpg');

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testUpload();
