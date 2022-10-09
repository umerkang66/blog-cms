import path from 'path';
import { BaseEmail } from '@blog-cms/common';

export class SignupAdminEmail extends BaseEmail {
  protected template: string = 'signup-admin';
  protected subject: string = 'Token for Admin signup (valid only for 15 mins)';
  protected templatePath: string = path.join(
    process.cwd(),
    'src/email-templates',
    `${this.template}.pug`
  );
}
