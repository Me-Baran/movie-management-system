import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { SessionCreatedEvent } from "../../domain/events/session-created.event";
import { Logger } from "@nestjs/common";

@EventsHandler(SessionCreatedEvent)
export class SessionCreatedHandler implements IEventHandler<SessionCreatedEvent> {
    private readonly logger = new Logger(SessionCreatedHandler.name);

    handle(event: SessionCreatedEvent) {
        this.logger.log(
            `New session created for movie ID: ${event.movieId}, ` +
            `Room: ${event.roomNumber}, ` +
            `Date: ${event.date.toISOString().split('T')[0]}, ` +
            `Time: ${event.timeSlot}`
        )
    }
}