import request from 'supertest';
import { app } from '../../../app';

let body: { id: string };

beforeEach(async () => {
  const constBody = {
    name: 'first_name',
    email: 'test1@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };
  const res = await request(app)
    .post('/api/users/signup')
    .send(constBody)
    .expect(201);

  body = res.body;
});

it('responds with the user', async () => {
  const adminInfo = await getAdminCookie();

  const res = await request(app)
    .get(`/api/users/${body.id}`)
    .set('Cookie', adminInfo.cookie)
    .send();

  expect(res.body.id).toBe(body.id);
});
