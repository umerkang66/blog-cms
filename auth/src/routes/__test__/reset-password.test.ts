import request from 'supertest';
import { app } from '../../app';
import { Password } from '../../services/password';
import { User } from '../../models/user';

const setup = async () => {
  const { token, tokenExpires } = Password.createToken();
  const hashedToken = Password.hashToken(token);

  const user = User.build({
    name: 'name',
    email: 'test@test.com',
    password: 'password',
  });
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(tokenExpires);

  await user.save();

  return { user, resetToken: token };
};

it('changes the password, if correct token is provided', async () => {
  const { user, resetToken } = await setup();
  const newPass = 'new_pass';

  await request(app)
    .patch(`/api/users/reset-password/${resetToken}`)
    .send({ password: newPass, passwordConfirm: newPass })
    .expect(200);

  // should sign in with newPass
  await request(app)
    .post('/api/users/signin')
    .send({ email: user.email, password: newPass })
    .expect(200);
});

it('removes the password reset properties', async () => {
  const { user, resetToken } = await setup();
  const newPass = 'new_pass';

  await request(app)
    .patch(`/api/users/reset-password/${resetToken}`)
    .send({ password: newPass, passwordConfirm: newPass })
    .expect(200);

  // again query the user
  const updatedUser = await User.findById(user.id);
  expect(updatedUser!.passwordResetToken).toBeUndefined();
  expect(updatedUser!.passwordResetExpires).toBeUndefined();
});

it('responds with 400, if token has expired', async () => {
  const { user, resetToken } = await setup();
  // token has expired 10 seconds ago
  user.passwordResetExpires = new Date(Date.now() - 10000);
  await user.save();

  const newPass = 'new_pass';
  await request(app)
    .patch(`/api/users/reset-password/${resetToken}`)
    .send({ password: newPass, passwordConfirm: newPass })
    .expect(400);
});
