import express from 'express';
// import Shopify from '@shopify/shopify-api';
// const Shopify = require('shopify-api-node');
import Shopify from 'shopify-api-node';
import Constants from './constants';

const SHOPIFY_API_KEY = '73976a39cc2b0c6e7b5866c7c882f943';
const SHOPIFY_API_SECRET = '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';
const SHOPIFY_SHOP_NAME = 'renyi-hypotenuse-1';
const HYPOTENUSE_API_KEY = 'e4b06736-9acb-4da2-be43-11a73ef27373';

const app = express();
const PORT = 8080;

app.use(express.json());

const shopify = new Shopify({
  shopName: SHOPIFY_SHOP_NAME,
  apiKey: SHOPIFY_API_KEY,
  password: SHOPIFY_API_SECRET,
});
// const products = await shopify.product.list({ limit: 5 });
// console.log(products);

console.log(Constants.products);
// const firstProduct = mockProducts[0];
// console.log('firstProduct', firstProduct);

/**
 * Server Routes
 */
app.get('/', (req, res, next) => {
  res.json({ message: 'renyi\'s dev things' });
});

app.get('/products', (req, res, next) => {
  console.log('all products');
  res.status(200).send({ message: 'all products' });
});

/**
 * Call back end point
 */
app.post('/generation-callback', (req, res, next) => {
  console.log('call back received');
  console.log(req.body);
});

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
