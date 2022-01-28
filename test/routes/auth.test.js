const supertest = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../../index');
const User = require('../../models/user');

process.env.TEST_SUITE = 'test-auth';

describe('POST /api/auth/signup', () => {
  it('should create a user', async () => {
    await supertest(app)
      .post('/api/auth/signup')
      .set('Content-type', 'application/json')
      .send({ email: 'foo@bar.com', password: 'pass123' })
      .expect(201)
      .then(response => {
        const { token } = response.body;
        expect(token).toBeDefined();
        expect(token).toHaveLength(224);
      });
  });

  it('should return an error if the user is not valid', async () => {
    await supertest(app)
      .post('/api/auth/signup')
      .set('Content-type', 'application/json')
      .send({ password: '0'})
      .expect(400)
      .then(response => {
        expect(response.body.error).toMatch(/User validation failed/);
      });
  });
});

describe('POST /api/auth/login', () => {
  it.todo('should log the user in');
  it.todo('should return an error if the user is not found.');
});
