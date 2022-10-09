import request from 'supertest';
import { app } from '../../app';

it('updates the user if one correct property is provided', async () => {
  // create the user
  const userInfo = await getAuthCookie();

  // update the user
  await request(app)
    .patch('/api/users/update-me')
    .set('Cookie', userInfo.cookie)
    .send({ name: 'second_name' })
    .expect(200);

  // get the user
  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', userInfo.cookie)
    .send()
    .expect(200);

  expect(res.body.currentuser.name).toBe('second_name');
});

it('updates the user if all of the correct properties were provided', async () => {
  // create the user
  const userInfo = await getAuthCookie();

  // update the user
  await request(app)
    .patch('/api/users/update-me')
    .set('Cookie', userInfo.cookie)
    .send({ name: 'second_name', email: 'second_test@second_test.com' })
    .expect(200);

  // get the user
  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', userInfo.cookie)
    .send()
    .expect(200);

  expect(res.body.currentuser.name).toBe('second_name');
  expect(res.body.currentuser.email).toBe('second_test@second_test.com');
});

it('does not updates the user if correct properties are not provided', async () => {
  // create the user
  const userInfo = await getAuthCookie();

  // update the user
  await request(app)
    .patch('/api/users/update-me')
    .set('Cookie', userInfo.cookie)
    .send({ role: 'writer' })
    .expect(200);

  // get the user
  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', userInfo.cookie)
    .send()
    .expect(200);

  expect(res.body.currentuser.role).not.toBe('writer');
});
