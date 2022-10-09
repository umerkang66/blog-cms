import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/user';

const signToken = (userId: string) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_KEY!, {
    // This jwt token will expires in the time specified (automatically logs out after certain period of time)
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
  return token;
};

export const createSendToken = (
  user: UserDocument,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user.id);
  const expiresIn =
    // this cookie_expires_in is in days, convert it into milliseconds
    parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 60 * 1000;

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + expiresIn),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  res.status(statusCode).send(user);
};
