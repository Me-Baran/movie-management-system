import { Module } from "@nestjs/common";
import { TicketCreatedHandler } from "./application/event-handlers/ticket-created.handler";
import { TicketUsedHandler } from "./application/event-handlers/ticket-used.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TicketTypeormEntity } from "./adapters/secondary/persistence/ticket.typeorm-entity";
import { MovieModule } from "../movie/movie.module";
import { AuthModule } from "../auth/auth.module";
import { TicketController } from "./adapters/primary/rest/ticket.controller";
import { TicketService } from "./application/services/ticket.service";
import { ITicketRepository } from "./application/ports/ticket-repository.interface";
import { TypeormTicketRepository } from "./adapters/secondary/persistence/typeorm-ticket.repositoty";
import { TicketMapper } from "./adapters/secondary/persistence/ticket.mapper";

const eventHandlers = [TicketCreatedHandler, TicketUsedHandler];

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([TicketTypeormEntity]),
        MovieModule,
        AuthModule
    ],
    controllers: [TicketController],
    providers: [
        // Application layer
        TicketService,

        // Domain layer - Ports implementations (port:adapter)
        {
            provide: ITicketRepository,
            useClass: TypeormTicketRepository
        },

        // Secondary adapters - Mappers
        TicketMapper,

        // Event handlers
        ...eventHandlers
    ],
    exports: [TicketService]
})
export class TicketModule {}