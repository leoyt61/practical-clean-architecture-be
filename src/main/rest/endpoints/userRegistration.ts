// @main/endpoints/userRegistration.ts

import { Router, Request, Response } from 'express';

import {
  UserRegistration,
  PasswordDoesNotMatchError,
  InvalidEmailError,
  UserAlreadyExistsError,
} from '@domain/useCases/userRegistration';
import { RegexEmailValidator } from '@infra/validation/emailValidator/regexEmailValidator';
import { TypeormUserRepository } from '@infra/repositories/userRepository/typeorm';

const regexEmailValidator = new RegexEmailValidator();
const typeormUserRepository = new TypeormUserRepository();
const userRegistration = new UserRegistration(typeormUserRepository, regexEmailValidator);

const router = Router();

router.post('/user-registration', async (req: Request, res: Response) => {
  const { email, password, confirmPassword } = req.body;
  try {
    const user = await userRegistration.execute({ email, password, confirmPassword });
    res.status(201).send(`User created for email: ${user.email}`);
  } catch (err) {
    if (
      err instanceof PasswordDoesNotMatchError ||
      err instanceof InvalidEmailError ||
      err instanceof UserAlreadyExistsError
    ) {
      res.status(400).send(err.message);
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

export default router;