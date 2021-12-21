import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import httpStatus from 'http-status';
import morgan from 'morgan';
import cron from 'node-cron';

import config from './config';
import ApiError from '../errors/ApiError';
import routes from '../routes/v1/index';
import error from '../middlewares/error';
import cronController from '../controllers/cronController';

/**
 * Express instance
 * @public
 */
const app = express();

// request logging. dev: console | production: file
app.use(morgan(config.logs));

// parse json request body and parse urlencoded request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// mount api v1 routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not Found'));
});

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);
// handle error
app.use(error.handler);

// set up cron service
cron.schedule('*/10 * * * * *', async () => {
  cronController.checkCompletedTransactions();
  cronController.checkForTransactionErrors();
});

app.listen(8080, () => console.log(`🚀 Server started on port ${8080} (dev)`));

export default app;
