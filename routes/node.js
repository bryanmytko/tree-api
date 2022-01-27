const express = require('express');

const router = express.Router();

const Node = require('../models/node');
const User = require('../models/user');
const middleware = require('../middleware');

const recursivelyFindChildren = (obj, searchKey, results = []) => {
  const r = results;

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if(key === searchKey){
      r.push(value.toString());
    } else if(key === 'children' && obj[key].length){
      value.forEach(node => recursivelyFindChildren(node, searchKey, r));
    }
  });

  return r;
};

router.get('/', middleware.verify, async (req, res) => {
  const { user } = req.body;
  const nodes = await Node.find({ user: user._id, parent: null });

  return res.status(200).json({ nodes });
});


router.get('/children/:id', middleware.verify, async (req, res) => {
  const { id } = req.params;

  /* Our Node schema has a middleware hook to recursively populate children */
  const nodes = await Node.findOne({ _id: id });

  return res.status(200).json({ nodes });
});

router.get('/:id', middleware.verify, async (req, res) => {
  const { id } = req.params;
  const node = await Node.findById(id)
    .populate({
      path: 'children',
      model: 'Node'
    });

  if(!node) return res.status(404).json({ error: 'Not found.' });

  return res.status(200).json({ node });
});

/* This is a public URL and does not require verification */
router.get('/slug/:id', async (req, res) => {
  const { id: slug } = req.params;
  const node = await Node.findOne({ slug });

  if(!node) return res.status(404).json({ error: 'Not found.' });

  return res.status(200).json({ node });
});

router.post('/create', middleware.verify, async (req, res) => {
  const { user, title, payload, parentId = null } = req.body;

  const foundUser = await User.findById(user._id);
  const parent = await Node.findById(parentId);

  if(!foundUser) return res.status(400).json({ error: 'User missing.' });

  const newNode = Node({
    title,
    payload,
    user: user._id,
    parent: parent ? parent._id : null
  });

  if(parent){
    parent.children.push(newNode);
    await parent.save();
  }

  try {
    await newNode.save();
    return res.status(201).json({ node: newNode.toObject() });
  } catch(err) {
    return res.status(500).json({ err });
  }
});

router.put('/update/:id', middleware.verify, async (req, res) => {
  const { id } = req.params;
  const { title, payload, private: pr } = req.body;

  await Node.findByIdAndUpdate(id, { title, payload, private: pr });
  const node = await Node.findById(id);

  return res.status(200).json({ node });
});

router.put('/private/:id', middleware.verify, async (req, res) => {
  const { id } = req.params;
  const node = await Node.findById(id);
  const updatedNode = await Node.findByIdAndUpdate(id, { private: !node.private });

  return res.status(200).json({ node: updatedNode });
});

router.delete('/delete/:id', middleware.verify, async (req, res)  => {
  const { id } = req.params;
  const nodes = await Node.findOne({ _id: id });
  const nodeIds = recursivelyFindChildren(nodes.toObject(), '_id');

  try {
    await Node.deleteMany({ _id: { $in: nodeIds }});
    return res.status(200).json({});
  } catch(err) {
    return res.status(500),json({ err });
  }
});

module.exports = router;
