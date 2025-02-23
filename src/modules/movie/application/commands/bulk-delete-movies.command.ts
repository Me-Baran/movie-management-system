export class BulkDeleteMoviesCommand {
    constructor(
        public readonly movieIds: string[]
    ) {}
}