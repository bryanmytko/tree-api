const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = process.env;

const verify = (req, res, next) => {
  const { authorization } = req.headers;

  if(!authorization) return res.status(403).json({ error: 'No auth token provided' });

  jwt.verify(authorization, TOKEN_SECRET, (err, value) => {
    if(err) return res.status(403).json({ error: 'Invalid token' });
    req.user = value.data;
    next();
  });
}

module.exports = { verify };
