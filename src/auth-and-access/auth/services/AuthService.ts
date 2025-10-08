import jwt, { SignOptions } from 'jsonwebtoken';
import * as ms from 'ms'; 

type JwtPayload = {
  sub: string;
  roles: string[];
  type: string;
};

export class AuthService {
  static signAccessToken(payload: JwtPayload) {
    const secret = process.env.JWT_SECRET!;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '15m') as ms.StringValue;;

    const options: SignOptions = { 
        expiresIn: expiresIn
    };

    console.log(`secret ${secret}`);
    console.log(`expiresIn ${expiresIn}`);
    console.log(`options ${JSON.stringify(options)}`);

    return jwt.sign(payload, secret, options);
  }

  static signRefreshToken(payload: Pick<JwtPayload, 'sub'>) {
    const secret = process.env.JWT_REFRESH_SECRET!;
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as ms.StringValue;

    const options: SignOptions = {
      expiresIn: expiresIn
    };
    
    return jwt.sign({ sub: payload.sub }, secret, options);
  }

  static verifyAccessToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET!;
    return jwt.verify(token, secret) as JwtPayload;
  }

  static verifyRefreshToken(token: string): { sub: string } {
    const secret = process.env.JWT_REFRESH_SECRET!;
    return jwt.verify(token, secret) as { sub: string };
  }
}
