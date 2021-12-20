import chai from 'chai';
import request from 'supertest';
import httpStatus from 'http-status';
import { genBatch } from '../config/config';

const server = request('http://localhost:8080/v1');
const TEST_PRODUCT_ID = '6646373122099';

describe('Testing content "/generate" route', () => {
  describe(`POST "/generate/:productId" - productId: ${TEST_PRODUCT_ID}`, () => {
    let batchId;
    it('should generate content for 1 product', async () => {
      const response = await server
        .post(`/contents/generate/6646373122099`)
        .send({ isTest: true });

      console.log(response.body);

      chai.expect(response.statusCode).to.eql(httpStatus.OK);
      chai
        .expect(response.body)
        .to.have.all.keys('batchId', 'length', 'message', 'processed');
      chai.expect(response.body.length).to.eql(1);
      chai.expect(response.body.processed.length).to.eql(1);
      batchId = response.body.batchId;
    });
  });

  describe(`POST "/generate" - total products: 5`, () => {
    it('should generate content for 5 product', async () => {
      const response = await server.post(`/contents/generate`).send({
        isTest: true,
        productIds: [
          '6646373154867',
          '6646373122099',
          '6646373285939',
          '6646373187635',
          '6646373220403',
        ],
      });
      // console.log(response.body);
      chai.expect(response.statusCode).to.eql(httpStatus.OK);
      chai
        .expect(response.body)
        .to.have.all.keys('batchId', 'length', 'message', 'processed');
      chai.expect(response.body.length).to.eql(5);
      chai.expect(response.body.processed.length).to.eql(5);
    });
  });
});
