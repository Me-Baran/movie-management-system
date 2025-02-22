export class RegisterUserCommand {
    constructor(
        public readonly username: string,
        public readonly password: string,
        public readonly age: number,
        public readonly role: string
    ) {}
}