import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { IProduct } from 'shopify-api-node';

import ShopifyService from '../services/shopifyService';
import config from '../config/config';
import hypotenuseService from '../services/hypotenuseService';
import catchAsync from '../utils/catchAsync';
import { genBatch } from '../config/config';
import { MetaDataObject, GeneratorRequest } from '../models';
import ApiError from '../errors/ApiError';
import logger from '../config/logger';

const webhookURL = config.baseURL + '/contents/callback';

function _mapProductToRequest(
  productDetail: IProduct,
  batchId: string,
  isTest?: boolean
): GeneratorRequest {
  // construct metadata
  const metaDataObject: MetaDataObject = {
    batchId,
    productTitle: productDetail.title,
    productId: productDetail.id,
  };
  // construct request body
  const generatorRequest: GeneratorRequest = {
    callback_url: webhookURL,
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
    test: isTest || false,
  };
  return generatorRequest;
}

/**
 * Retry generate product content for a single product by id
 */
async function retryGenerateContent(productId: string, batchId: string) {
  try {
    const productDetail: IProduct = await ShopifyService.getProductDetail(
      parseInt(productId)
    );

    const generatorRequest: GeneratorRequest = _mapProductToRequest(
      productDetail,
      batchId
    );

    let response = await hypotenuseService.generateContent(generatorRequest);
    genBatch[batchId].processed.push(response);

    // remove from errors
    genBatch[batchId].errors = genBatch[batchId].errors.filter(
      (failedId: string) => productId != failedId
    );

    // and push into processed
    genBatch[batchId].processed.push(response);
    return;
  } catch (error: any) {
    // this means the processing of this product failed, we push it to errors[]
    genBatch[batchId].processed.push({
      productId,
    });
    throw new ApiError(404, error.message);
  }
}

/**
 * Generate product content of a single product by Id
 */
const generateContent = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  if (!productId) {
    throw new ApiError(httpStatus[404], 'please provide productId as params');
  }
  const { isTest = false } = req.body;
  const batchId = uuidv4();
  // 1. get product detail
  try {
    const productDetail: IProduct = await ShopifyService.getProductDetail(
      parseInt(productId)
    );

    // 3. construct request body
    const generatorRequest: GeneratorRequest = _mapProductToRequest(
      productDetail,
      batchId,
      isTest
    );

    // include the genBatch details
    genBatch[batchId] = {
      batchId: batchId,
      length: 1,
      results: [],
      processed: [],
      errors: [],
    };
    let response = await hypotenuseService.generateContent(generatorRequest);
    genBatch[batchId].processed.push(response);

    res.status(200).send({
      batchId: batchId,
      length: 1,
      message: `Processed 1 product successfully`,
      processed: genBatch[batchId].processed,
      errors: genBatch[batchId].errors,
    });
  } catch (error: any) {
    // this means the processing of this product failed, we push it to errors[]

    genBatch[batchId].processed.push({
      productId,
    });
    throw new ApiError(404, error.message);
  }
});

/**
 * Generate contents for multiple products by id[]
 */
const generateContents = catchAsync(async (req, res) => {
  const { productIds } = req.body;
  if (!productIds) {
    throw new ApiError(
      httpStatus[404],
      'please provide productIds[] as params'
    );
  }

  const batchId = uuidv4();

  // create the generation batch object
  genBatch[batchId] = {
    batchId: batchId,
    length: productIds.length,
    results: [],
    processed: [],
    errors: [],
  };

  const promises = productIds.map(
    (productId) =>
      new Promise(async (resolve, reject) => {
        // 1. get product detail
        const productDetail: IProduct = await ShopifyService.getProductDetail(
          parseInt(productId)
        );

        // construct request body
        const generatorRequest: GeneratorRequest = _mapProductToRequest(
          productDetail,
          batchId
        );

        try {
          let response = await hypotenuseService.generateContent(
            generatorRequest
          );
          genBatch[batchId].processed.push(response);
          resolve(response);
        } catch (error) {
          // this means the processing of this product failed, we push it to errors[]
          genBatch[batchId].processed.push({
            productId,
          });
          reject('error');
        }
      })
  );

  // wait for all async calls to complete
  await Promise.allSettled(promises);

  logger.info(
    `Processed ${genBatch[batchId].processed.length}/${genBatch[batchId].length} products successfully `,
    genBatch
  );

  res.status(200).send({
    batchId: batchId,
    length: productIds.length,
    processed: genBatch[batchId].processed,
    errors: genBatch[batchId].errors,
    message: `Processed ${genBatch[batchId].processed.length}/${productIds.length} products successfully`,
  });
});

/**
 * Process callback from Generator API
 */
const processCallback = catchAsync(async (req, res) => {
  // 1. get the metadata
  const { metadata } = req.body;
  const { batchId, productTitle, productId } = JSON.parse(metadata);

  // 2. get the generated description and map to product
  const descriptions: any[] = req.body.descriptions;

  genBatch[batchId]['results'].push({
    productId,
    productTitle,
    content: descriptions[0].content,
  });

  logger.info('Current GenBatch', genBatch);

  if (genBatch[batchId].length === genBatch[batchId]['results'].length) {
    logger.info(
      `Batch: ${batchId} generation completed! Total Processed: ${genBatch[batchId].length}`
    );
  }

  res.status(200).send({
    status: 'success',
    batchId,
    callback: {
      response: req.body,
    },
  });
});

export default {
  generateContent,
  generateContents,
  processCallback,
  retryGenerateContent,
};
