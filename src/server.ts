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
  return html;
};

/**
 * Call back end point
 */
app.post('/generation-callback', async (req, res, next) => {
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
    console.log(
      `Batch: ${batchId} generation completed! Total Processed: ${genBatch[batchId].length}`
    );
    // const STORE_NAME = "Renyi's Fashion Store";

    // generate the html string
    // let html = await generateHTML(STORE_NAME, genBatch[batchId]);
    // console.log(html);

    // // get shopify blog Id
    // const shopifyBlogs = await shopify.blog.list();
    // const blogId = shopifyBlogs[0].id;
    // const blogTitle = ''

    // send html to shopify blog
    // let response = await shopify.article.create(blogId, {
    //   body_html: html,
    //   author: 'Renyi Tan',
    //   title: STORE_NAME,
    // });

    // delete the completed batch from memory
    // delete genBatch[batchId];
  }
});

// async function getBlog() {
//   let blog = await shopify.blog.list();
//   console.log(blog);
// }

// getBlog();

/**
 * Listener
 */

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
