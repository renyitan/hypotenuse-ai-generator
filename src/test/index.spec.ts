// import express from 'express';
import chai from 'chai';
import request from 'supertest';
import httpStatus from 'http-status';
// import express from '../config/express';

const server = request('http://localhost:8080/v1');

describe('Testing health check route', () => {
  describe(`GET "/status"`, () => {
    it('should get back status 200', async () => {
      const response = await server.get(`/status`);
      console.log(response.statusCode);
      chai.expect(response.statusCode).to.eql(httpStatus.OK);
    });
  });
});
