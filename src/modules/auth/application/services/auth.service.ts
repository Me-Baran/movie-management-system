import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { IUserRepository } from "../ports/user-repository.interface";
import { IPasswordService } from "../ports/password.service.interface";
import { ITokenService } from "../ports/token-service.interface";
import { EventBus } from "@nestjs/cqrs";
import { LoginCommand } from "../commands/login.command";
import { LoginFailedEvent } from "../../domain/events/login-failed-event";
import { RegisterUserCommand } from "../commands/register-user.command";
import { Role } from "../../domain/models/role.value-object";
import { User } from "../../domain/models/user.entity";
import {v4 as uuidv4} from "uuid";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordService: IPasswordService,
        private readonly tokenService: ITokenService,
        private readonly eventBus: EventBus
    ) {}

    async login(command: LoginCommand): Promise<{accessToken: string, user: any}> {
        const {username, password, ipAddress} = command;

        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            this.eventBus.publish(new LoginFailedEvent(username, ipAddress));
            throw new UnauthorizedException('Invalid Credentials');
        }

        const passwordMatch = await this.passwordService.compare(
            password,
            user.getCredentials().getHashedPassword()
        );

        if (!passwordMatch) {
            this.eventBus.publish(new LoginFailedEvent(username, ipAddress));
            throw new UnauthorizedException('Invalid Credentials');
        }

        const payload = {
            // subject(sub), JWT best practice
            sub: user.getId(),
            username: user.getUsername(),
            role: user.getRole().getValue()
        };

        const accessToken = await this.tokenService.generateToken(payload);

        return {
            accessToken,
            user: {
                id: user.getId(),
                username: user.getUsername(),
                role: user.getRole().getValue(),
                age: user.getAge()
            }
        };
    }

    async register(command: RegisterUserCommand): Promise<User> {
        const {username, password, age, role} = command;

        if (age < 0) {
            throw new BadRequestException('Age must be a positive number')
        }

        const exists = await this.userRepository.exists(username);
        if (exists) {
            throw new ConflictException('Username already exists');
        }

        try {
            const hashedPassword = await this.passwordService.hash(password);
            const userRole = Role.fromString(role);
            const user = User.create(
                uuidv4(),
                username,
                hashedPassword,
                age,
                userRole
            );

            return await this.userRepository.save(user);
        } catch (error) {
            if (error.message.includes('Invalid role')) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }
}