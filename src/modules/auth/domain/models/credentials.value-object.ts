export class Credentials {
    private readonly hashedPassword: string;

    constructor(hashedPassword: string) {
        this.hashedPassword = hashedPassword;
    }

    public getHashedPassword(): string {
        return this.hashedPassword;
    }

    public comparePassword(plainTextPassword: string): boolean {
        // Actual comparison will be done in the adapter layer
        // This is just a placeholder that will be used by the service
        return true;
    }
}