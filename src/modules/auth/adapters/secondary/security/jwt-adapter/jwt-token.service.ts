import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ITokenService } from "src/modules/auth/application/ports/token-service.interface";

@Injectable()
export class JwtTokenService implements ITokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async generateToken(payload: Record<string, any>): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h')
        });
    }

    // Not needed here, validation is automatically done by jwt-strategy validate method during req-res cycle
    // But if other domain apps need to validate token but does not have access to auth infrastructure
    // Also this makes unit testing jwt verification possible without passport.js infrastructure
    async validateToken(token: string): Promise<Record<string, any>> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET')
            });
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}