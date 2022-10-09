import request from 'supertest';
import { app } from '../../../app';

beforeEach(async () => {
  const body1 = {
    name: 'first_name',
    email: 'test1@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };
  await request(app).post('/api/users/signup').send(body1).expect(201);

  const body2 = {
    name: 'second_name',
    email: 'test2@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };
  await request(app).post('/api/users/signup').send(body2).expect(201);
});

it('responds with all the users', async () => {
  const adminInfo = await getAdminCookie();

  const res = await request(app)
    .get('/api/users')
    .set('Cookie', adminInfo.cookie)
    .send();

  expect(res.body).toHaveLength(3);
});
