import { getCurrentuser, requireAuth, restrictTo } from '@blog-cms/common';
import { Router } from 'express';
import { deleteOne as deleteOneFactory } from '@blog-cms/common';
import { User, UserDocument } from '../../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

router.delete(
  '/api/users/:id',
  currentuserMid,
  requireAuth,
  restrictTo('admin'),
  // tell what model should be in the model
  deleteOneFactory<UserDocument>(User)
);

export { router as deleteUserRouter };
