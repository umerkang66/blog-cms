import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export class Password {
  // in minutes
  private static TOKEN_EXPIRES_AT = 15;

  public static async toHash(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
  }

  public static async compare(
    password: string,
    userPassword: string
  ): Promise<boolean> {
    const isEqual = await bcrypt.compare(password, userPassword);
    return isEqual;
  }

  public static createToken(): {
    token: string;
    tokenExpires: number;
  } {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = Date.now() + Password.TOKEN_EXPIRES_AT * 60 * 1000;

    return { token, tokenExpires };
  }

  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
