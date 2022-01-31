import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
const { TOKEN_SECRET } = process.env;

interface JwtPayload {
  data: string;
}

interface Request {
  user: string,
  body: string
}

const verify = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if(!authorization) {
    return res.status(403).json({ error: 'No auth token provided' });
  }

  jwt.verify(authorization, TOKEN_SECRET, (err, value: JwtPayload) => {
    if(err) return res.status(403).json({ error: 'Invalid token' });
    req.user = value.data;
    req.body = { ...req.body, user: value.data }
    next();
  });
}

module.exports = { verify };
