import Shopify, { IProduct, IBlog, IArticle } from 'shopify-api-node';

import logger from '../config/logger';
import ApiError from '../errors/ApiError';
import config from '../config/config';

/**
 * Initialise Shopify NodeSDK
 */
const shopify = new Shopify({
  shopName: config.shopify.shopName,
  apiKey: config.shopify.apiKey,
  password: config.shopify.apiSecret,
});

/**
 * Gets info for one Shopify product based on Id
 * @param {number} productId - Shopify Product Id
 * @returns {IProduct} - Shopify Product info
 */
const getProductDetail = async (productId: number): Promise<IProduct> => {
  try {
    const productDetail = await shopify.product.get(productId);
    return productDetail;
  } catch (error: any) {
    throw new ApiError(404, error?.message);
  }
};

/**
 * Gets list of Shopify blogs for current user
 * @param {void}
 * @returns {IBlog[]} - List of shopify blog info
 */
const getBlogIds = async (): Promise<IBlog[]> => {
  try {
    const shopifyBlogs = await shopify.blog.list();
    return shopifyBlogs;
  } catch (error: any) {
    throw new ApiError(404, error?.message);
  }
};

/**
 * Posts an HTML string as Article body to a specific Shopify blog
 * @param {number} blogId - Determines which blog to send the Article to
 * @param {string} articleHTMLbody - HTML body string to be sent to Shopify Article API
 * @param {string} articleTitle - Title of Article
 * @returns {IArticle} - Article object from Shopify API
 */
const postArticle = async (
  blogId: number,
  articleTitle: string,
  articleHTMLbody: string
): Promise<IArticle> => {
  try {
    let response: IArticle = await shopify.article.create(blogId, {
      body_html: articleHTMLbody,
      author: 'Renyi Tan',
      title: articleTitle,
    });
    logger.info('[ShopifyService] Successfully uploaded to Shopify blog');
    return response;
  } catch (error: any) {
    throw new ApiError(404, error?.message);
  }
};

export default {
  getProductDetail,
  getBlogIds,
  postArticle,
};
