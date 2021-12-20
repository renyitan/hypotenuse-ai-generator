import chai from 'chai';
import request from 'supertest';
import httpStatus from 'http-status';
import config from '../config/config';

const server = request('http://localhost:8080/v1');

describe('Testing product "/products" route', () => {
  const TEST_PRODUCT_ID = '6646373122099';
  describe(`GET "/:productId" - productId: ${TEST_PRODUCT_ID}`, () => {
    it('should get back product details', async () => {
      const response = await server.get(`/products/6646373122099`);
      chai.expect(response.statusCode).to.eql(httpStatus.OK);
      chai.expect(response.body.id).to.eql(parseInt(TEST_PRODUCT_ID));
    });
  });
});
