import request from 'supertest';
import { app } from '../../../app';

it('updates the user', async () => {
  // create the user: signup
  const body = {
    name: 'first_name',
    email: 'test@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };
  const res = await request(app)
    .post('/api/users/signup')
    .send(body)
    .expect(201);

  // updates user user as admin
  const adminInfo = await getAdminCookie();
  const res2 = await request(app)
    .patch(`/api/users/${res.body.id}`)
    .set('Cookie', adminInfo.cookie)
    .send({ email: 't@t.com' })
    .expect(200);

  expect(res2.body.email).toBe('t@t.com');
});
