import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';

it('updates the password of user', async () => {
  // this also signs up the user
  const userInfo = await getAuthCookie();

  await request(app)
    .patch('/api/users/update-password')
    .set('Cookie', userInfo.cookie)
    .send({
      currentPassword: userInfo.password,
      password: 'new_password',
      passwordConfirm: 'new_password',
    })
    .expect(200);

  // it should log in with new_password
  const res = await request(app)
    .post('/api/users/signin')
    .send({ email: userInfo.email, password: 'new_password' })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();

  // it should not log in with old password
  const resWrong = await request(app)
    .post('/api/users/signin')
    .send({ email: userInfo.email, password: userInfo.password })
    .expect(400);

  expect(resWrong.get('Set-Cookie')).toBeUndefined();
});

it('sets the passwordUpdatedAt property', async () => {
  const userInfo = await getAuthCookie();

  await request(app)
    .patch('/api/users/update-password')
    .set('Cookie', userInfo.cookie)
    .send({
      currentPassword: userInfo.password,
      password: 'new_password',
      passwordConfirm: 'new_password',
    })
    .expect(200);

  const user = await User.findById(userInfo.id);
  expect(user?.passwordChangedAt).toBeDefined();
});

it('responds with 400, if password and passwordConfirm is not provided', async () => {
  await request(app)
    .patch('/api/users/update-password')
    .send({ currentPassword: 'password' })
    .expect(400);

  await request(app)
    .patch('/api/users/update-password')
    .send({ password: 'password' })
    .expect(400);

  await request(app)
    .patch('/api/users/update-password')
    .send({ passwordConfirm: 'password' })
    .expect(400);

  await request(app).patch('/api/users/update-password').send({}).expect(400);
});
