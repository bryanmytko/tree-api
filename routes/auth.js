const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user');
const middleware = require('../middleware');

const ROUNDS = 10;
const { TOKEN_SECRET } = process.env;

const invalidLogin = (res) => res.status(400).json({ error: 'Invalid login.' });

router.post('/signup', (req, res) => {
  const { email, password } = req.body;

  bcrypt.hash(password, ROUNDS, async (error, hash) => {
    if(error) return res.status(500).json(error);

    const newUser = User({ email, password: hash });
    const user = await newUser.save().catch(error => {
      return res.status(500).json({ error });
    });

    return res.status(200).json({ token: generateToken(user.toObject()) });
  });
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

router.get('/verify-token', middleware.verify, (req, res) => {
  res.status(200).json(req.user);
});

function generateToken(user) {
  const { password, ...data } = user; // strip out the password

  return jwt.sign({ data }, TOKEN_SECRET, { expiresIn: '24h' });
}

module.exports = router;
