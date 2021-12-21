import chai from 'chai';
import request from 'supertest';
import httpStatus from 'http-status';

import testConfig from './testConfig';

const server = request(testConfig.baseURL);

describe('Testing health check route', () => {
  describe(`GET "/status"`, () => {
    it('should get back status 200', async () => {
      const response = await server.get(`/status`);
      chai.expect(response.statusCode).to.eql(httpStatus.OK);
    });
  });
});
