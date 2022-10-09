import request from 'supertest';
import { app } from '../../app';

it('deletes the currentuser', async () => {
  const userInfo = await getAuthCookie();

  await request(app)
    .delete('/api/users/delete-me')
    .set('Cookie', userInfo.cookie)
    .send()
    .expect(204);

  // Now the user cannot sign in
  await request(app)
    .post('/api/users/signin')
    .send({ email: userInfo.email, password: userInfo.password })
    .expect(400);
});
