import { getCurrentuser, requireAuth, restrictTo } from '@blog-cms/common';
import { Router } from 'express';
import { getOne as getOneFactory } from '@blog-cms/common';
import { User, UserDocument } from '../../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

router.get(
  '/api/users/:id',
  currentuserMid,
  requireAuth,
  restrictTo('admin'),
  // tell what model should be in the model
  getOneFactory<UserDocument>(User)
);

export { router as getUserRouter };
