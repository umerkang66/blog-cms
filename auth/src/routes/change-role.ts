import {
  BadRequestError,
  getCurrentuser,
  requireAuth,
  validateRequest,
} from '@blog-cms/common';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import type { Role } from '../common-types/role';

const router = Router();
const currentuserMid = getCurrentuser(User);

// only these two roles are allowed for normal users
const allowedRoles: Role[] = ['writer', 'user'];
const validator = [
  body('role').notEmpty().withMessage('Role should be provided'),
];

router.patch(
  '/api/users/change-role',
  currentuserMid,
  requireAuth,
  validator,
  validateRequest,
  async (req: Request<{}, {}, { role: Role }>, res: Response) => {
    const { role } = req.body;
    if (!allowedRoles.includes(role)) {
      throw new BadRequestError('Invalid role');
    }

    const user = req.currentuser!;
    user.role = role;
    await user.save();

    res.send({ message: 'Successfully changed the role' });
  }
);

export { router as changeRoleRouter };
