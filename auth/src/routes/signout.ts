import { getCurrentuser, requireAuth } from '@blog-cms/common';
import { Router } from 'express';
import { User } from '../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

router.post(
  '/api/users/signout',
  currentuserMid,
  requireAuth,
  async (req, res) => {
    res.cookie('jwt', 'logged_out', {
      // expires in 10 minutes from current_time
      expires: new Date(Date.now() + 10 * 1000),
      // can only be modified from backend
      httpOnly: true,
    });

    res.send({ message: 'Logged out' });
  }
);

export { router as signoutRouter };
