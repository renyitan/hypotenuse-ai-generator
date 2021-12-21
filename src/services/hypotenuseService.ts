import axios, { AxiosResponse } from 'axios';
import httpStatus from 'http-status';
import config from '../config/config';

import ApiError from '../errors/ApiError';
import logger from '../config/logger';
import { GeneratorRequest, GeneratorResponse } from '../models';

axios.defaults.baseURL = 'https://app.hypotenuse.ai/api/v1';
axios.defaults.headers.common['X-API-KEY'] = config.hypotenuse.apiKey;

/**
 *
 * @param generatorRequest Request body to Generators API
 * @returns Response from Generators API
 */
const generateContent = async (
  generatorRequest: GeneratorRequest
): Promise<GeneratorResponse> => {
  try {
    let response: AxiosResponse = await axios.post(
      'generations/create',
      generatorRequest
    );
    logger.info(
      `[HypotenuseService] Sent "${generatorRequest.product_data.ProductTitle}" to generator!`
    );
    return response.data;
  } catch (error: any) {
    throw new ApiError(httpStatus.NOT_FOUND, error.response.data);
  }
};

export default {
  generateContent,
};
