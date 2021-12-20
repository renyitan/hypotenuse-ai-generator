import Shopify from 'shopify-api-node';
import config from '../config/config';

/**
 * Initialise Shopify NodeSDK
 */
const shopify = new Shopify({
  shopName: config.shopify.shopName,
  apiKey: config.shopify.apiKey,
  password: config.shopify.apiSecret,
});

async function getProductDetail(productId: number) {
  return await shopify.product.get(productId);
}

export default {
  getProductDetail,
};
