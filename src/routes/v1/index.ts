import express from 'express';
import httpStatus from 'http-status';

import productRoutes from './productRoutes';
import contentRoutes from './contentRoutes';

const router = express.Router();
router.get('/status', (req, res) =>
  res.status(httpStatus.OK).send({ message: 'Looks good to me' })
);

router.use('/products', productRoutes);
router.use('/contents', contentRoutes);

export default router;
