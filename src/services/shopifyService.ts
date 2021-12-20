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

const getProductDetail = async (productId: number) => {
  return await shopify.product.get(productId);
};

const getBlogIds = async () => {
  return await shopify.blog.list();
};

const postArticle = async (blogId, articleTitle, articleHTMLbody) => {
  let response = await shopify.article.create(blogId, {
    body_html: articleHTMLbody,
    author: 'Renyi Tan',
    title: articleTitle,
  });
  return response;
};

export default {
  getProductDetail,
  getBlogIds,
  postArticle,
};
