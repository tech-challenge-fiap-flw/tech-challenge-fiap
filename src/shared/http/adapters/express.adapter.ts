import { Request, Response, NextFunction } from 'express';
import { HttpRequest, HttpResponse } from '../http.types';

export function toHttpRequest<TBody = any, TParams = any, TQuery = any>(
  req: Request
): HttpRequest<TBody, TParams, TQuery> {
  return {
    body: req.body as TBody,
    params: req.params as unknown as TParams,
    query: req.query as unknown as TQuery,
    user: (req as any).userId
      ? { id: Number((req as any).userId), roles: ((req as any).userRoles ?? []).map(String) }
      : undefined,
  };
}

export function expressHandler<
  TBody = any,
  TParams = any,
  TQuery = any,
  TResp = any
>(
  controller: (req: HttpRequest<TBody, TParams, TQuery>) => Promise<HttpResponse<TResp>>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    controller(toHttpRequest<TBody, TParams, TQuery>(req))
      .then(({ status, body }) =>
        body === undefined ? res.sendStatus(status) : res.status(status).json(body)
      )
      .catch(next);
  };
}
