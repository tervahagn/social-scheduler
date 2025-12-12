import express from 'express';
import multer from 'multer';
import path from 'path';
import { quickPostService } from '../services/quick-post.service.js';

const router = express.Router();

// Configure upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Create new quick post
router.post('/', async (req, res) => {
    try {
        const result = quickPostService.create(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error creating quick post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Publish quick post
router.post('/:id/publish', async (req, res) => {
    try {
        const results = await quickPostService.publish(req.params.id);
        res.json({ results });
    } catch (error) {
        console.error('Error publishing quick post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Schedule quick post
router.post('/:id/schedule', async (req, res) => {
    try {
        const { scheduled_at } = req.body;
        if (!scheduled_at) {
            return res.status(400).json({ error: 'scheduled_at is required' });
        }
        const results = await quickPostService.schedule(req.params.id, scheduled_at);
        res.json({ results });
    } catch (error) {
        console.error('Error scheduling quick post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get history
router.get('/history', (req, res) => {
    try {
        const history = quickPostService.getHistory();
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload file
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        // We don't attach to item immediately here because item might not exist yet
        // In a real app we might want to upload first then attach, or create item then upload
        // For simplicity, let's assume frontend uploads after creating the item or we return path to attach later

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            path: req.file.path,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Attach file to item (if needed separately)
router.post('/item/:itemId/attach', (req, res) => {
    try {
        const { path, originalName, mimeType } = req.body;
        quickPostService.uploadFile(req.params.itemId, { path, originalname: originalName, mimetype: mimeType });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
