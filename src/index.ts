import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import pino from 'pino';

import config from './config';
import authRoute from './routes/auth';
import nodeRoute from './routes/node';

const logger = pino({
  level: 'info',
  // transport: {
  //  target: config.NODE_ENV !== 'production' ? 'pino-pretty' : ''
  // }
});

const app = express();
const MONGO_URL = config.MONGO_URL;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/node', nodeRoute);

if(config.NODE_ENV === 'test') {
  module.exports = app;
} else {
  mongoose.connect(`${MONGO_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true
  } as ConnectOptions);

  const db = mongoose.connection;

  db.once('open', () => logger.info('DB connected.'));
  db.on('error', (error: Error) => logger.info('Error:', error));

  app.listen(5000, () => logger.info('Server started...'));
}
