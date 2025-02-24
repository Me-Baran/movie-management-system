import { IPasswordService } from "src/modules/auth/application/ports/password.service.interface";
import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BcryptPasswordService implements IPasswordService {
    private readonly saltRounds = 10;

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async compare(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainTextPassword, hashedPassword);
    }
}