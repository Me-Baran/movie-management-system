export class TicketUsedEvent {
    constructor(
        public readonly ticketId: string,
        public readonly userId: string,
        public readonly movieId: string
    ) {}
}