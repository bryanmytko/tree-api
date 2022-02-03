import express, { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

import config from '../config';
import User from '../models/user';
import verify from '../middleware/verify';

const ROUNDS = 10;
const { TOKEN_SECRET } = config;

const invalidLogin = (res: Response) => res.status(400).json({ error: 'Invalid login.' });

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, ROUNDS);
  const newUser = new User({ email, password: hash });

  try {
    const user = await newUser.save();
    return res.status(201).json({ token: generateToken(user.toObject()) });
  } catch(err) {
    return res.status(400).json({ error: `${err.name}: ${err.message}` });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).lean();

  if(!user) return invalidLogin(res);

  bcrypt.compare(password, user.password, (error, match) => {
    if(error) return res.status(500).json({ error });
    if(match) return res.status(200).json({ token: generateToken(user) })

    return invalidLogin(res);
  });
});

router.get('/verify-token', verify, (req, res) => (
  res.status(200).json({ user: req.user })
));

function generateToken(user: any) {
  const { password, ...data } = user; // strip out the password

  return jwt.sign({ data }, TOKEN_SECRET, { expiresIn: '24h' });
}

export default router;
