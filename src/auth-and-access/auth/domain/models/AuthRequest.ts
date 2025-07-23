import { Request } from 'express';
import { User } from '../../../user/domain/entities/user.entity';

export interface AuthRequest extends Request {
  user: User;
}