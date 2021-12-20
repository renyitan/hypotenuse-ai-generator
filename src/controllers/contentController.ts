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

const webhookURL = config.baseURL + '/contents/callback';

function _mapProductToRequest(
  productDetail: IProduct,
  batchId: string
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
    test: false,
  };
  return generatorRequest;
}

/**
 * Generate product content of a single product by Id
 */
const generateContent = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const batchId = uuidv4();
  // 1. get product detail
  const productDetail: IProduct = await ShopifyService.getProductDetail(
    parseInt(productId)
  );

  // 3. construct request body
  const generatorRequest: GeneratorRequest = _mapProductToRequest(
    productDetail,
    batchId
  );

  // include the genBatch details
  genBatch[batchId] = {
    batchId: batchId,
    length: 1,
    results: [],
  };

  let response = await hypotenuseService.generateContent(generatorRequest);
  res.send(response);
});

/**
 * Generate contents for multiple products by id[]
 */
const generateContents = catchAsync(async (req, res) => {
  const { productIds } = req.body;
  const batchId = uuidv4();

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
          resolve(response);
        } catch (error) {
          reject('error');
        }
      })
  );

  // wait for all async calls to complete
  const results = await Promise.all(promises);

  genBatch[batchId] = {
    batchId: batchId,
    length: productIds.length,
    results: [],
  };

  console.log(
    `Processed ${results.length}/${genBatch[batchId].length} products successfully `,
    genBatch
  );

  res.status(200).send(`Processed ${productIds.length} products successfully`);
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

  console.log('GenBatch', genBatch);

  if (genBatch[batchId].length === genBatch[batchId]['results'].length) {
    console.log(
      `Batch: ${batchId} generation completed! Total Processed: ${genBatch[batchId].length}`
    );
  }
});

export default {
  generateContent,
  generateContents,
  processCallback,
};
