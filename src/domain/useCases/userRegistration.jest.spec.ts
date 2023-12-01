import { UserRegistration, MissingParam, PasswordDoesNotMatchError, InvalidEmailError, UserAlreadyExistsError } from '@domain/useCases/userRegistration'
import { UserRepository } from '@domain/repositories/userRepository';
import { EmailValidator } from '@domain/validation/emailValidator';
import { User } from '@domain/models/user';

const createdUser: User = {
    id: 'test_id',
    email: 'test_email',
    password: 'test_password',
}
const USER_REPOSITORY_CREATE_EXCEPTION = 'UserRepositorySpy.create Error!'
const USER_REPOSITORY_FIND_BY_EMAIL_EXCEPTION = 'UserRepositorySpy.findByEmail Error!'
const EMAIL_VALIDATOR_VALIDATE_EXCEPTION = 'EmailValidatorSpy.validate Error!'

const makeUserRepositorySpy = (): jest.Mocked<UserRepository> => ({
    create: jest.fn(_ => Promise.resolve(createdUser)),
    findByEmail: jest.fn()
})

const makeEmailValidatorSpy = (): jest.Mocked<EmailValidator> => ({
    validate: jest.fn(_ => true)
})


describe('UserRegistration (jest)', () => {
    it('should return a user on success', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        const emailValidator = makeEmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
            confirmPassword: createdUser.password,
        }
        const response = await sut.execute(input)

        // Assert
        const expectedUser = {...createdUser}
        expect(emailValidator.validate).toHaveBeenCalledWith(input.email)
        expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email)
        expect(userRepository.create).toHaveBeenCalledWith({email: input.email, password: input.password})
        expect(response).toEqual(expectedUser)
    });

    it('should throw an error if email is missing', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        const emailValidator = makeEmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            password: createdUser.password,
            confirmPassword: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new MissingParam('email'));
    });

    it('should throw an error if password is missing', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        const emailValidator = makeEmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            confirmPassword: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new MissingParam('password'));
    });

    it('should throw an error if confirmPassword is missing', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        const emailValidator = makeEmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new MissingParam('confirmPassword'));
    });

    it('should throw an error if password and confirmPassword are different', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        const emailValidator = makeEmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
            confirmPassword: 'test_confirm_password',
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new PasswordDoesNotMatchError());
    });

    it('should throw an error if EmailValidator.validate throws', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        const emailValidator = makeEmailValidatorSpy()
        emailValidator.validate.mockImplementationOnce(() => {throw new Error(EMAIL_VALIDATOR_VALIDATE_EXCEPTION)})
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
            confirmPassword: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new Error(EMAIL_VALIDATOR_VALIDATE_EXCEPTION));
    });
    
    it('should throw an error if the email is not valid', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        const emailValidator = makeEmailValidatorSpy()
        emailValidator.validate.mockReturnValueOnce(false)
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
            confirmPassword: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new InvalidEmailError());
    });

    it('should throw an error if UserRepository.findByEmail throws', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        userRepository.findByEmail.mockImplementationOnce(() => Promise.reject(new Error(USER_REPOSITORY_FIND_BY_EMAIL_EXCEPTION)))
        const emailValidator = makeEmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
            confirmPassword: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new Error(USER_REPOSITORY_FIND_BY_EMAIL_EXCEPTION));
    });

    it('should throw an error if a user with this email already exists', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        userRepository.findByEmail.mockResolvedValueOnce({...createdUser})
        const emailValidator = makeEmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
            confirmPassword: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new UserAlreadyExistsError());
    });

    it('should throw an error if UserRepository.create throws', async () => {
        // Arrange
        const userRepository = makeUserRepositorySpy()
        userRepository.create.mockImplementationOnce(() => Promise.reject(new Error(USER_REPOSITORY_CREATE_EXCEPTION)))
        const emailValidator = makeEmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
            confirmPassword: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new Error(USER_REPOSITORY_CREATE_EXCEPTION));
    });
});
