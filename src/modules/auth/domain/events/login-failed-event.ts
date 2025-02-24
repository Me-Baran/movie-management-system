export class LoginFailedEvent {
    constructor(
        public readonly username: string,
        public readonly ipAddress: string,
        public readonly timestamp: Date = new Date()
    ) {}
}