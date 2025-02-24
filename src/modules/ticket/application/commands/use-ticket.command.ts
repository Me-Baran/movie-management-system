export class UseTicketCommand {
    constructor(
        public readonly userId: string,
        public readonly ticketId: string
    ) {}
}