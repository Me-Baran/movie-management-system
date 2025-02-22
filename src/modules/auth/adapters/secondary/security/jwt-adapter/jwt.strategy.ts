import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "src/modules/auth/application/services/auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in the environment variables');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    // JWT automatic validation in request response cycle
    async validate(payload: any) {
        try {
            const user = await this.authService.validateUser(payload.sub);
            // The returned user object is attached to the request as req.user
            return {
                id: user.getId(),
                username: user.getUsername(),
                role: user.getRole().getValue(),
                age: user.getAge()
            }
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

/**
 * Why use passport, how it works:
 * Passport uses "strategies" for different authentication methods. 
 * The passport-jwt strategy handles JWT authentication specifically. JwtStrategy class extends the Passport JWT strategy 
   and configures how tokens should be extracted and validated.
 * Integration with Guards: NestJS connects Passport strategies to its guard system. When we use AuthGuard('jwt'), 
   it activates the Passport JWT strategy we've defined.
 * Request Transformation: Passport automatically attaches the authenticated user to the request object (req.user) 
   after successful authentication.
 */