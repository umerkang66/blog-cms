import request from 'supertest';
import { app } from '../../../app';

it('deletes the user', async () => {
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

  // delete user user as admin
  const adminInfo = await getAdminCookie();
  await request(app)
    .delete(`/api/users/${res.body.id}`)
    .set('Cookie', adminInfo.cookie)
    .send()
    .expect(204);

  // deleted cannot login into the app
  await request(app)
    .post('/api/users/signin')
    .send({ email: body.email, password: body.password })
    .expect(400);
});
