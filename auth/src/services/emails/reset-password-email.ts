import path from 'path';
import { BaseEmail } from '@blog-cms/common';

export class ResetPasswordEmail extends BaseEmail {
  protected template: string = 'password-reset';
  protected subject: string =
    'Your password reset token (value for only 15 minutes)';
  protected templatePath: string = path.join(
    process.cwd(),
    'src/email-templates',
    `${this.template}.pug`
  );
}
