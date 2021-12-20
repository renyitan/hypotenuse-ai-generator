import express from 'express';
import productController from '../../controllers/productController';

const router = express.Router();

router.get('/:productId', productController.getProductDetail);

export default router;
