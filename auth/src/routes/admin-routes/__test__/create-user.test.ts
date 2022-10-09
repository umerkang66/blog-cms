import request from 'supertest';
import { app } from '../../../app';

it('responds with 400', async () => {
  const adminInfo = await getAdminCookie();

  await request(app)
    .post('/api/users')
    .set('Cookie', adminInfo.cookie)
    .send()
    .expect(400);
});
