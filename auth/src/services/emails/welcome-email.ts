import path from 'path';
import { BaseEmail } from '@blog-cms/common';

export class WelcomeEmail extends BaseEmail {
  protected subject: string = 'Welcome to Blog cms family';
  protected template: string = 'welcome';
  protected templatePath: string = path.join(
    process.cwd(),
    'src/email-templates',
    `${this.template}.pug`
  );
}
