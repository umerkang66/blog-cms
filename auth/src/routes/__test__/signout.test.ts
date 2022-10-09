import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
  const userInfo = await getAuthCookie();

  const res = await request(app)
    .post('/api/users/signout')
    .set('Cookie', userInfo.cookie)
    .send({})
    .expect(200);

  // there should be a cookie with jwt in the cookies array, and that should contain cookieItem
  res.get('Set-Cookie').forEach(cookieItem => {
    expect(cookieItem).toContain('logged_out');
  });
});
