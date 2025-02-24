import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { LoginFailedEvent } from "../../domain/events/login-failed-event";
import { Logger } from "@nestjs/common";

@EventsHandler(LoginFailedEvent)
export class LoginFailedHandler implements IEventHandler<LoginFailedEvent> {
    private readonly logger = new Logger(LoginFailedHandler.name);
    private readonly failedAttempts = new Map<string, number>();
    handle(event: LoginFailedEvent) {
        this.logger.warn(
            `Failed login attempt for user: ${event.username} from IP: ${event.ipAddress} at ${event.timestamp}`
        );

        // Track failed login attempts
        const key = `${event.username}:${event.ipAddress}`;
        const attempts = (this.failedAttempts.get(key) || 0) + 1;
        this.failedAttempts.set(key, attempts);

        // Implement security measures for multiple failed attempts
        if (attempts > 5) {
            this.logger.error(
                `Multiple failed login attempts detected for user: ${event.username} from IP: ${event.ipAddress}`
            );

            // We could:
            //  - Temporarily lock the account
            //  - Send notification to user
            //  - Alert securtity team
            //  - Apply rate limiting
            // Clean up old entries with a timeOut or in production with a cronjob
            setTimeout(() => {
                this.failedAttempts.delete(key);
            }, 30 * 60 * 1000);
        }
    }
}