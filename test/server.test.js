const app = require('../index');
const mongoose = require('mongoose');
const supertest = require('supertest');

const MONGO_URL = process.env.MONGO_URL;

beforeEach((done) => {
  mongoose.connect(MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
  });
});
