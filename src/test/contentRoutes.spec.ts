import chai from 'chai';
import request from 'supertest';
import httpStatus from 'http-status';

import testConfig from './testConfig';

const server = request(testConfig.baseURL);

describe('Testing contents "/contents" route', () => {
  describe(`POST "/generate/:productId" - productId: ${testConfig.TEST_PRODUCT_IDS[0]}`, () => {
    it('should generate content for 1 product', async () => {
      const response = await server
        .post(`/contents/generate/6646373122099`)
        .send({ isTest: true });

      chai.expect(response.statusCode).to.eql(httpStatus.OK);
      chai
        .expect(response.body)
        .to.have.all.keys(
          'batchId',
          'length',
          'message',
          'processed',
          'errors'
        );
      chai.expect(response.body.length).to.eql(1);
      chai.expect(response.body.processed.length).to.eql(1);
    });
  });

  describe(`POST "/generate" - total products: 5`, () => {
    it('should generate content for 5 product', async () => {
      const response = await server.post(`/contents/generate`).send({
        isTest: true,
        productIds: testConfig.TEST_PRODUCT_IDS,
      });

      chai.expect(response.statusCode).to.eql(httpStatus.OK);
      chai
        .expect(response.body)
        .to.have.all.keys(
          'batchId',
          'length',
          'message',
          'processed',
          'errors'
        );
      chai.expect(response.body.length).to.eql(5);
      chai.expect(response.body.processed.length).to.eql(5);
    });
  });
});
