import { Injectable } from "@nestjs/common";
import { TicketTypeormEntity } from "./ticket.typeorm-entity";
import { Ticket } from "src/modules/ticket/domain/models/ticket.entity";

@Injectable()
export class TicketMapper {
    toDomain(ticketEntity: TicketTypeormEntity): Ticket | null {
        if (!ticketEntity) return null;

        return new Ticket(
            ticketEntity.id,
            ticketEntity.userId,
            ticketEntity.movieId,
            ticketEntity.sessionId,
            ticketEntity.purchaseDate,
            ticketEntity.used,
            ticketEntity.usedDate || undefined
        )
    }

    toPersistance(ticket: Ticket): TicketTypeormEntity {
        const ticketEntity = new TicketTypeormEntity();
        ticketEntity.id = ticket.getId(),
        ticketEntity.userId = ticket.getUserId();
        ticketEntity.movieId = ticket.getMovieId();
        ticketEntity.sessionId = ticket.getSessionId();
        ticketEntity.purchaseDate = ticket.getPurchaseDate();
        ticketEntity.used = ticket.isUsed();
        ticketEntity.usedDate = ticket.getUsedDate() || null;
        
        return ticketEntity;
    }
}