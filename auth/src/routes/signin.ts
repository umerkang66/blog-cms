import { BadRequestError, validateRequest } from '@blog-cms/common';
import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { createSendToken } from '../services/create-send-token';
import { Password } from '../services/password';

const router = Router();

const validator = [
  body('email')
    .isEmail()
    .withMessage('The email that you have provided must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 30 })
    .withMessage('You must provide a message'),
];

interface RequestBody {
  email: string;
  password: string;
}

router.post(
  '/api/users/signin',
  validator,
  validateRequest,
  async (req: Request<{}, {}, RequestBody>, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('No user exists with this email');
    }

    const correctPassword = await Password.compare(password, user.password);
    if (!correctPassword) {
      throw new BadRequestError('Invalid credentials');
    }

    createSendToken(user, 200, req, res);
  }
);

export { router as signinRouter };
