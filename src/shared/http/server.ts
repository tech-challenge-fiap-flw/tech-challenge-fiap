import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { json } from 'express';
import authRouter from '../../modules/auth/interface/http/routes/auth.routes';
import usersRouter from '../../modules/users/interface/http/routes/user.routes';
import vehicleRouter from '../../modules/vehicles/interface/http/routes/vehicle.routes';
import diagnosisRouter from '../../modules/diagnoses/interface/http/routes/diagnosis.routes';

export function createServer() {
  const app = express();
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(json());

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/vehicles', vehicleRouter);
  app.use('/diagnoses', diagnosisRouter);

  app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    const status = err?.status || 400;
    res.status(status).json({ success: false, message: err?.message ?? 'Unexpected error' });
  });

  return app;
}
