const supertest = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../../index');
const Node = require('../../models/node');
const User = require('../../models/user');

const { MONGO_TEST_URL, TOKEN_SECRET } = process.env;

let user;
let token;

beforeEach(done => {
  mongoose.connect(MONGO_TEST_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => done());
});

beforeEach(async () => {
  user = await User({ email: 'john@beatles.org', password: 'password' }).save();
  token = jwt.sign({ data: user.toObject() }, TOKEN_SECRET, { expiresIn: '24h' });
});

afterEach(done => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
  });
});

describe('GET /api/node', () => {
  it('should only return top level nodes for the user', async () => {
    const title = 'foo';
    const anotherUser = await User({ email: 'paul@beatles.org', password: 'p@55w0rd' }).save();
    const node1 = await Node({ user, title, parent: null, slug: 'abc' }).save();
    const node2 = await Node({ user, title, parent: null, slug: 'rst' }).save();
    const node3 = await Node({ user: anotherUser, title, parent: null, slug: 'uvw' }).save();
    const node4 = await Node({ user, title, parent: user, slug: 'xyz' }).save();

    await supertest(app)
      .get('/api/node')
      .set('authorization', token)
      .expect(200)
      .then(response => {
        const { nodes } = response.body;
        expect(nodes.length).toEqual(2);
        expect(nodes.map(n => n.slug)).toEqual([node1.slug, node2.slug]);
      });
  });

  it('should return an empty collection if no nodes exist', async () => {
    await supertest(app)
      .get('/api/node')
      .set('authorization', token)
      .expect(200)
      .then(response => {
        const { nodes } = response.body;
        expect(nodes).toEqual([]);
        expect(nodes.length).toEqual(0);
      });
  });
});

describe('GET /api/node/children/:id', () => {
  it('should recursively get node and all children', async () => {
    const title = 'foo';
    const grandchild = await Node({ user, title, slug: 'abc' }).save();
    const child2 = await Node({ user, title, children: [grandchild._id], slug: 'rst' }).save();
    const child = await Node({ user, title, slug: 'uvw' }).save();
    const parent = await Node({ user, title, children: [child._id, child2._id], slug: 'xyz' }).save()

    await supertest(app)
      .get(`/api/node/children/${parent._id}`)
      .set('authorization', token)
      .expect(200)
      .then(response => {
        const { node } = response.body;
        expect(node.slug).toEqual(parent.slug);
        expect(node.children.map(n => n.slug)).toEqual([child.slug, child2.slug]);
        expect(node.children[1].children[0].slug).toEqual(grandchild.slug);
      });
  });

  it('should return a 404 if the node does not exist', async () => {
    await supertest(app)
      .get('/api/node/children/61f25e036a52eef36905d1f9')
      .set('authorization', token)
      .expect(404)
      .then(response => {
        expect(response.body.error).toEqual('Not found.');
      });
  });
});

describe('GET /api/node/:id', () => {
  it('should recursively get node and all children', async () => {
    const title = 'foo';
    const grandchild = await Node({ user, title, slug: 'abc' }).save();
    const child2 = await Node({ user, title, children: [grandchild._id], slug: 'rst' }).save();
    const child = await Node({ user, title, slug: 'uvw' }).save();
    const parent = await Node({ user, title, children: [child._id, child2._id], slug: 'xyz' }).save()

    await supertest(app)
      .get(`/api/node/${parent._id}`)
      .set('authorization', token)
      .expect(200)
      .then(response => {
        const { node } = response.body;
        expect(node.slug).toEqual(parent.slug);
        expect(node.children.map(n => n.slug)).toEqual([child.slug, child2.slug]);
        expect(node.children[1].children[0].slug).toEqual(grandchild.slug);
      });
  });

  it('should return a 404 if the node does not exist', async () => {
    await supertest(app)
      .get('/api/node/61f25e036a52eef36905d1f9')
      .set('authorization', token)
      .expect(404)
      .then(response => {
        expect(response.body.error).toEqual('Not found.');
      });
  });
});

describe('GET /api/node/slug/:id', () => {
  it('should get node by slug and not require auth', async () => {
    const title = 'foo';
    const grandchild = await Node({ user, title, slug: 'abc' }).save();
    const child2 = await Node({ user, title, children: [grandchild._id], slug: 'rst' }).save();
    const child = await Node({ user, title, slug: 'uvw' }).save();
    const parent = await Node({ user, title, children: [child._id, child2._id], slug: 'xyz' }).save()

    await supertest(app)
      .get(`/api/node/slug/${parent.slug}`)
      .expect(200)
      .then(response => {
        const { node } = response.body;
        expect(node.slug).toEqual(parent.slug);
        expect(node.children.map(n => n.slug)).toEqual([child.slug, child2.slug]);
        expect(node.children[1].children[0].slug).toEqual(grandchild.slug);
      });
  });

  it('should return a 404 if the node does not exist', async () => {
    await supertest(app)
      .get('/api/node/slug/9000')
      .set('authorization', token)
      .expect(404)
      .then(response => {
        expect(response.body.error).toEqual('Not found.');
      });
  });
});

describe('POST /api/node/create', () => {
  it('should create a node if the request is valid', async () => {
    const request = { user, title: 'Baseball', payload: 'Lorem ipsum.' };
    await supertest(app)
      .post('/api/node/create')
      .set('Content-type', 'application/json')
      .set('authorization', token)
      .send(request)
      .expect(201)
      .then(response => {
        const { node } = response.body;
        expect(node.title).toEqual(request.title);
        expect(node.payload).toEqual(request.payload);
      });
  });

  it('should return a 400 if the user is not found', async () => {
    const anotherUser = User({ email: 'paul@beatles.org', password: 'p@55w0rd' });
    const anotherToken = jwt.sign({ data: anotherUser.toObject() }, TOKEN_SECRET, { expiresIn: '24h' });
    const request = { anotherUser, title: 'Baseball', payload: 'Lorem ipsum.' };

    await supertest(app)
      .post('/api/node/create')
      .set('Content-type', 'application/json')
      .set('authorization', anotherToken)
      .send(request)
      .expect(400)
      .then(response => {
        expect(response.body.error).toEqual('User missing.');
      });
  });

  it('should return a 400 if the request is invalid', async () => {
    const request = {};

    await supertest(app)
      .post('/api/node/create')
      .set('Content-type', 'application/json')
      .set('authorization', token)
      .send(request)
      .expect(400)
      .then(response => {
        expect(response.body.error).toMatch(/ValidationError/);
      });
  });
});

describe('PUT /api/node/update/:id', () => {
  it('should update a node if the request is valid', async () => {
    const node = await Node({ user, title: 'Arrow', payload: 'Lorem Ipsum.' }).save();
    const request = { user, title: 'Green Arrow' };

    await supertest(app)
      .put(`/api/node/update/${node._id}`)
      .set('Content-type', 'application/json')
      .set('authorization', token)
      .send(request)
      .expect(200)
      .then(response => {
        const { node } = response.body;
        expect(node.title).toEqual(request.title);
        expect(node.payload).toEqual('Lorem Ipsum.');
      });
  });

  it('should return a 404 if the node does not exist', async () => {
    const node = await Node({ user, title: 'Arrow', payload: 'Lorem Ipsum.' });
    const request = { user, title: 'Green Arrow' };

    await supertest(app)
      .put(`/api/node/update/${node._id}`)
      .set('Content-type', 'application/json')
      .set('authorization', token)
      .send(request)
      .expect(404)
      .then(response => {
        expect(response.body.error).toEqual('Not found.');
      });
  });
});
