import chai from 'chai';
import request from 'supertest';
import httpStatus from 'http-status';

import testConfig from './testConfig';

const server = request(testConfig.baseURL);

describe('Testing product "/products" route', () => {
  describe(`GET "/:productId" - productId: ${testConfig.TEST_PRODUCT_IDS[0]}`, () => {
    it('should get back product details', async () => {
      const response = await server.get(
        `/products/${testConfig.TEST_PRODUCT_IDS[0]}`
      );
      chai.expect(response.statusCode).to.eql(httpStatus.OK);
      chai
        .expect(response.body.id)
        .to.eql(parseInt(testConfig.TEST_PRODUCT_IDS[0]));
    });
  });
});
