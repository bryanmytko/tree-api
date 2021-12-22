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
  const depth = req.params.depth || 3; // DEPTH_DEFAULT
  
  const id = req.params.id;
  const node = await Node.findById(id);

  if(!node) return res.status(404).json({ error: 'Not found.' });
  const children = await Node.find({ parent: node._id });

  return res.status(200).json({ ...node.toObject(), children });
});

module.exports = router;
