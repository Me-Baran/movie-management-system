export class UpdateMovieCommand {
    constructor(
        public readonly id: string,
        public readonly name?: string,
        public readonly ageRestriction?: number
    ) {}
}