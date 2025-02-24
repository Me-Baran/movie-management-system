import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MovieCreatedEvent } from "../../domain/events/movie-created.event";
import { Logger } from "@nestjs/common";

@EventsHandler(MovieCreatedEvent)
export class MovieCreatedHandler implements IEventHandler<MovieCreatedEvent> {
    private readonly logger = new Logger(MovieCreatedHandler.name);

    handle(event: MovieCreatedEvent) {
        this.logger.log(
            `Movie created: ${event.name} (ID: ${event.movieId}, Age Restriction: ${event.ageRestriction})`
        );
    }
}