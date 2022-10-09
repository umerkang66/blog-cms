import request from 'supertest';
import { app } from '../../app';
import { SignupAdminEmail } from '../../services/emails/signup-admin-email';
import { User, UserDocument } from '../../models/user';
import { Password } from '../../services/password';

describe('Signup admin', () => {
  it('calls the signup admin email', async () => {
    const body = {
      name: 'first_name',
      email: 'test@test.com',
      password: 'password',
      passwordConfirm: 'password',
    };
    await request(app).post('/api/users/signup-admin').send(body).expect(200);
    expect(SignupAdminEmail).toHaveBeenCalledTimes(1);
  });

  it('set the props related to signup-admin/:token', async () => {
    const body = {
      name: 'first_name',
      email: 'test@test.com',
      password: 'password',
      passwordConfirm: 'password',
    };

    await request(app).post('/api/users/signup-admin').send(body).expect(200);

    const user = await User.findOne({ email: body.email });
    expect(user!.adminToken).toBeDefined();
    expect(user!.adminTokenExpires).toBeDefined();
  });
});

describe('Signup admin with token', () => {
  let user: UserDocument;
  let token: string;
  let tokenExpires: number;
  let hashedToken: string;

  beforeEach(async () => {
    user = User.build({
      name: 'name',
      email: 't@t.com',
      password: 'password',
    });

    const tokenInfo = Password.createToken();
    token = tokenInfo.token;
    tokenExpires = tokenInfo.tokenExpires;
    hashedToken = Password.hashToken(token);

    user.adminToken = hashedToken;
    user.adminTokenExpires = new Date(tokenExpires);
    await user.save();
  });

  it('sets the role to "admin" if correct token is provided', async () => {
    await request(app)
      .patch(`/api/users/signup-admin/${token}`)
      .send()
      .expect(200);

    const updatedUser = await User.findById(user.id);
    expect(updatedUser!.role).toBe('admin');
  });

  it('sets the cookie with updated user', async () => {
    const res = await request(app)
      .patch(`/api/users/signup-admin/${token}`)
      .send()
      .expect(200);

    expect(res.get('Set-Cookie')).toBeDefined();
  });

  it('removes the token, after updating', async () => {
    await request(app)
      .patch(`/api/users/signup-admin/${token}`)
      .send()
      .expect(200);

    const updatedUser = await User.findById(user.id);
    expect(updatedUser!.adminToken).toBeUndefined();
    expect(updatedUser!.adminTokenExpires).toBeUndefined();
  });

  it('responds with 400, if invalid token is provided', async () => {
    await request(app)
      .patch(`/api/users/signup-admin/${token + 'fake'}`)
      .send()
      .expect(400);
  });

  it('responds with 400, if token is expired', async () => {
    // token has expired 10 seconds ago
    user.adminTokenExpires = new Date(Date.now() - 10000);
    await user.save();

    await request(app)
      .patch(`/api/users/signup-admin/${token}`)
      .send()
      .expect(400);
  });
});
