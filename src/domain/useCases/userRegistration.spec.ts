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

class UserRepositorySpy implements UserRepository {
    public throwError: 'create' | 'findByEmail' | null = null
    public createCallsParams: Omit<User, 'id'>[] = []
    public findByEmailCallsParams: string[] = []
    public createReturn: User = {...createdUser}
    public findByEmailReturn: User | null = null

    create(user: Omit<User, 'id'>): Promise<User> {
        this.createCallsParams.push(user)
        if (this.throwError === 'create') throw new Error(USER_REPOSITORY_CREATE_EXCEPTION)
        return Promise.resolve(this.createReturn)
    }

    findByEmail(email: string): Promise<User | null> {
        this.findByEmailCallsParams.push(email)
        if (this.throwError === 'findByEmail') throw new Error(USER_REPOSITORY_FIND_BY_EMAIL_EXCEPTION)
        return Promise.resolve(this.findByEmailReturn)
    }
}

class EmailValidatorSpy implements EmailValidator {
    public validationBehavior: 'return_true' | 'return_false' | 'throw' = 'return_true'
    public validateCallsParams: string[] = []

    validate(email: string): boolean {
        this.validateCallsParams.push(email)
        if (this.validationBehavior === 'return_true') return true;
        else if (this.validationBehavior === 'return_false') return false;
        throw new Error(EMAIL_VALIDATOR_VALIDATE_EXCEPTION)
    }
}


describe('UserRegistration', () => {
    it('should return a user on success', async () => {
        // Arrange
        const userRepository = new UserRepositorySpy()
        const emailValidator = new EmailValidatorSpy()
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
        expect(emailValidator.validateCallsParams[0]).toEqual(input.email)
        expect(userRepository.findByEmailCallsParams[0]).toEqual(input.email)
        expect(userRepository.createCallsParams[0]).toEqual({email: input.email, password: input.password})
        expect(response).toEqual(expectedUser)
    });

    it('should throw an error if email is missing', async () => {
        // Arrange
        const userRepository = new UserRepositorySpy()
        const emailValidator = new EmailValidatorSpy()
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
        const userRepository = new UserRepositorySpy()
        const emailValidator = new EmailValidatorSpy()
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
        const userRepository = new UserRepositorySpy()
        const emailValidator = new EmailValidatorSpy()
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
        const userRepository = new UserRepositorySpy()
        const emailValidator = new EmailValidatorSpy()
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
        const userRepository = new UserRepositorySpy()
        const emailValidator = new EmailValidatorSpy()
        emailValidator.validationBehavior = 'throw'
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
        const userRepository = new UserRepositorySpy()
        const emailValidator = new EmailValidatorSpy()
        emailValidator.validationBehavior = 'return_false'
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
        const userRepository = new UserRepositorySpy()
        userRepository.throwError = 'findByEmail'
        const emailValidator = new EmailValidatorSpy()
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
        const email = 'test_email'
        const userRepository = new UserRepositorySpy()
        userRepository.findByEmailReturn = {...createdUser}
        const emailValidator = new EmailValidatorSpy()
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
        const userRepository = new UserRepositorySpy()
        userRepository.throwError = 'create'
        const emailValidator = new EmailValidatorSpy()
        const sut = new UserRegistration(userRepository, emailValidator)
        
        // Act
        const input = {
            email: createdUser.email,
            password: createdUser.password,
            confirmPassword: createdUser.password,
        }
        const responsePromise = sut.execute(input)

        // Assert
        await expect(responsePromise).rejects.toThrow(new Error (USER_REPOSITORY_CREATE_EXCEPTION));
    });
});
