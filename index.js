const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const pino = require('pino-http')();

dotenv.config();

const app = express();
const dbURI = process.env.DB_URI

const authRoute = require('./routes/auth');
const nodeRoute = require('./routes/node');

app.use(pino);
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use((req, res, next) => {
  req.log.info(req.url)
  next();
});
app.use('/api/auth', authRoute);
app.use('/api/node', nodeRoute);

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => console.log('DB connected.'));
db.on('error', err => console.log('Error:', err));

app.listen(3000, () => console.log('Server started...'));

