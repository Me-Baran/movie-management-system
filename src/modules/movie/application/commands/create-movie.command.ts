export class CreateMovieCommand {
    constructor(
        public readonly name: string,
        public readonly ageRestriction: number
    ) {}
}