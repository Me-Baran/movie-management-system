import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TicketCreatedEvent } from "../../domain/events/ticket-created.event";
import { Logger } from "@nestjs/common";

@EventsHandler(TicketCreatedEvent)
export class TicketCreatedHandler implements IEventHandler<TicketCreatedEvent> {
    private readonly logger = new Logger(TicketCreatedHandler.name);

    handle(event: TicketCreatedEvent) {
        this.logger.log(
            `Ticket created - ID: ${event.ticketId}, User: ${event.userId}, Movie: ${event.movieId}, Session: ${event.sessionId}`
        );

        // additional handling could be added
        // - send confirmation email
        // - notify staff
        // - etc
    }
}