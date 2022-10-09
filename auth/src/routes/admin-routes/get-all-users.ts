import { getCurrentuser, requireAuth, restrictTo } from '@blog-cms/common';
import { Router } from 'express';
import { getAll as getAllFactory } from '@blog-cms/common';
import { User, UserDocument } from '../../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

router.get(
  '/api/users',
  currentuserMid,
  requireAuth,
  restrictTo('admin'),
  // tell what model should be in the model
  getAllFactory<UserDocument>(User)
);

export { router as getAllUsersRouter };
