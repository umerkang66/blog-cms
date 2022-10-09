import {
  BadRequestError,
  getCurrentuser,
  requireAuth,
  restrictTo,
} from '@blog-cms/common';
import { Router } from 'express';
import { User } from '../../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

router.post(
  '/api/users',
  currentuserMid,
  requireAuth,
  restrictTo('admin'),
  (req, res) => {
    throw new BadRequestError('This route is not functional use signup');
  }
);

export { router as createUserRouter };
