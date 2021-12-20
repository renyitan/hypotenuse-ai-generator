import httpStatus from 'http-status';
import { Response, Request } from 'express';
import { IProduct } from 'shopify-api-node';

import ShopifyService from '../services/shopifyService';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';

/**
 * Get details of one Shopify product by Id
 */
const getProductDetail = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!productId) {
    throw new ApiError(404, 'please provide productId as params');
  }
  try {
    const productDetail: IProduct = await ShopifyService.getProductDetail(
      parseInt(productId)
    );
    res.status(httpStatus.OK).send(productDetail);
  } catch (error: any) {
    throw new ApiError(404, error?.message);
  }
});

export default {
  getProductDetail,
};
