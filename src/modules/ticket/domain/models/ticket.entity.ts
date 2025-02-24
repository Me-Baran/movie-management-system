import { AggregateRoot, IEvent } from "@nestjs/cqrs";
import { TicketCreatedEvent } from "../events/ticket-created.event";
import { TicketUsedEvent } from "../events/ticket-used-event";


export class Ticket extends AggregateRoot {
    private readonly _id: string;
    private readonly _userId: string;
    private readonly _movieId: string;
    private readonly _sessionId: string;
    private readonly _purchaseDate: Date;
    private _used: boolean;
    private _usedDate?: Date;

    constructor(
        id: string,
        userId: string,
        movieId: string,
        sessionId: string,
        purchaseDate = new Date(),
        used = false,
        usedDate?: Date
    ) {
        super();
        this._id = id;
        this._userId = userId;
        this._movieId = movieId;
        this._sessionId = sessionId;
        this._purchaseDate = purchaseDate;
        this._used = used;
        this._usedDate = usedDate;

        this.apply(new TicketCreatedEvent(id, userId, movieId, sessionId));
    }

    // Getters
    public getId(): string {
        return this._id;
    }

    public getUserId(): string {
        return this._userId;
    }

    public getMovieId(): string {
        return this._movieId;
    }

    public getSessionId(): string {
        return this._sessionId;
    }

    public getPurchaseDate(): Date {
        return this._purchaseDate;
    }

    public isUsed(): boolean {
        return this._used;
    }

    public getUsedDate(): Date | undefined {
        return this._usedDate;
    }

    // Domain methods
    public useTicket(): void {
        if (this._used) {
            throw new Error('Ticket has already been used');
        }

        this._used = true;
        this._usedDate = new Date();
        this.apply(new TicketUsedEvent(this._id, this._userId, this._movieId));
    }

    // Factory method
    public static create(
        id: string,
        userId: string,
        movieId: string,
        sessionId: string
    ): Ticket {
        return new Ticket(id, userId, movieId, sessionId);
    }
}