/** @format */

import path from 'path';
import dotenv from 'dotenv-safe';

// import .env variables
dotenv.config({
  allowEmptyValues: true,
  path: path.join(__dirname, '../../.env'),
  example: path.join(__dirname, '../../.env.example'),
});

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY || '',
    apiSecret: process.env.SHOPIFY_API_SECRET || '',
    shopName: process.env.SHOPIFY_SHOP_NAME || '',
  },
  hypotenuse: {
    apiKey: process.env.HYPOTENUSE_API_KEY || '',
  },

  baseURL: process.env.BASE_URL || '',
};

export const genBatch = {};
