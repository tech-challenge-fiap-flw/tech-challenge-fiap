import 'newrelic';

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';

// import { userRouter } from './modules/user/http/user.routes';
// import { vehicleRouter } from './modules/vehicle/http/vehicle.routes';
import { authRouter } from './modules/auth/auth.routes';
// import { vehiclePartRouter } from './modules/vehicle-part/http/vehicle-part.routes';
// import { vehicleServiceRouter } from './modules/vehicle-service/http/vehicle-service.routes';
// import { diagnosisRouter } from './modules/diagnosis/http/diagnosis.routes';
// import { budgetVehicleServiceRouter } from './modules/budget-vehicle-service/http/budget-vehicle-service.routes';
// import { budgetVehiclePartRouter } from './modules/budget-vehicle-part/http/budget-vehicle-part.routes';
// import { budgetRouter } from './modules/budget/http/budget.routes';
// import { serviceOrderRouter } from './modules/service-order/http/service-order.routes';
// import { serviceOrderHistoryRouter } from './modules/service-order-history/http/service-order-history.routes';

const app = express();

app.use(helmet());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = uuidv4();
  
  res.setHeader('X-Correlation-ID', correlationId);

  logger.info({
    message: 'Incoming Request',
    correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      message: 'Request Finished',
      correlationId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/cpu-load', (req, res) => {
  const start = Date.now();
  while (Date.now() - start < 15000) {}
  res.send({ status: 'done' });
});

app.use('/auth', authRouter);
// app.use('/users', userRouter);
// app.use('/vehicles', vehicleRouter);
// app.use('/vehicle-parts', vehiclePartRouter);
// app.use('/vehicle-services', vehicleServiceRouter);
// app.use('/diagnosis', diagnosisRouter);
// app.use('/budgets', budgetRouter);
// app.use('/service-orders', serviceOrderRouter);
// app.use('/service-order-history', serviceOrderHistoryRouter);
// app.use('/budget-vehicle-services', budgetVehicleServiceRouter);
// app.use('/budget-vehicle-parts', budgetVehiclePartRouter);

// app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//   const status = err?.status ?? 500;
//   const message = err?.message ?? 'Internal Server Error';
  
//   logger.error({
//     message: 'Error processing request',
//     error: message,
//     stack: err.stack
//   });

//   res.status(status).json({ error: message });
// });

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});

export default app;
