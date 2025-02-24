import { TicketMapper } from "src/modules/ticket/adapters/secondary/persistence/ticket.mapper";
import { Ticket } from "src/modules/ticket/domain/models/ticket.entity";
import { TicketTypeormEntity } from "src/modules/ticket/adapters/secondary/persistence/ticket.typeorm-entity";

describe('TicketMapper', () => {
    let mapper: TicketMapper;
    const mockId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserId = '123e4567-e89b-12d3-a456-426614174001';
    const mockMovieId = '123e4567-e89b-12d3-a456-426614174002';
    const mockSessionId = '123e4567-e89b-12d3-a456-426614174003';
    const mockPurchaseDate = new Date('2024-02-23');

    beforeEach(() => {
        mapper = new TicketMapper();
    });

    describe('toDomain', () => {
        it('should return null when entity is null', () => {
            expect(mapper.toDomain(null as unknown as TicketTypeormEntity)).toBe(null);
        });

        it('should map unused ticket entity to domain model', () => {
            const ticketEntity = new TicketTypeormEntity();
            ticketEntity.id = mockId;
            ticketEntity.userId = mockUserId;
            ticketEntity.movieId = mockMovieId;
            ticketEntity.sessionId = mockSessionId;
            ticketEntity.purchaseDate = mockPurchaseDate;
            ticketEntity.used = false;
            ticketEntity.usedDate = null;

            const ticket = mapper.toDomain(ticketEntity);

            expect(ticket).toBeDefined();
            expect(ticket?.getId()).toBe(mockId);
            expect(ticket?.getUserId()).toBe(mockUserId);
            expect(ticket?.getMovieId()).toBe(mockMovieId);
            expect(ticket?.getSessionId()).toBe(mockSessionId);
            expect(ticket?.getPurchaseDate()).toEqual(mockPurchaseDate);
            expect(ticket?.isUsed()).toBe(false);
            expect(ticket?.getUsedDate()).toBeUndefined();
        });

        it('should map used ticket entity to domain model', () => {
            const usedDate = new Date('2024-02-23');
            const ticketEntity = new TicketTypeormEntity();
            ticketEntity.id = mockId;
            ticketEntity.userId = mockUserId;
            ticketEntity.movieId = mockMovieId;
            ticketEntity.sessionId = mockSessionId;
            ticketEntity.purchaseDate = mockPurchaseDate;
            ticketEntity.used = true;
            ticketEntity.usedDate = usedDate;

            const ticket = mapper.toDomain(ticketEntity);

            expect(ticket).toBeDefined();
            expect(ticket?.getId()).toBe(mockId);
            expect(ticket?.getUserId()).toBe(mockUserId);
            expect(ticket?.getMovieId()).toBe(mockMovieId);
            expect(ticket?.getSessionId()).toBe(mockSessionId);
            expect(ticket?.getPurchaseDate()).toEqual(mockPurchaseDate);
            expect(ticket?.isUsed()).toBe(true);
            expect(ticket?.getUsedDate()).toEqual(usedDate);
        });
    });

    describe('toPersistance', () => {
        it('should map unused ticket domain model to entity', () => {
            const ticket = new Ticket(
                mockId,
                mockUserId,
                mockMovieId,
                mockSessionId,
                mockPurchaseDate,
                false
            );

            const entity = mapper.toPersistance(ticket);

            expect(entity).toBeDefined();
            expect(entity.id).toBe(mockId);
            expect(entity.userId).toBe(mockUserId);
            expect(entity.movieId).toBe(mockMovieId);
            expect(entity.sessionId).toBe(mockSessionId);
            expect(entity.purchaseDate).toEqual(mockPurchaseDate);
            expect(entity.used).toBe(false);
            expect(entity.usedDate).toBeNull();
        });

        it('should map used ticket domain model to entity', () => {
            const usedDate = new Date('2024-02-24');
            const ticket = new Ticket(
                mockId,
                mockUserId,
                mockMovieId,
                mockSessionId,
                mockPurchaseDate,
                true,
                usedDate
            );

            const entity = mapper.toPersistance(ticket);

            expect(entity).toBeDefined();
            expect(entity.id).toBe(mockId);
            expect(entity.userId).toBe(mockUserId);
            expect(entity.movieId).toBe(mockMovieId);
            expect(entity.sessionId).toBe(mockSessionId);
            expect(entity.purchaseDate).toEqual(mockPurchaseDate);
            expect(entity.used).toBe(true);
            expect(entity.usedDate).toEqual(usedDate);
        });
    });
})