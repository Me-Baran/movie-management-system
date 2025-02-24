export class MovieCreatedEvent {
    constructor(
        public readonly movieId: string,
        public readonly name: string,
        public readonly ageRestriction: number
    ) {}
}