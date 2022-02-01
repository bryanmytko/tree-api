import { RequestHandler, Response, Router } from 'express';

import Node from '../models/node';
import User from '../models/user';
import verify from '../middleware/verify';
import { recursivelyFindChildren } from '../util';

const router = Router();

router.get('/', verify, async (req: Request, res: Response) => {
  // const { user } = req.body;
  // const nodes = await Node.find({ user: user._id, parent: null });

  return res.status(200)//.json({ nodes });
});

/* This endpoint is deprecated as /:id accomplishes the same */
router.get('/children/:id', verify, async (req: TypedRequestParams<{ id: string }>, res: Response) => {
  const { id } = req.params;

  /* Our Node schema has a middleware hook to recursively populate children */
  const node = await Node.findOne({ _id: id });
  if(!node) return res.status(404).json({ error: 'Not found.' });

  return res.status(200).json({ node });
});

router.get('/:id', verify, async (req, res) => {
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

router.post('/create', verify, async (req, res) => {
  const { user, title, payload, parentId = null } = req.body;

  const foundUser = await User.findById(user._id);
  const parent = await Node.findById(parentId);

  if(!foundUser) return res.status(400).json({ error: 'User missing.' });

  const newNode = new Node({
    title,
    payload,
    user: user._id,
    parent: parent ? parent._id : null
  });

  if(parent){
    parent.children.push(newNode._id);
    await parent.save();
  }

  try {
    await newNode.save();
    return res.status(201).json({ node: newNode.toObject() });
  } catch(err) {
    return res.status(400).json({ error: `${err.name}: ${err.message}` });
  }
});

router.put('/update/:id', verify, async (req, res) => {
  const { id } = req.params;
  const { title, payload, private: pr } = req.body;

  await Node.findByIdAndUpdate(id, { title, payload, private: pr });
  const node = await Node.findById(id);

  if(!node) return res.status(404).json({ error: 'Not found.' });

  return res.status(200).json({ node });
});

router.put('/private/:id', verify, async (req, res) => {
  const { id } = req.params;
  const node = await Node.findById(id);

  if(!node) return res.status(404).json({ error: 'Not found.' });

  await Node.findByIdAndUpdate(id, { private: !node.private });
  const updatedNode = await Node.findById(id);

  return res.status(200).json({ node: updatedNode });
});

router.delete('/delete/:id', verify, async (req, res)  => {
  const { id } = req.params;
  const node = await Node.findOne({ _id: id });

  /* We don't want to give any insight if the node does not exist */
  if(!node) return res.status(200).json({});

  const nodeIds = recursivelyFindChildren(node.toObject(), '_id');

  try {
    await Node.deleteMany({ _id: { $in: nodeIds }});
    return res.status(200).json({});
  } catch(err) {
    return res.status(500).json({ err });
  }
});

export default router;
