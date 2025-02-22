export abstract class ITokenService {
    abstract generateToken(payload: Record<string, any>): Promise<string>;
    abstract validateToken(token: string): Promise<Record<string, any>>;
}