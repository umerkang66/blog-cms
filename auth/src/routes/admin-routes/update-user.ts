import { getCurrentuser, requireAuth, restrictTo } from '@blog-cms/common';
import { Router } from 'express';
import { updateOne as updateOneFactory } from '@blog-cms/common';
import { User, UserDocument } from '../../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

router.patch(
  '/api/users/:id',
  currentuserMid,
  requireAuth,
  restrictTo('admin'),
  // tell what model should be in the model
  updateOneFactory<UserDocument>(User)
);

export { router as updateUserRouter };
