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
 *
 * @param productId Product Id of Shopify product
 * @returns details of shopify product
 */
const getProductDetail = async (productId: number): Promise<IProduct> => {
  try {
    const productDetail = await shopify.product.get(productId);
    return productDetail;
  } catch (error: any) {
    throw new ApiError(404, error?.message);
  }
};

const getBlogIds = async (): Promise<IBlog[]> => {
  try {
    const shopifyBlogs = await shopify.blog.list();
    return shopifyBlogs;
  } catch (error: any) {
    throw new ApiError(404, error?.message);
  }
};

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
