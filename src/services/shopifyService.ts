import httpStatus from 'http-status';
import Shopify, { IProduct, IBlog, IArticle } from 'shopify-api-node';
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
  blogId,
  articleTitle,
  articleHTMLbody
): Promise<IArticle> => {
  try {
    let response: IArticle = await shopify.article.create(blogId, {
      body_html: articleHTMLbody,
      author: 'Renyi Tan',
      title: articleTitle,
    });
    console.log('[ShopifyService] Successfully uploaded to Shopify blog');
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
