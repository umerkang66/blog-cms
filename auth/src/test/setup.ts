jest.setTimeout(100000);

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import { User } from '../models/user';
import { Password } from '../services/password';

jest.mock('../services/emails/reset-password-email');
jest.mock('../services/emails/welcome-email');
jest.mock('../services/emails/signup-admin-email');

// Before all our different test startups (different test files), we're going to create a new instance of this mongo memory server

declare global {
  var getAuthCookie: () => Promise<{
    name: string;
    email: string;
    password: string;
    cookie: string[];
    id: string;
  }>;

  var getAdminCookie: () => Promise<{
    name: string;
    email: string;
    password: string;
    cookie: string[];
    id: string;
  }>;
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';
  process.env.JWT_EXPIRES_IN = '30d';
  process.env.JWT_COOKIE_EXPIRES_IN = '30';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

global.getAuthCookie = async () => {
  const name = 'first_name';
  const email = 'test@test.com';
  const password = 'password';

  const res = await request(app)
    .post('/api/users/signup')
    .send({ name, email, password, passwordConfirm: password })
    .expect(201);

  const cookie = res.get('Set-Cookie');
  return { name, email, password, cookie, id: res.body.id };
};

global.getAdminCookie = async () => {
  const body = {
    name: 'name',
    email: 't@t.com',
    password: 'password',
  };
  const user = User.build(body);
  const { token, tokenExpires } = Password.createToken();
  user.adminToken = Password.hashToken(token);
  user.adminTokenExpires = new Date(tokenExpires);
  await user.save();

  const res = await request(app)
    .patch(`/api/users/signup-admin/${token}`)
    .send()
    .expect(200);

  const cookie = res.get('Set-Cookie');
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    cookie,
    id: user.id,
  };
};
