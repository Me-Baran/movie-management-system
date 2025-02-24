export class BulkCreateMoviesCommand {
    constructor(
        public readonly movies: {
            name: string;
            ageRestriction: number;
        }[]
    ) {}
}