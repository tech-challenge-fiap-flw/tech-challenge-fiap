import 'newrelic';

import express, { Request, Response, NextFunction } from 'express';
import { logger } from './utils/logger';



const app = express();




app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});



const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});

export default app;
