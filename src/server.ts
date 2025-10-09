import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { userRouter } from './modules/user/http/user.routes';
import { vehicleRouter } from './modules/vehicle/http/vehicle.routes';
import { authRouter } from './modules/auth/auth.routes';
import { vehiclePartRouter } from './modules/vehicle-part/http/vehicle-part.routes';
import { vehicleServiceRouter } from './modules/vehicle-service/http/vehicle-service.routes';
import { diagnosisRouter } from './modules/diagnosis/http/diagnosis.routes';
import { budgetRouter } from './modules/budget/http/budget.routes';
import { serviceOrderRouter } from './modules/service-order/http/service-order.routes';

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/vehicles', vehicleRouter);
app.use('/vehicle-parts', vehiclePartRouter);
app.use('/vehicle-services', vehicleServiceRouter);
app.use('/diagnosis', diagnosisRouter);
app.use('/budgets', budgetRouter);
app.use('/service-orders', serviceOrderRouter);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status ?? 500;
  const message = err?.message ?? 'Internal Server Error';
  res.status(status).json({ error: message });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
