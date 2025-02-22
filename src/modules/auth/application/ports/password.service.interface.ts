export abstract class IPasswordService {
    abstract hash(password: string): Promise<string>;
    abstract compare(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}