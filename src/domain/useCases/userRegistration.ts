// @domain/useCases/userRegistration.ts

import type { User } from '@domain/models/user';
import type { UserRepository } from '@domain/repositories/userRepository';
import type { EmailValidator } from '@domain/validation/emailValidator';

export class MissingParam extends Error {
  constructor(param: string) {
    super(`Missing parameter: ${param}`);
  }
};

export class PasswordDoesNotMatchError extends Error {
  constructor() {
    super('Passwords does not match!');
  }
};

export class InvalidEmailError extends Error {
  constructor() {
    super('Invalid email!');
  }
};

export class UserAlreadyExistsError extends Error {
  constructor() {
    super('There is already a user with this email!');
  }
};

type UserRegistrationInput = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export class UserRegistration {
  constructor(
    private userRepository: UserRepository,
    private emailValidator: EmailValidator,
  ) { }

  async execute(input: UserRegistrationInput): Promise<User> {
    const { email, password, confirmPassword } = input;

    if (!email) throw new MissingParam('email');
    if (!password) throw new MissingParam('password');
    if (!confirmPassword) throw new MissingParam('confirmPassword');

    if (password !== confirmPassword)
      throw new PasswordDoesNotMatchError();

    const isValid = this.emailValidator.validate(email);
    if (!isValid)
      throw new InvalidEmailError();

    const user = await this.userRepository.findByEmail(email);
    if (user)
      throw new UserAlreadyExistsError();

    const newUser = await this.userRepository.create({ email, password });
    return newUser;
  };
};
