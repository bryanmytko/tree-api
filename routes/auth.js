const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user');
const middleware = require('../middleware');

const ROUNDS = 10;
const { TOKEN_SECRET } = process.env;

const invalidLogin = () => res.status(400).json({ error: 'Invalid login.' });

router.post('/signup', (req, res) => {
  const { email, password } = req.body;

  bcrypt.hash(password, ROUNDS, (error, hash) => {
    if(error) return res.status(500).json(error);

    const newUser = User({ email, password: hash });
    newUser.save()
      .then(user => res.status(200).json({ token: generateToken(user.toObject()) }))
      .catch(err => res.status(500).json({ err }))
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = User.findOne({ email })
    .lean()
    .then(user => {
      if(!user) return invalidLogin()
      bcrypt.compare(password, user.password, (error, match) => {
        if(error) return res.status(500).json({ error });
        if(match) return res.status(200).json({ token: generateToken(user) })

        return invalidLogin()
      });
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
