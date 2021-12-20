import config, { genBatch } from '../config/config';
import { IBlog } from 'shopify-api-node';
import shopifyService from '../services/shopifyService';
import htmlUtil from '../utils/htmlUtil';

const checkCompletedTransactions = async () => {
  for (let batchId in genBatch) {
    if (batchId) {
      let currentBatch = genBatch[batchId];
      // check if batch transaction is completed
      if (
        currentBatch &&
        currentBatch.length === currentBatch['results'].length
      ) {
        console.log(`[Cron] Processing completed batch: ${batchId}`);
        const articleTitle = "Renyi's Fashion Store";
        // generate the html string
        let html = await htmlUtil.generateHTML(articleTitle, genBatch[batchId]);

        // get shopify blog Id
        const shopifyBlogs: IBlog[] = await shopifyService.getBlogIds();
        const blogId = shopifyBlogs[0].id;

        // send html to shopify blog
        await shopifyService.postArticle(blogId, articleTitle, html);
        console.log('[Cron] Successfully uploaded to Shopify blog');
        // delete the completed batch from memory
        delete genBatch[batchId];
      }
    }
  }
};

export default {
  checkCompletedTransactions,
};
