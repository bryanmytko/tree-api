const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const authRoute = require('./routes/auth');
const dbURI = 'mongodb://localhost/evenflow';

app.use(express.json());
app.use('/api/auth', authRoute);

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => console.log('DB connected.'));
db.on('error', err => console.log('Error:', err));

app.listen(3000, () => console.log('Server started...'));

