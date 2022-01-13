const express = require('express');

const router = express.Router();

const Node = require('../models/node');
const User = require('../models/user');
const middleware = require('../middleware');

router.post('/create', middleware.verify, (req, res) => {
  const { user, title, payload, parentId = null } = req.body;

  User.findById(user._id).then(user => {
    if(!user) return res.status(400).json({ error: 'User missing.' });

    Node.findById(parentId).then(parent => {
      const newNode = Node({
        title,
        payload,
        user: user._id,
        parent: parent ? parent._id : null
      });
      
      newNode.save()
        .then(user => res.status(201).json({ node: newNode.toObject() }))
        .catch(err => res.status(500).json({ err }))
    });
  });
});

router.get('/:id', middleware.verify, async (req, res) => {
  const { id } = req.params;
  const node = await Node.findById(id);

  if(!node) return res.status(404).json({ error: 'Not found.' });
  const children = await Node.find({ parent: node._id });

  return res.status(200).json({ ...node.toObject(), children });
});

router.get('/children/:id', middleware.verify, async (req, res) => {
  const { id } = req.params;
  const parent = await Node.findById(id);
  const children = await Node.find({ parent: parent._id });

  return res.status(200).json({ node: parent, children });
});

router.get('/', middleware.verify, async (req, res) => {
  const { user } = req.body;
  const nodes = await Node.find({ user: user._id, parent: null });

  return res.status(200).json({ nodes });
});

module.exports = router;
