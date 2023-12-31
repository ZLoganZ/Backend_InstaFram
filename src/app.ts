import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import routers from './routers';
import { CustomError } from './types';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routers);

app.get('/', (_, res) => {
  res.send('Hello world');
});

// handling error
app.use((_, __, next) => {
  const error = new CustomError('Not found', 404);
  next(error);
});

app.use((error: CustomError, _: express.Request, res: express.Response, __: express.NextFunction) => {
  res.status(error.code || 500).json({
    status: error.code || 500,
    message: error.message || 'Internal server error'
  });
});

export default app;
