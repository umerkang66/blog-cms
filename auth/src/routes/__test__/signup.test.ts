import request from 'supertest';
import { app } from '../../app';
import { WelcomeEmail } from '../../services/emails/welcome-email';

beforeEach(() => {
  jest.clearAllMocks();
});

it('returns 201 on successful signup', async () => {
  const body = {
    name: 'first_name',
    email: 'test@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };
  await request(app).post('/api/users/signup').send(body).expect(201);
});

it('returns 400 with an invalid email', async () => {
  const body = {
    name: 'first_name',
    email: 'test.test.com',
    password: 'password',
    passwordConfirm: 'password',
  };
  await request(app).post('/api/users/signup').send(body).expect(400);
});

it('returns 400 with an invalid password', async () => {
  const body = {
    name: 'first_name',
    email: 'test.test.com',
    password: 'password',
    passwordConfirm: 'pass',
  };
  await request(app).post('/api/users/signup').send(body).expect(400);
});

it('returns 400 with missing email or password, or both', async () => {
  await request(app).post('/api/users/signup').send({}).expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com' })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({ password: 'password' })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  const body = {
    name: 'first_name',
    email: 'test@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };

  await request(app).post('/api/users/signup').send(body).expect(201);

  await request(app).post('/api/users/signup').send(body).expect(400);
});

it('sets a cookie after successful signup', async () => {
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

  expect(res.get('Set-Cookie')).toBeDefined();
});

it('sends the email', async () => {
  const body = {
    name: 'first_name',
    email: 'test@test.com',
    password: 'password',
    passwordConfirm: 'password',
  };

  await request(app).post('/api/users/signup').send(body).expect(201);

  expect(WelcomeEmail).toHaveBeenCalledTimes(1);
});
