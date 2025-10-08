export interface HttpRequest<TBody = any, TParams = any, TQuery = any> {
  body: TBody;
  params: TParams;
  query: TQuery;
  user?: { id: number; roles: string[] };
}

export interface HttpResponse<T = any> {
  status: number;
  body?: T;
}
