// @infra/validator/emailValidator/regexEmailValidator.ts

import type { EmailValidator } from '@domain/validation/emailValidator';

export class RegexEmailValidator implements EmailValidator {
  regex: RegExp = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  validate(email: string): boolean {
    return this.regex.test(email);
  };
};
