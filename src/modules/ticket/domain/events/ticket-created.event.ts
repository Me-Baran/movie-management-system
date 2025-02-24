export class TicketCreatedEvent {
    constructor(
        public readonly ticketId: string,
        public readonly userId: string,
        public readonly movieId: string,
        public readonly sessionId: string
    ) {}
}