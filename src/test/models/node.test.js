const Node = require('../../models/node');
const User = require('../../models/user');

process.env.TEST_SUITE = 'test-node-model';

test('.save should generate a 10 digit slug', async () => {
  const user = await User({ email: 'foo@bar.com', password: 'password' }).save();
  const node = await Node({ user, title: 'A Cool Thing!' }).save();

  expect(node.slug).toHaveLength(10);
});

test('.findOne should recursively find children', async () => {
  const user = await User({ email: 'foo@bar.com', password: 'password' }).save();
  const greatgranddaughter = await Node({ user, title: 'E' }).save();
  const grandson = await Node({ user, title: 'D', children: greatgranddaughter._id }).save();
  const son = await Node({ user, title: 'C' }).save();
  const daughter = await Node({ user, title: 'B', children: [grandson._id] }).save();
  const parent = await Node({ user, title: 'A', children: [daughter, son._id] }).save();

  const foundNode = await Node.findOne({ _id: parent._id });
 
  expect(foundNode.children.map(n => n.title)).toEqual([daughter.title, son.title]);
  expect(foundNode.children[0].children.map(n => n.title)).toEqual([grandson.title]);
  expect(foundNode.children[0].children[0].children.map(n => n.title)).toEqual([greatgranddaughter.title]);
});
