import express, { NextFunction, Request, Response } from 'express';
import { makeVehicleRouter } from './administrative-management/vehicle/routes/vehicleRoutes';
import { vehicleController } from './container';
import { AppError } from './errors/AppError';

export function buildApp() {
  const app = express();
  app.use(express.json());

  // mount module under same pattern as Nest
  app.use('/administrative-management/vehicle', makeVehicleRouter(vehicleController));

  // global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
