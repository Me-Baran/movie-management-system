export class BuyTicketCommand {
    constructor(
        public readonly userId: string,
        public readonly movieId: string,
        public readonly sessionId: string
    ) {}
}