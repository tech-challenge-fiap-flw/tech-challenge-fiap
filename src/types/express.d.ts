import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      roles: string[]; // ['admin'] | ['user']
      type: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
