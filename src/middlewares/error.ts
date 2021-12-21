import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import config from '../config/config';
import logger from '../config/logger';

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
const handler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message: err.message,
    // stack: err.stack,
    ...(config.env === 'dev' && { stack: err.stack }),
  };

  if (config.env === 'dev') {
    logger.error(err);
  }

  res.status(err.statusCode).send(response);
};

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
const converter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
// const notFound = (req, res, next) => {
//   const err = new APIError({
//     message: 'Not found',
//     status: httpStatus.NOT_FOUND,
//   });
//   return handler(err, req, res, next);
// };

export default {
  handler,
  // notFound,
  converter,
};
