import { MutationResolvers } from '@main/graphql/schemas/types';

import { UserRegistration } from '@domain/useCases/userRegistration';
import { RegexEmailValidator } from '@infra/validation/emailValidator/regexEmailValidator';
import { TypeormUserRepository } from '@infra/repositories/userRepository/typeorm';

const regexEmailValidator = new RegexEmailValidator();
const typeormUserRepository = new TypeormUserRepository();
const userRegistration = new UserRegistration(typeormUserRepository, regexEmailValidator);


const userRegistrationResolver: MutationResolvers['userRegistration'] = async (_, args) => {
  const { input } = args;
  const { email, password, confirmPassword } = input;

  const user = await userRegistration.execute({ email, password, confirmPassword });
  return `User created for email: ${user.email}`;
};

export default userRegistrationResolver;
