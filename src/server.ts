import express from 'express';
// import Shopify from '@shopify/shopify-api';
// const Shopify = require('shopify-api-node');
import Shopify from 'shopify-api-node';
import Constants from './constants';
import axios from 'axios';

const SHOPIFY_API_KEY = '73976a39cc2b0c6e7b5866c7c882f943';
const SHOPIFY_API_SECRET = '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';
const SHOPIFY_SHOP_NAME = 'renyi-hypotenuse-1';
const HYPOTENUSE_API_KEY = 'e4b06736-9acb-4da2-be43-11a73ef27373';

const app = express();
const PORT = 8080;
axios.defaults.baseURL = 'https://app.hypotenuse.ai/api/v1';
axios.defaults.headers.common['X-API-KEY'] =
  'e4b06736-9acb-4da2-be43-11a73ef27373';

const CALLBACK_URL = 'https://7568-116-15-168-68.ngrok.io/generation-callback';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const shopify = new Shopify({
  shopName: SHOPIFY_SHOP_NAME,
  apiKey: SHOPIFY_API_KEY,
  password: SHOPIFY_API_SECRET,
});

const productIds = [
  '6646373154867',
  '6646373122099',
  // '6646373285939',
  // '6646373187635',
  // '6646373220403',
];
/**
 * Server Routes
 */
app.get('/', (req, res, next) => {
  res.json({ message: "renyi's dev things" });
});

async function getProductDetail(productId: string) {
  const productDetail = await shopify.product.get(parseInt(productId));
  return productDetail;
}

async function generateProductContent(productId: string) {
  // 1. get product details
  const productDetail = await shopify.product.get(parseInt(productId));
  const requestData = {
    callback_url: CALLBACK_URL,
    product_data: {
      Brand: productDetail.vendor,
      ProductTitle: productDetail.title,
      'Specification 1': productDetail.tags.split(',')[0] || undefined,
      'Specification 2': productDetail.tags.split(',')[1] || undefined,
      ImageURL1: productDetail.images[0].src || undefined,
    },
    writer_id: 'casual',
    categories: {
      customer: 'Richemont',
      brand: productDetail.vendor,
    },
    field_mapping: {
      title: 'ProductTitle',
      brand: 'Brand',
      imgSrc: 'ImageURL1',
      tags: ['Specification 1'],
    },
    metadata: '',
    test: false,
  };
  // 2. send product details to generator
  try {
    let response = await axios.post('generations/create', requestData);
    return response.data;
  } catch (error: any) {
    console.log('Error', error.response.data);
  }
}

app.get('/products/:productId', async (req, res, next) => {
  const { productId } = req.params;
  const product = await shopify.product.get(parseInt(productId));
  res.status(200).send(product);
});

app.get('/products', async (req: any, res, next) => {
  const { productIds } = req.body;
});

app.post('/generate/:productId', async (req, res, next) => {
  const { productId } = req.params;
  let response = await generateProductContent(productId);
  res.send(response);
});

/**
 * Call back end point
 */
app.post('/generation-callback', (req, res, next) => {
  console.log('callback received');
  console.log('Callback', req.body);

  console.log('creating html body...');
  let html = '<div>';
  html += '<h1>example store</h1>';
  html += '<ol>';
  const descriptions = req.body.descriptions;
  html += '<li>';
  html += `Product <br><br>`;
  html += descriptions[0].content;
  html += '</li><br>';

  html += '</ol>';
  html += '</div>';

  console.log(html);
});

// let html = '<div>';
// html += '<h1>example store</h1>';
// html += '<ol>';
// Constants.descriptions.forEach((desc, index) => {
//   html += '<li>';
//   html += `Product ${index} <br><br>`;
//   html += desc.content;
//   html += '</li><br>';
// });

// html += '</ol>';
// html += '</div>';

// console.log(html);

/**
 * Listener
 */

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
