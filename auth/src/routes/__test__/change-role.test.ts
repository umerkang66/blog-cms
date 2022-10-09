import request from 'supertest';
import { app } from '../../app';

it('changes the role, if correct role is provided', async () => {
  const userInfo = await getAuthCookie();
  await request(app)
    .patch('/api/users/change-role')
    .set('Cookie', userInfo.cookie)
    .send({ role: 'writer' })
    .expect(200);

  // check if role is changed
  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', userInfo.cookie)
    .send();

  const { currentuser } = res.body;
  expect(currentuser.role).toBe('writer');
});

it('does not changes the role, if correct role is not provided', async () => {
  const userInfo = await getAuthCookie();
  await request(app)
    .patch('/api/users/change-role')
    .set('Cookie', userInfo.cookie)
    .send({ role: 'admin' })
    .expect(400);

  // check if role is not changed
  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', userInfo.cookie)
    .send();

  const { currentuser } = res.body;
  expect(currentuser.role).toBe('user');
});
