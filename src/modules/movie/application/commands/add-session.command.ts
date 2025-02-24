export class AddSessionCommand {
    constructor(
        public readonly movieId: string,
        public readonly date: Date,
        public readonly timeSlot: string,
        public readonly roomNumber: number,
        public readonly availableSeats: number
    ) {}
}