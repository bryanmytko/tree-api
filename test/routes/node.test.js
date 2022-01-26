const supertest = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../../index');
const Node = require('../../models/node');
const User = require('../../models/user');

const { MONGO_TEST_URL, TOKEN_SECRET } = process.env;

beforeEach(done => {
  mongoose.connect(MONGO_TEST_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => done());
});

afterEach(done => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
  });
});

describe('GET /api/node', () => {
  it('should only return top level nodes for the user', async () => {
    const user = await User({ email: 'john@beatles.org', password: 'password' }).save();
    const anotherUser = await User({ email: 'paul@beatles.org', password: 'p@55w0rd' }).save();

    const node1 = await Node({ user, parent: null, slug: 'abc' }).save();
    const node2 = await Node({ user, parent: null, slug: 'rst' }).save();
    const node3 = await Node({ user: anotherUser, parent: null, slug: 'uvw' }).save();
    const node4 = await Node({ user, parent: user, slug: 'xyz' }).save();

    const token = jwt.sign({ data: user.toObject() }, TOKEN_SECRET, { expiresIn: '24h' });

    await supertest(app)
      .get('/api/node')
      .set('authorization', token)
      .expect(200)
      .then((response) => {
        const { nodes } = response.body;
        expect(nodes.length).toEqual(2);
        expect(nodes.map(n => n.slug)).toEqual([nodes[0].slug, nodes[1].slug]);
      });
  });
});
