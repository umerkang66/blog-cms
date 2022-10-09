import { BadRequestError, validateRequest } from '@blog-cms/common';
import { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import { User } from '../models/user';
import { createSendToken } from '../services/create-send-token';
import { SignupAdminEmail } from '../services/emails/signup-admin-email';
import { Password } from '../services/password';

const router = Router();

const validator = [
  body('name').notEmpty().withMessage('Name must be provided.'),
  body('email').isEmail().withMessage('Email provided must be valid.'),
  body('password')
    .trim()
    .isLength({ min: 8, max: 30 })
    .withMessage('Password must be between 8 an 30 characters'),
  body('passwordConfirm')
    .trim()
    .isLength({ min: 8, max: 30 })
    .withMessage('PasswordConfirm must be between 8 an 30 characters'),
];

interface Body {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

router.post(
  '/api/users/signup-admin',
  validator,
  validateRequest,
  async (req: Request<{}, {}, Body>, res: Response) => {
    const { name, email, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      throw new BadRequestError('Password and Password confirm don not match');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // this will automatically be caught by global express error-handling middleware, by express-async-middleware
      throw new BadRequestError('Email in use');
    }

    const user = User.build({ name, email, password });
    const { token, tokenExpires } = Password.createToken();
    const hashedToken = Password.hashToken(token);

    user.adminToken = hashedToken;
    user.adminTokenExpires = new Date(tokenExpires);

    await user.save();

    const emailUser = { name: 'Umer', email: 'ugulzar4512@gmail.com' };
    const signupUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/users/signup-admin/${token}`;

    try {
      await new SignupAdminEmail(emailUser, signupUrl).send();
      res.send({ message: 'Token for signup has sent to your email' });
    } catch (err) {
      user.adminToken = undefined;
      user.adminTokenExpires = undefined;
      await user.save();

      res.send({ message: "Couldn't send the email" });
    }
  }
);

const validatorParam = [
  param('token').notEmpty().withMessage('Token param should be provided'),
];

router.patch(
  '/api/users/signup-admin/:token',
  validatorParam,
  validateRequest,
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const hashedToken = Password.hashToken(token);

    const user = await User.findOne({
      adminToken: hashedToken,
      // if token is greater than current Date, it means it will expire
      // in future (It is valid).
      adminTokenExpires: { $gte: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Token is invalid or expired');
    }

    user.role = 'admin';
    user.adminToken = undefined;
    user.adminTokenExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  }
);

export { router as signupAdminRouter };
