import express, { NextFunction, Request, Response } from 'express';
import { makeAuthRouter } from './auth-and-access/auth/routes/authRoutes';
import { makeVehicleRouter } from './administrative-management/vehicle/routes/vehicleRoutes';
import { makeUserRouter } from './auth-and-access/user/routes/userRoutes';
import { vehicleController, userController, authController } from './container';
import { jwtAuth } from './auth-and-access/auth/middleware/jwtAuth';
import cors from 'cors'; 

export function buildApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/administrative-management/vehicle', jwtAuth, makeVehicleRouter(vehicleController));

  app.use('/auth-and-access/auth', makeAuthRouter(authController));
  app.use('/auth-and-access/users', makeUserRouter(userController));

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    console.error(err);

    return res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}