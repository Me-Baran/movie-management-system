import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserCreatedEvent } from "../../domain/events/user-created.event";
import { Logger } from "@nestjs/common";

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
    private readonly logger = new Logger(UserCreatedEvent.name);

    handle(event: UserCreatedEvent) {
        this.logger.log(
            `User created: ${event.username} (ID: ${event.userId}, Role: ${event.role}, Age: ${event.age})`
        );

        // We later implement additional logic here:
        //  - Send welcome email
        //  - Log to Audit system
        //  - etc 
    }
}