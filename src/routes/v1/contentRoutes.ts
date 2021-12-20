import express from 'express';
import contentController from '../../controllers/contentController';

const router = express.Router();

router.post('/generate/:productId', contentController.generateContent);
router.post('/generate/', contentController.generateContents);
router.post('/callback', contentController.processCallback);

export default router;
