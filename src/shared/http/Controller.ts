import { Request, Response, NextFunction } from 'express';
import { HttpError } from './HttpError';

export interface HttpRequest<TBody = any, TParams = any, TQuery = any> {
  body: TBody;
  params: TParams;
  query: TQuery;
  user?: any;
  raw: Request;
}

export interface HttpResponse<T = any> {
  status: number;
  body?: T;
}

export interface Controller<TReq = any, TRes = any> {
  handle(request: HttpRequest<TReq>): Promise<HttpResponse<TRes>>;
}

export function adaptExpress(controller: Controller) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const httpRequest: HttpRequest = {
        body: req.body,
        params: req.params,
        query: req.query,
        user: (req as any).user,
        raw: req,
      };

      const httpResponse = await controller.handle(httpRequest);

      if (httpResponse.body === undefined) {
        return res.status(httpResponse.status).send();
      }

      return res.status(httpResponse.status).json(httpResponse.body);
    } catch (err: any) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message, details: err.details });
      }

      next(err);
    }
  };
}
