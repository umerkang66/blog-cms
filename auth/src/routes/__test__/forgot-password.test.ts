import request from 'supertest';
import { app } from '../../app';
import { ResetPasswordEmail } from '../../services/emails/reset-password-email';
import { User } from '../../models/user';

let userInfo: {
  email: string;
  password: string;
  cookie: string[];
  id: string;
};

beforeEach(async () => {
  // don't create the user in beforeAll, because in setup file, collections are cleared in beforeEach
  userInfo = await getAuthCookie();
  jest.clearAllMocks();
});

it('responds with 200, after sending the email', async () => {
  await request(app)
    .post('/api/users/forgot-password')
    .send({ email: userInfo.email })
    .expect(200);

  // we don't have to deal with the signup calling the Email, because after signup, mocks are cleared
  expect(ResetPasswordEmail).toHaveBeenCalledTimes(1);
});

it('set the props related to password reset', async () => {
  await request(app)
    .post('/api/users/forgot-password')
    .send({ email: userInfo.email })
    .expect(200);

  const user = await User.findById(userInfo.id);
  expect(user!.passwordResetToken).toBeDefined();
  expect(user!.passwordResetExpires).toBeDefined();
});
