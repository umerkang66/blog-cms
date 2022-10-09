import { type Request, type Response, Router } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@blog-cms/common';
import { User } from '../models/user';
import { createSendToken } from '../services/create-send-token';
import { WelcomeEmail } from '../services/emails/welcome-email';

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

interface RequestBody {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

router.post(
  '/api/users/signup',
  validator,
  validateRequest,
  async (req: Request<{}, {}, RequestBody>, res: Response) => {
    // at this point, this should be already updated.
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
    await user.save();

    // Generate JWT: first is payload then secret, this id is generated by mongoose, not mongodb
    createSendToken(user, 201, req, res);

    const emailUser = { name: user.name, email: user.email };
    const emailUrl = 'http://blog-cms.dev';
    new WelcomeEmail(emailUser, emailUrl).send();
  }
);

export { router as signupRouter };
