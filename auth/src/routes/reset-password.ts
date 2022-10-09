import { BadRequestError, validateRequest } from '@blog-cms/common';
import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import { User } from '../models/user';
import { createSendToken } from '../services/create-send-token';
import { Password } from '../services/password';

const router = Router();

interface ReqBody {
  password: string;
  passwordConfirm: string;
}

const validator = [
  param('token').notEmpty().withMessage('Token param should be provided'),
  body('password')
    .trim()
    .isLength({ min: 8, max: 30 })
    .withMessage('Password must be between 8 an 30 characters'),
  body('passwordConfirm')
    .trim()
    .isLength({ min: 8, max: 30 })
    .withMessage('PasswordConfirm must be between 8 an 30 characters'),
];

router.patch(
  '/api/users/reset-password/:token',
  validator,
  validateRequest,
  async (req: Request<{}, {}, ReqBody>, res: Response) => {
    const { token } = req.params as { token: string };
    const { password, passwordConfirm } = req.body;

    const hashedToken = Password.hashToken(token);

    // query the db using the token provided, remember the token in db is in hashed form
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      // if token_expires_time is greater than current time, means it is not expires till now
      // if token_expires_time is less than current time, means token has already expired
      passwordResetExpires: { $gte: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Token is invalid or expired');
    }
    if (password !== passwordConfirm) {
      throw new BadRequestError('Password and passwordConfirm should match');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  }
);

export { router as resetPasswordRouter };
