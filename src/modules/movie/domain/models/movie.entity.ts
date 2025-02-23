import { AggregateRoot } from "@nestjs/cqrs";
import { AgeRestriction } from "./age-restriction.value-object";
import { Session } from "./session.entity";
import { MovieCreatedEvent } from "../events/movie-created.event";
import { SessionCreatedEvent } from "../events/session-created.event";

export class Movie extends AggregateRoot {
    private readonly _id: string;
    private _name: string;
    private _ageRestriction: AgeRestriction;
    private _sessions: Session[];
    private readonly _createdAt: Date;

    public getEvents() {
        return this.getUncommittedEvents(); // method inherited from AggregateRoot
    }

    constructor(
        id: string,
        name: string,
        ageRestriction: AgeRestriction,
        sessions: Session[] = [],
        createdAt = new Date()
    ) {
        super();
        this._id = id;
        this._name = name;
        this._ageRestriction = ageRestriction;
        this._sessions = sessions;
        this._createdAt = createdAt;

        this.apply(new MovieCreatedEvent(id, name, ageRestriction.getValue()));
    }

    // Getters
    public getId(): string {
        return this._id;
    }

    public getName(): string {
        return this._name;
    }

    public getAgeRestriction(): AgeRestriction {
        return this._ageRestriction;
    }

    public getSessions(): Session[] {
        return [...this._sessions]
    }

    public getCreatedAt(): Date {
        return this._createdAt;
    }

    // Domain methods
    public updateName(name: string): void {
        this._name = name;
    }

    public updateAgeRestriction(ageRestriction: AgeRestriction): void {
        this._ageRestriction = ageRestriction;
    }

    public addSession(session: Session): void {
        if (session.getMovieId() !== this._id) {
            throw new Error('Session does not belong to this movie')
        }

        this._sessions.push(session);
        this.apply(new SessionCreatedEvent(
            session.getId(),
            this._id,
            session.getDate(),
            session.getTimeSlot().getValue(),
            session.getRoomNumber()
        ))
    }

    public getSession(sessionId: string): Session | undefined {
        return this._sessions.find(session => session.getId() === sessionId)
    }

    public removeSession(sessionId: string): void {
        this._sessions = this._sessions.filter(session => session.getId() !== sessionId);
    }

    public isAllowedForAge(age: number): boolean {
        return this._ageRestriction.isAllowedForAge(age);
    }

    // Factory method
    public static create(id: string, name: string, ageRestriction: number): Movie {
        return new Movie(id, name, new AgeRestriction(ageRestriction));
    }
}