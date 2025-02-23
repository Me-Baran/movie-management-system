import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TicketUsedEvent } from "../../domain/events/ticket-used-event";
import { Logger } from "@nestjs/common";

@EventsHandler(TicketUsedEvent)
export class TicketUsedHandler implements IEventHandler<TicketUsedEvent> {
    private readonly logger = new Logger(TicketUsedHandler.name);

    handle(event: TicketUsedEvent) {
        this.logger.log(
            `Ticket used - ID: ${event.ticketId}, User: ${event.userId}, Movie: ${event.movieId}`
        );

        // additional handling could be:
        // - generating viewing statistics
        // - triggering loyalty program points
        // - etc
    }
}