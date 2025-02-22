// NestJS module configuration

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserTypeormEntity } from "./adapters/secondary/persistence/user.typeorm-entity";
import { AuthController } from "./adapters/primary/rest/auth.controller";
import { UserController } from "./adapters/primary/rest/user.controller";
import { AuthService } from "./application/services/auth.service";
import { Userservice } from "./application/services/user.service";

import { IUserRepository } from "./application/ports/user-repository.interface";
import { IPasswordService } from "./application/ports/password.service.interface";
import { TypeormUserRepository } from "./adapters/secondary/persistence/typeorm-user.repository";
import { ITokenService } from "./application/ports/token-service.interface";
import { JwtTokenService } from "./adapters/secondary/security/jwt-adapter/jwt-token.service";
import { BcryptPasswordService } from "./adapters/secondary/security/password-adapter/bcrypt-password.service";
import { UserMapper } from "./adapters/secondary/persistence/user.mapper";
import { UserCreatedHandler } from "./application/event-handlers/user-created.handler";
import { LoginFailedHandler } from "./application/event-handlers/login-failed.handler";
import { JwtStrategy } from "./adapters/secondary/security/jwt-adapter/jwt.strategy";
import { RolesGuard } from "./adapters/secondary/security/utils/guards/roles.guard";

const handlers = [UserCreatedHandler, LoginFailedHandler];

@Module({
    imports: [
        CqrsModule,
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h')
                }
            })
        }),
        TypeOrmModule.forFeature([UserTypeormEntity])
    ],
    controllers: [AuthController, UserController],
    providers: [
        // Application layer
        AuthService,
        Userservice,

        // Domain Layer - Ports implementations(Port:Adapter)
        {
            provide: IUserRepository,
            useClass: TypeormUserRepository
        },
        {
            provide: ITokenService,
            useClass: JwtTokenService
        },
        {
            provide: IPasswordService,
            useClass: BcryptPasswordService
        },

        // Secondary Adapters
        UserMapper,
        JwtStrategy,

        // Event handlers
        ...handlers,

        // Guard
       //RolesGuard
    ],
    exports: [AuthService, Userservice]
})
export class AuthModule {}