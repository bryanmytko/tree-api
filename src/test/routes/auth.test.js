const supertest = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../../index');
const User = require('../../models/user').default;

const { TOKEN_SECRET } = process.env;
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
  const params = { email: 'foo@bar.com', password: 'pass123' };

  it('should log the user in', async () => {
    await supertest(app)
      .post('/api/auth/signup')
      .set('Content-type', 'application/json')
      .send(params);

    await supertest(app)
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(params)
      .expect(200)
      .then(response => {
        const { token } = response.body;
        expect(token).toBeDefined();
        expect(token).toHaveLength(224);
      });
  });

  it('should return an error if the user is not found.', async () => {
    await supertest(app)
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(params)
      .expect(400)
      .then(response => {
        expect(response.body.error).toEqual('Invalid login.');
      });
  });
});

describe('GET /api/auth/verify-token', () => {
  it('should verify a valid token', async () => {
    const user = await User({ email: 'john@beatles.org', password: 'password' }).save();
    const token = jwt.sign({ data: user.toObject() }, TOKEN_SECRET, { expiresIn: '24h' });

    await supertest(app)
      .get('/api/auth/verify-token')
      .set('Content-type', 'application/json')
      .set('authorization', token)
      .expect(200)
      .then(response => {
        expect(response.body.user.email).toEqual(user.email);
      });
  });

  it('should return a 403 for an invalid token', async () => {
    await supertest(app)
      .get('/api/auth/verify-token')
      .set('Content-type', 'application/json')
      .set('authorization', '1234')
      .expect(403)
  });
});
