import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MovieTypeormEntity } from "./adapters/secondary/persistence/movie.typeorm-entity";
import { SessionTypeormEntity } from "./adapters/secondary/persistence/session.typeorm-entity";
import { MovieController } from "./adapters/primary/rest/movie.controller";
import { MovieService } from "./application/services/movie.service";
import { IMovieRepository } from "./application/ports/movie-repository.interface";
import { TypeormMovieRepository } from "./adapters/secondary/persistence/typeorm-movie.repository";
import { MovieMapper } from "./adapters/secondary/persistence/movie.mapper";
import { MovieCreatedHandler } from "./application/event-handlers/movie-created.handler";
import { SessionCreatedHandler } from "./application/event-handlers/session-created.handler";

const eventHandlers = [MovieCreatedHandler, SessionCreatedHandler];

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([MovieTypeormEntity, SessionTypeormEntity])
    ],
    controllers: [MovieController],
    providers: [
        // Application layer
        MovieService,

        // Domain layer - Ports implementations(port:adapter)
        {
            provide: IMovieRepository,
            useClass: TypeormMovieRepository
        },

        // Secondary adapters
        MovieMapper,

        // Event handlers
        ...eventHandlers
    ],
    exports: [MovieService]
})
export class MovieModule {}