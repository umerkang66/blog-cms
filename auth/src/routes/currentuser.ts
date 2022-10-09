import { Router } from 'express';
import { getCurrentuser, requireAuth } from '@blog-cms/common';
import { User } from '../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

router.get('/api/users/currentuser', currentuserMid, (req, res) => {
  res.send({ currentuser: req.currentuser || null });
});

export { router as currentuserRouter };
