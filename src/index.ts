// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

import app from './config/express';
import logger from './config/logger';
let server;


const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

// server error handlers
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

export default app;
