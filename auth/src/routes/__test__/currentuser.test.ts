import request from 'supertest';
import { app } from '../../app';

it('responds with details about the currentuser, if user is logged in', async () => {
  const userInfo = await getAuthCookie();

  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', userInfo.cookie)
    .send()
    .expect(200);

  expect(res.body.currentuser.email).toBe(userInfo.email);
});

it('responds undefined if user is not logged in', async () => {
  const res = await request(app).get('/api/users/currentuser').send();

  const { currentuser } = res.body;
  expect(currentuser).toBeNull();
});
