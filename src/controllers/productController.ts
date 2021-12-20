import httpStatus from 'http-status';
import ShopifyService from '../services/shopifyService';
import catchAsync from '../utils/catchAsync';

/**
 * Get details of one Shopify product by Id
 */
const getProductDetail = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const productDetail = await ShopifyService.getProductDetail(
    parseInt(productId)
  );
  res.status(httpStatus.OK).send(productDetail);
});

export default {
  getProductDetail,
};
