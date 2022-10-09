import {
  BadRequestError,
  InternalServerError,
  validateRequest,
} from '@blog-cms/common';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { ResetPasswordEmail } from '../services/emails/reset-password-email';
import { Password } from '../services/password';

const router = Router();

const validator = [
  body('email').notEmpty().isEmail().withMessage('Email must be provided'),
];

router.post(
  '/api/users/forgot-password',
  validator,
  validateRequest,
  async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('There is not user with this email');
    }

    const { token, tokenExpires } = Password.createToken();
    const hashedToken = Password.hashToken(token);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(tokenExpires);
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/users/reset-password/${token}`;
    const emailUser = { name: user.name, email: user.email };

    try {
      await new ResetPasswordEmail(emailUser, resetUrl).send();

      res.send({ message: 'Reset url is sent to the email' });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      throw new InternalServerError('There was error sending the email');
    }
  }
);

export { router as forgotPasswordRouter };
