import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export function validateBody(dtoClass: new () => any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body, { enableImplicitConversion: false });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) {
      const messages = errors.map(e => Object.values(e.constraints ?? {})).flat();
      return res.status(400).json({ success: false, message: messages[0] ?? 'Invalid body' });
    }
    req.body = dto;
    next();
  };
}
