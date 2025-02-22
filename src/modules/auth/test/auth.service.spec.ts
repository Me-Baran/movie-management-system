import { EventBus } from "@nestjs/cqrs";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../application/services/auth.service";
import { IUserRepository } from "../application/ports/user-repository.interface";
import { ITokenService } from "../application/ports/token-service.interface";
import { IPasswordService } from "../application/ports/password.service.interface";
import { User } from "../domain/models/user.entity";
import { LoginCommand } from "../application/commands/login.command";
import { RegisterUserCommand } from "../application/commands/register-user.command";
import { Test, TestingModule } from "@nestjs/testing";



describe('AuthService', () => {
    let service: AuthService;
    let userRepository: jest.Mocked<IUserRepository>; // <T> ensures type safety 
    let passwordService: jest.Mocked<IPasswordService>; // About jest mocking @see [1]
    let tokenService: jest.Mocked<ITokenService>;
    let eventBus: jest.Mocked<EventBus>;

    const mockUser = {
        getId: jest.fn().mockReturnValue('user-123'), // create a mock function, add a mock return value for all calls
        getUsername: jest.fn().mockReturnValue('testuser'),
        getCredentials: jest.fn().mockReturnValue({
            getHashedPassword: jest.fn().mockReturnValue('hashed_passowrd'),
        }),
        getAge: jest.fn().mockReturnValue(25),
        getRole: jest.fn().mockReturnValue({
            getValue: jest.fn().mockReturnValue('customer'),
            equals: jest.fn().mockReturnValue(true)
        }),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getWatchHistory: jest.fn().mockReturnValue([]),
        isManager: jest.fn().mockReturnValue(false),
        isCustomer: jest.fn().mockReturnValue(true),
        canAccessByAge: jest.fn(),
        verifyPassword: jest.fn(),
    };

    beforeEach(async () => {
        // create mocks through NestJS test module - @see [2]
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService, // NestJS injects these mocks into AuthService
                {
                    // Mocking dependency using jest's dependency injection, we replace entire implementation with a mock object
                    provide: IUserRepository,
                    useValue: { //define mock implementations in the useValue property
                        save: jest.fn(),
                        findById: jest.fn(),
                        findByUsername: jest.fn(),
                        exists: jest.fn()
                    }
                },
                {
                    provide: IPasswordService,
                    useValue: {
                        hash: jest.fn(),
                        compare: jest.fn()
                    }
                },
                {
                    provide: ITokenService,
                    useValue: {
                        generateToken: jest.fn(),
                        validateToken: jest.fn()
                    }
                },
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<AuthService>(AuthService);
        // retrieve the mocks using module.get()
        // we get references to those same mock objects so we can configure them and check their usage in each test
        // Without this approach, we'd have mock objects in our test, but they wouldn't be the same instances that were injected into AuthService, 
        // so our test manipulations wouldn't affect what the service actually receives.
        userRepository = module.get(IUserRepository) as jest.Mocked<IUserRepository>; //as jest.Mocked<IUserRepository> cast ensures TypeScript recognizes these objects as Jest mocks with all the mock methods and properties.
        passwordService = module.get(IPasswordService) as jest.Mocked<IPasswordService>;
        tokenService = module.get(ITokenService) as jest.Mocked<ITokenService>;
        eventBus = module.get(EventBus) as jest.Mocked<EventBus>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should return token and user data when login is successfull', async () => {
            // Arrange
            const loginCommand = new LoginCommand('testuser', 'password123', '127.0.0.1');
            userRepository.findByUsername.mockResolvedValue(mockUser as unknown as User); // return resolved promise for async methods @see [3]
            passwordService.compare.mockResolvedValue(true);
            tokenService.generateToken.mockResolvedValue('valid.jwt.token');

            // Act
            const result = await service.login(loginCommand);

            // Assert
            expect(userRepository.findByUsername).toHaveBeenCalledWith('testuser');
            expect(passwordService.compare).toHaveBeenCalled();
            expect(tokenService.generateToken).toHaveBeenCalled();
            expect(result).toEqual({
                accessToken: 'valid.jwt.token',
                user: {
                    id: 'user-123',
                    username: 'testuser',
                    role: 'customer',
                    age: 25
                }
            });
        });


        it('should throw UnauthorizedException when password is incorrect', async () => {
            // Arrange
            const loginCommand = new LoginCommand('nonexistent', 'password123', '127.0.0.1');
            userRepository.findByUsername.mockResolvedValue(null);

            // Act & Assert
            // create an expectation on a Promise
            // we expect the Promise to reject
            // we expect the error
            // we await and make sure test waits for this Promise rejection to be verified before proceeding
            await expect(service.login(loginCommand)).rejects.toThrow(UnauthorizedException);
            expect(eventBus.publish).toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            // Arrange
            const loginCommand = new LoginCommand('testuser', 'wrongpassword', '127.0.0.1');
            userRepository.findByUsername.mockResolvedValue(mockUser as unknown as User);
            passwordService.compare.mockResolvedValue(false);

            // Act & Assert
            await expect(service.login(loginCommand)).rejects.toThrow(UnauthorizedException);
            expect(eventBus.publish).toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should create and return a new user when registeration is successfull', async () => {
            // Arrange
            const registerCommand = new RegisterUserCommand('newuser', 'password123', 20, 'customer');
            userRepository.exists.mockResolvedValue(false);
            passwordService.hash.mockResolvedValue('hashed_password');
            userRepository.save.mockImplementation((user) => Promise.resolve(user)); // custom logic for complex behavior

            // Mock User.create static method
            // static methods are called on the method itself not on instances cerated from it(or mock object)
            jest.spyOn(User, 'create').mockReturnValue(mockUser as unknown as User); // track calls to original function(static method)

            // Act
            const result = await service.register(registerCommand);

            // Assert
            expect(userRepository.exists).toHaveBeenCalledWith('newuser');
            expect(passwordService.hash).toHaveBeenCalledWith('password123');
            expect(User.create).toHaveBeenCalled();
            expect(userRepository.save).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it('should throw ConflictException when username already exists', async () => {
            // Arrange
            const registerCommand = new RegisterUserCommand('existinguser', 'password123', 20, 'customer');
            userRepository.exists.mockResolvedValue(true);

            // Act & Assert
            await expect(service.register(registerCommand)).rejects.toThrow(ConflictException);
            expect(passwordService.hash).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when the role is invalid', async () => {
            // Arrange
            const registerCommand = new RegisterUserCommand('newuser', 'password123', 20, 'admin');
            userRepository.exists.mockResolvedValue(false);

            // Act & Assert
            await expect(service.register(registerCommand)).rejects.toThrow('Invalid role');
        });
    });

    describe('validateUser', () => {
        it('should return a user when token is valid', async () => {
            // Arrange
            userRepository.findById.mockResolvedValue(mockUser as unknown as User);

            // Act
            const result = await service.validateUser('user-123');

            // Assert
            expect(userRepository.findById).toHaveBeenCalledWith('user-123');
            expect(result).toBeDefined();
        });

        it('should throw UnauthorizedException when user does not exist', async () => {
            // Arrange
            userRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(service.validateUser('nonexistent')).rejects.toThrow(UnauthorizedException);
        })
    })
})


/** [1]
 * Jest Mocking:
 * Isolate components - test AuthService independent of actual repositories
 * Control test conditions - simulate success/failure scenarios
 * Verify interactions - confirm service calls dependencies correctly
 * Avoid external dependencies - No need for databases or real password hashing
 */

/** [2]
 * Identify dependencies - Look at the service's constructor to see what dependencies it needs
 * Create mock services - Create mock implementations of each dependency
 * Configure test module - Set up a TestingModule with your mocks using the useValue property
 * Let NestJS inject - Allow NestJS to inject these mocks into your service under test
 * Get references - Get references to the same mock instances for test manipulation
 */

/** [3]
 * mockUser as unknown as User:
 * It's essentially telling TypeScript: "Trust me, I know this mock can be used as a User."
 * casting: teeling compiler or interpreter to treat a variable as a different type than it was originally defined as.
 * double casting, Typescript prevents direct casting between unrelated types for safety
 * The as unknown as User approach works in two steps:
 * First cast to unknown (TypeScript's "top type" that can represent any value)
 * Then cast from unknown to User
 */