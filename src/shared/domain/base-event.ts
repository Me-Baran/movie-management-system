/**
 * Base class for all domain events
 * 
 * Domain events represent something significant that occured in the domain.
 * They are immutable and contain metadata about when they occured.
 * 
 * @abstract
 */
export abstract class DomainEvent {
    /**
     * Timestamp when this event occured
     * @readonly
     */
    readonly occuredAt: Date;

    /**
     * Creates a new domain event on instance creation and
     * Automatically sets the occurence timestamp to the current time
     */
    constructor() {
        this.occuredAt = new Date();
    }
}