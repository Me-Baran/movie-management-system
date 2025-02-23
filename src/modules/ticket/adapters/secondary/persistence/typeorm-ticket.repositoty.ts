import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ITicketRepository } from "src/modules/ticket/application/ports/ticket-repository.interface";
import { TicketTypeormEntity } from "./ticket.typeorm-entity";
import { Repository } from "typeorm";
import { TicketMapper } from "./ticket.mapper";
import { Ticket } from "src/modules/ticket/domain/models/ticket.entity";

@Injectable()
export class TypeormTicketRepository implements ITicketRepository {
    constructor(
        @InjectRepository(TicketTypeormEntity)
        private readonly ticketRepository: Repository<TicketTypeormEntity>,
        private readonly ticketMapper: TicketMapper
    ) {}

    async save(ticket: Ticket): Promise<Ticket> {
        const ticketEntity = this.ticketMapper.toPersistance(ticket);
        const savedEntity = await this.ticketRepository.save(ticketEntity);
        const domainTicket = this.ticketMapper.toDomain(savedEntity);

        if (!domainTicket) {
            throw new Error('Failed to map saved Entity back to domain model');
        }

        return domainTicket;
    }

    async findById(id: string): Promise<Ticket | null> {
        const ticketEntity = await this.ticketRepository.findOne({where: {id}});

        return ticketEntity ? this.ticketMapper.toDomain(ticketEntity) : null;
    }

    async findByUserAndSession(userId: string, sessionId: string): Promise<Ticket | null> {
        const ticketEntity = await this.ticketRepository.findOne({
            where: {
                userId,
                sessionId
            }
        });

        return ticketEntity ? this.ticketMapper.toDomain(ticketEntity) : null;
    }

    async findBySession(sessionId: string): Promise<Ticket[]> {
        const ticketEntities = await this.ticketRepository.find({
            where: {
                sessionId
            },
            order: {
                purchaseDate: 'ASC'
            }
        });

        return this.mapEntitiesToDomain(ticketEntities);
    }

    async findByUser(userId: string): Promise<Ticket[]> {
        const ticketEntities = await this.ticketRepository.find({
            where: {userId},
            order: {
                purchaseDate: 'DESC'
            }
        });

        return this.mapEntitiesToDomain(ticketEntities);
    }

    async findUsedTicketsByUser(userId: string): Promise<Ticket[]> {
        const ticketEntities = await this.ticketRepository.find({
            where: {
                userId,
                used: true
            },
            order: {
                purchaseDate: 'DESC'
            }
        });

        return this.mapEntitiesToDomain(ticketEntities);
    }

    async findUnusedTicketsByUser(userId: string): Promise<Ticket[]> {
        const ticketEntities = await this.ticketRepository.find({
            where: { 
                userId,
                used: false 
            },
            order: {
                purchaseDate: 'DESC'
            }
        });

        return this.mapEntitiesToDomain(ticketEntities);
    }

    private mapEntitiesToDomain(entities: TicketTypeormEntity[]): Ticket[] {
        return entities
            .map(entity => this.ticketMapper.toDomain(entity))
            .filter(ticket => ticket !== null) as Ticket[]
    }

    async delete(ticketId: string): Promise<void> {
        await this.ticketRepository.delete(ticketId);
    }
}