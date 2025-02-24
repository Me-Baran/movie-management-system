import { Ticket } from "../../domain/models/ticket.entity";

export abstract class ITicketRepository {
    abstract save(ticket: Ticket): Promise<Ticket>;
    abstract findById(id: string): Promise<Ticket | null>;
    abstract findByUserAndSession(userId: string, sessionId: string): Promise<Ticket | null>
    abstract findBySession(sessionId: string): Promise<Ticket[]>;
    abstract findByUser(userId: string): Promise<Ticket[]>;
    abstract findUsedTicketsByUser(userId: string): Promise<Ticket[]>
    abstract findUnusedTicketsByUser(userId: string): Promise<Ticket[]>
    abstract delete(ticketId: string): Promise<void>;
}