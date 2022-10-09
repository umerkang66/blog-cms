import {
  BadRequestError,
  getCurrentuser,
  requireAuth,
  validateRequest,
} from '@blog-cms/common';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { createSendToken } from '../services/create-send-token';
import { Password } from '../services/password';

interface RequestBody {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}
type CustomRequest = Request<{}, {}, RequestBody>;

const router = Router();
const currentuserMid = getCurrentuser(User);

const validator = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 30 })
    .withMessage('You must provide a currentPassword'),
  body('password')
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 30 })
    .withMessage('You must provide a password'),
  body('passwordConfirm')
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 30 })
    .withMessage('You must provide a password'),
];

router.patch(
  '/api/users/update-password',
  validator,
  validateRequest,
  currentuserMid,
  requireAuth,
  async (req: CustomRequest, res: Response) => {
    const { currentPassword, password, passwordConfirm } = req.body;

    // check if current password is right
    const foundUser = await User.findById(req.currentuser!.id);
    if (
      foundUser &&
      !(await Password.compare(currentPassword, foundUser.password))
    ) {
      throw new BadRequestError('Current password is not correct');
    }

    // current password is correct, proceed further
    if (password !== passwordConfirm) {
      throw new BadRequestError('Password and passwordConfirm should match');
    }

    const user = req.currentuser!;
    user.password = password;
    // body hashing, and passwordUpdatedAt middlewares will run from the user model
    await user.save();

    createSendToken(user, 200, req, res);
  }
);

export { router as updatePasswordRouter };
