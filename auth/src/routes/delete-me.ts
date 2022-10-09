import { getCurrentuser, requireAuth } from '@blog-cms/common';
import { Router } from 'express';
import { User } from '../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

router.delete(
  '/api/users/delete-me',
  currentuserMid,
  requireAuth,
  async (req, res) => {
    await User.findByIdAndDelete(req.currentuser!.id);
    res.status(204).send(null);
  }
);

export { router as deleteMeRouter };
