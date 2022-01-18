const express = require('express');

const router = express.Router();

const Node = require('../models/node');
const User = require('../models/user');
const middleware = require('../middleware');

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

router.get('/children/:id', middleware.verify, async (req, res) => {
  const { id } = req.params;

  /* Our Node schema has a middleware hook to recursively populate children */
  const nodes = await Node.findOne({ _id: id });

  return res.status(200).json({ nodes });
});

router.get('/', middleware.verify, async (req, res) => {
  const { user } = req.body;
  const nodes = await Node.find({ user: user._id, parent: null });

  return res.status(200).json({ nodes });
});

module.exports = router;
