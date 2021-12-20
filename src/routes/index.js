import express from 'express';

const router = express.router();

router.use('/get-product', (req, res) => {
  console.log('hello');
});

export default router;
