import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/modules/auth/application/services/auth.service";
import { LoginDto } from "../dtos/login.dto";
import { Request } from "express";
import { LoginCommand } from "src/modules/auth/application/commands/login.command";
import { RegisterUserDto } from "../dtos/register-user.dto";
import { RegisterUserCommand } from "src/modules/auth/application/commands/register-user.command";
import { JwtAuthGuard } from "../../secondary/security/jwt-adapter/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // Login endpoint
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary: 'User login'})
    @ApiResponse({
        status: 200,
        description: 'Login successfull',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                username: {type: 'string'},
                role: {type: 'string'},
                age: {type: 'number'}
            }
        }
    })
    @ApiResponse({status: 401, description: 'Invalid credentials'})
    async login(@Body() loginDto: LoginDto, @Req() request: Request) {
        const ipAddress = request.ip || 'unknown';
        const command = new LoginCommand(
            loginDto.username,
            loginDto.password,
            ipAddress,
        );
        return this.authService.login(command);
    }


    // Register endpoint
    @Post('register')
    @ApiOperation({summary: 'Register new user'})
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        schema: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                role: {type: 'string'},
                age: {type: 'number'},
                createdAt: {type: 'string', format: 'date-time'}
            }
        }
    })
    @ApiResponse({status: 400, description: 'Bad request'})
    @ApiResponse({status: 409, description: 'Username already exists'})
    async register(@Body() registerDto: RegisterUserDto) {
        const command = new RegisterUserCommand(
            registerDto.username,
            registerDto.password,
            registerDto.age,
            registerDto.role
        );

        const user = await this.authService.register(command);

        return {
            id: user.getId(),
            username: user.getUsername(),
            role: user.getRole().getValue(),
            age: user.getAge(),
            createdAt: user.getCreatedAt()
        }
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({summary: 'Get current user profile'})
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                role: {type: 'string'},
                age: {type: 'string'}
            }
        }
    })
    @ApiResponse({status: 401, description: 'Unauthorized'})
    async getProfile(@CurrentUser() user: any) {
        return {
            id: user.id,
            username: user.username,
            role: user.role,
            age: user.age
        };
    }
}