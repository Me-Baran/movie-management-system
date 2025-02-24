export class UserCreatedEvent {
    constructor(
        public readonly userId: string,
        public readonly username: string,
        public readonly role: string,
        public readonly age: number
    ) {}
}