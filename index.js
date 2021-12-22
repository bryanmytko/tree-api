const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const dbURI = 'mongodb://localhost/tree-api';

const authRoute = require('./routes/auth');
const nodeRoute = require('./routes/node');

app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/node', nodeRoute);

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => console.log('DB connected.'));
db.on('error', err => console.log('Error:', err));

app.listen(3000, () => console.log('Server started...'));

