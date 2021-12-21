import { IBlog } from 'shopify-api-node';

import { genBatch } from '../config/config';
import shopifyService from '../services/shopifyService';
import contentController from './contentController';
import htmlUtil from '../utils/htmlUtil';
import logger from '../config/logger';
import { GenerationBatch } from '../models';

const checkCompletedTransactions = async () => {
  for (let batchId in genBatch) {
    if (batchId) {
      let currentBatch: GenerationBatch = genBatch[batchId];
      // check if batch transaction is completed
      if (
        currentBatch &&
        currentBatch.length === currentBatch['results'].length
      ) {
        logger.info(`[CronController] Processing completed batch: ${batchId}`);
        const articleTitle = "Renyi's Fashion Store";
        // generate the html string
        let html = await htmlUtil.generateHTML(articleTitle, genBatch[batchId]);

        // get shopify blog Id
        const shopifyBlogs: IBlog[] = await shopifyService.getBlogIds();
        const blogId = shopifyBlogs[0].id;

        // send html to shopify blog
        await shopifyService.postArticle(blogId, articleTitle, html);
        // delete the completed batch from memory
        delete genBatch[batchId];
      }
    }
  }
};

const checkForTransactionErrors = async () => {
  for (let batchId in genBatch) {
    if (batchId) {
      let currentBatch: GenerationBatch = genBatch[batchId];
      // check if there are errors and retry process them
      if (currentBatch.errors.length > 0) {
        logger.info(
          `[CronController] Processing transactions that failed in batch: ${batchId}`
        );
        currentBatch.errors.forEach((failedProcessId) => {
          const { productId } = failedProcessId;
          if (!productId) {
            logger.warn(
              `[CronController] cannot find productId for failed batch in batch: ${batchId}`
            );
            return;
          }

          // process the failed batch
          contentController.retryGenerateContent(failedProcessId, batchId);
        });
      }
    }
  }
};

export default {
  checkCompletedTransactions,
  checkForTransactionErrors,
};
