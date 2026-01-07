// import 'dotenv/config'; // Load environment variables BEFORE any other imports to ensure availability
import express, { Request, Response, NextFunction } from 'express';
// import helmet from 'helmet';
// import { userRouter } from './modules/user/http/user.routes';
// import { vehicleRouter } from './modules/vehicle/http/vehicle.routes';
// import { authRouter } from './modules/auth/auth.routes';
// import { vehiclePartRouter } from './modules/vehicle-part/http/vehicle-part.routes';
// import { vehicleServiceRouter } from './modules/vehicle-service/http/vehicle-service.routes';
// import { diagnosisRouter } from './modules/diagnosis/http/diagnosis.routes';
// import { budgetVehicleServiceRouter } from './modules/budget-vehicle-service/http/budget-vehicle-service.routes';
// import { budgetVehiclePartRouter } from './modules/budget-vehicle-part/http/budget-vehicle-part.routes';
// import { budgetRouter } from './modules/budget/http/budget.routes';
// import { serviceOrderRouter } from './modules/service-order/http/service-order.routes';
// import { serviceOrderHistoryRouter } from './modules/service-order-history/http/service-order-history.routes';

const app = express();

import { getCollection } from './infra/mongo/mongo';
// Endpoint de teste para salvar dado no DocumentDB
app.get('/test-mongo', async (_req: Request, res: Response) => {
  try {
    // Conexão com o endpoint real do DocumentDB
    const mongoUser = 'docdbadmin';
    const mongoPassword = encodeURIComponent('Docdb#1234!');
    const mongoHost = 'docdb-cluster-staging.cluster-crcq28iy2w6l.us-east-1.docdb.amazonaws.com:27017';
    process.env.MONGO_URI = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}/?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false&tlsAllowInvalidCertificates=true`;
    const collection = await getCollection('test_collection');
    const result = await collection.insertOne({ msg: 'Teste DocumentDB', date: new Date() });
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// app.use(helmet());
// app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// app.get('/cpu-load', (req, res) => {
//   const start = Date.now();
//   while (Date.now() - start < 15000) {}
//   res.send({ status: 'done' });
// });

// app.use('/auth', authRouter);
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
//   res.status(status).json({ error: message });
// });

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
