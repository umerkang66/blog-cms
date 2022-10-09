import request from 'supertest';
import { app } from '../../app';

// validation tests
it('returns a 400 with an invalid email', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test.test.com', password: 'password' })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'pass' })
    .expect(400);
});

it('returns a 400 with missing email or password', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com' })
    .expect(400);

  await request(app)
    .post('/api/users/signin')
    .send({ password: 'password' })
    .expect(400);
});

// Signin tests that will pass the validation tests
it("fails when email doesn't exist that is supplied", async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  // first create the user
  const body = {
    name: 'first_name',
    email: 'test@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };
  await request(app).post('/api/users/signup').send(body).expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'incorrect_password' })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  // first create the user
  const body = {
    name: 'first_name',
    email: 'test@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };
  await request(app).post('/api/users/signup').send(body).expect(201);

  const res = await request(app)
    .post('/api/users/signin')
    .send({ email: body.email, password: body.password })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();
});
