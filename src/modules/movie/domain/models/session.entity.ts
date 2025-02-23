import { TimeSlot } from "./time-slot.value-object";

export class Session {
    private readonly _id: string;
    private readonly _movieId: string;
    private readonly _date: Date;
    private readonly _timeSlot: TimeSlot;
    private readonly _roomNumber: number;
    private readonly _availableSeats: number;
    private _bookedSeats: number;

    constructor(
        id: string,
        movieId: string,
        date: Date,
        timeSlot: TimeSlot,
        roomNumber: number,
        availableSeats: number,
        bookedSeats: number = 0
    ) {
        this._id = id;
        this._movieId = movieId
        this._date = date;
        this._timeSlot = timeSlot;
        this._roomNumber = roomNumber;
        this._availableSeats = availableSeats;
        this._bookedSeats = bookedSeats;
    }

    // Getters
    public getId(): string {
        return this._id;
    }

    public getMovieId(): string {
        return this._movieId;
    }

    public getDate(): Date {
        return this._date;
    }

    public getTimeSlot(): TimeSlot {
        return this._timeSlot;
    }

    public getRoomNumber(): number {
        return this._roomNumber;
    }

    public getAvailableSeats(): number {
        return this._availableSeats;
    }

    public getBookedSeats(): number {
        return this._bookedSeats;
    }

    public getRemainingSeats(): number {
        return this._availableSeats - this._bookedSeats;
    }

    // Domain methods
    public hasAvailableSeats(numberOfSeats: number) {
        return this.getRemainingSeats() >= numberOfSeats;
    }

    public bookSeats(numberOfSeats: number = 1): void {
        if (!this.hasAvailableSeats(numberOfSeats)) {
            throw new Error('Not enough available seats');
        }
        this._bookedSeats += numberOfSeats;
    }

    public isOnSameDay(other: Session): boolean {
        return this._date.toDateString() == other.getDate().toDateString();
    }

    public hasConflictWith(other: Session): boolean {
        return this.isOnSameDay(other) &&
                this._roomNumber === other.getRoomNumber() &&
                this._timeSlot.equals(other.getTimeSlot());
    }
}