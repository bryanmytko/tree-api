import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';

const { TOKEN_SECRET } = process.env;

const verify = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if(!authorization) {
    return res.status(403).json({ error: 'No auth token provided' });
  }

  jwt.verify(authorization, TOKEN_SECRET, (err: Error, value: JwtPayload) => {
    if(err) return res.status(403).json({ error: 'Invalid token' });
    req.user = value.data;
    req.body = { ...req.body, user: value.data }
    next();
  });
}

export default verify;
