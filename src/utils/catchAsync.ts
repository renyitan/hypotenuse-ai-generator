import { Request, Response } from 'express';

const catchAsync = (fn) => (req: Request, res: Response, next: any) => {
  Promise.resolve(fn(req, res, next)).catch((error) => next(error));
};

export default catchAsync;
