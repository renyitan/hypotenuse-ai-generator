import httpStatus from 'http-status';
import { Response, Request } from 'express';
import { IProduct } from 'shopify-api-node';

import ShopifyService from '../services/shopifyService';
import catchAsync from '../utils/catchAsync';

/**
 * Get details of one Shopify product by Id
 */
const getProductDetail = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const productDetail: IProduct = await ShopifyService.getProductDetail(
    parseInt(productId)
  );
  res.status(httpStatus.OK).send(productDetail);
});

export default {
  getProductDetail,
};
