export class SessionCreatedEvent {
    constructor(
        public readonly sessionId: string,
        public readonly movieId: string,
        public readonly date: Date,
        public readonly timeSlot: string,
        public readonly roomNumber: number
    ) {}
}