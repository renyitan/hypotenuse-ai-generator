import express from 'express';
import Shopify from 'shopify-api-node';
import axios from 'axios';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as ejs from 'ejs';
import { promises as fs } from 'fs';
const SHOPIFY_API_KEY = '73976a39cc2b0c6e7b5866c7c882f943';
const SHOPIFY_API_SECRET = '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';
const SHOPIFY_SHOP_NAME = 'renyi-hypotenuse-1';
const HYPOTENUSE_API_KEY = 'e4b06736-9acb-4da2-be43-11a73ef27373';

const app = express();
const PORT = 8080;
axios.defaults.baseURL = 'https://app.hypotenuse.ai/api/v1';
axios.defaults.headers.common['X-API-KEY'] = HYPOTENUSE_API_KEY;
const CALLBACK_URL = 'https://0815-116-15-168-68.ngrok.io/generation-callback';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));

const shopify = new Shopify({
  shopName: SHOPIFY_SHOP_NAME,
  apiKey: SHOPIFY_API_KEY,
  password: SHOPIFY_API_SECRET,
});

// create the batch data structure
const genBatch = {};

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

async function generateProductContent(productId: string, batchId: string) {
  // 1. get product details
  const productDetail = await shopify.product.get(parseInt(productId));
  // 2. construct meta data
  const metaDataObject = {
    batchId,
    productTitle: productDetail.title,
    productId: productDetail.id,
  };
  // 3. construct request body
  const reqBody = {
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
    metadata: JSON.stringify(metaDataObject),
    test: false,
  };
  // 2. send product details to generator
  try {
    let response = await axios.post('generations/create', reqBody);
    console.log(`sent ${productDetail.title} to generator!`);
    return response.data;
  } catch (error: any) {
    console.log('Error', error.response.data);
  }
}

// Get details of one product by Id
app.get('/products/:productId', async (req, res, next) => {
  const { productId } = req.params;

  const product = await shopify.product.get(parseInt(productId));
  res.status(200).send(product);
});

// Generate content for one product by Id
app.post('/generate/:productId', async (req, res, next) => {
  const { productId } = req.params;
  const batchId = uuidv4();
  let response = await generateProductContent(productId, batchId);

  // include the genBatch details
  genBatch[batchId] = {
    batchId: batchId,
    length: 1,
    results: [],
  };

  res.send(response);
});

// Generate contents for multiple products by id[]
app.post('/generate', async (req, res, next) => {
  const { productIds } = req.body;
  const batchId = uuidv4();
  const promises = productIds.map(
    (productId) =>
      new Promise(async (resolve, reject) => {
        try {
          let response = await generateProductContent(productId, batchId);
          resolve(response);
        } catch (error) {
          reject('error');
        }
      })
  );

  const results = await Promise.all(promises);

  genBatch[batchId] = {
    batchId: batchId,
    length: productIds.length,
    results: [],
  };

  console.log('bulk - gen batch', genBatch);
  res.status(200).send(`Process ${productIds.length} products successfully`);
});

/**
 * Call back end point
 */
app.post('/generation-callback', (req, res, next) => {
  console.log('callback received');

  // 1. get the metadata
  const { metadata } = req.body;
  const { batchId, productTitle, productId } = JSON.parse(metadata);

  // 2. get the generated description and map to product
  const descriptions = req.body.descriptions;
  genBatch[batchId]['results'].push({
    productId,
    productTitle,
    content: descriptions[0].content,
  });

  console.log(genBatch);

  if (genBatch[batchId].length === genBatch[batchId]['results'].length) {
    console.log(`Batch: ${batchId} generation completed`);
    console.log(genBatch[batchId]);

    // delete genBatch[batchId];
  }
});

const MOCK = {
  batchId: '0c8c6a69-cd1e-4e5f-b103-3dca97df2f4c',
  length: 5,
  results: [
    {
      productId: 6646373154867,
      productTitle: 'All Over Print Wide Waistband Leggings',
      content:
        'Layered patterns make for a multidimensional look when you slip these wide-waisted leggings on. It’s the perfect way to mix and match patterns in your wardrobe. Add a simple bodysuit and a pair of heeled booties for an effortless look.',
    },
    {
      productId: 6646373220403,
      productTitle: 'Button Front Ruffle Trim Skirt',
      content:
        'A ruffle skirt with a touch of playfulness. This skirt is made of denim, which makes it easy to dress up or dress down. Wear this skirt for a casual day or an evening out with some heels and a cute top.',
    },
    {
      productId: 6646373122099,
      productTitle: 'Allover Floral Print Split Hem Skirt',
      content:
        'A summer staple, this A-line skirt is crafted in soft chiffon and features a split hem in front. In a mid-weight fabric, this is the skirt to pack in your travel bag and take on holiday. Pair it with a crop top, bralette and sandals for scorching days in the sunshine.',
    },
    {
      productId: 6646373187635,
      productTitle: 'Buckle Belted Glen Plaid Pants',
      content:
        'These pants are straight out of the 80s. With their wide leg and buckle detailing, you’ll want to wear them everywhere. So, we made them in all sorts of colors so you can be colorful, too! From our Glen Plaid Collection, this item is designed for the retro-minded.',
    },
    {
      productId: 6646373285939,
      productTitle: 'Allover Print Layered Skort',
      content:
        'Twirl through the party in style! This skort is made with a fun allover print fabric and a flare silhouette to show off your own unique style. Pair this skort with heels or flats for a stylish look!',
    },
  ],
};

const generateHTML = async (storeName, data) => {
  // 1. get the HTML template
  const template = await fs.readFile(
    path.join(__dirname, '/views/template.ejs'),
    'utf-8'
  );

  //2. grab the data
  const { results } = data;

  //3. dynamically render the html
  const html = ejs.render(template, { storeName, results });
  console.log(html);
};

generateHTML('Fashion Store', MOCK);
/**
 * Listener
 */

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
