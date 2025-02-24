import { TicketUsedEvent } from "src/modules/ticket/domain/events/ticket-used-event";
import { Ticket } from "src/modules/ticket/domain/models/ticket.entity";
import {v4 as uuidv4} from "uuid";

describe('Ticket Entity', () => {
    let ticket: Ticket;
    const ticketId = uuidv4();
    const userId = uuidv4();
    const movieId = uuidv4();
    const sessionId = uuidv4();

    beforeEach(() => {
        ticket = Ticket.create(ticketId, userId, movieId, sessionId);
    });

    describe('create', () => {
        it('should create a ticket with correct properties', () => {
            expect(ticket.getId()).toBe(ticketId);
            expect(ticket.getUserId()).toBe(userId);
            expect(ticket.getMovieId()).toBe(movieId);
            expect(ticket.getSessionId()).toBe(sessionId);
            expect(ticket.isUsed()).toBe(false);
            expect(ticket.getUsedDate()).toBeUndefined();
        });

        it('should apply TicketCreatedEvent', () => {
            const events = ticket.getUncommittedEvents();
            const event = events[0];
            expect(event.constructor.name).toBe('TicketCreatedEvent');
        })
    });

    describe('useTicket', () => {
        it('should mark ticket as used', () => {
            ticket.useTicket();

            expect(ticket.isUsed()).toBe(true);
            expect(ticket.getUsedDate()).toBeDefined();
        });

        it('should throw error when using already used ticket', () => {
            ticket.useTicket();

            expect(() => ticket.useTicket()).toThrow('Ticket has already been used');
        });

        it('should apply TicketUsedEvent', () => {
            ticket.useTicket();
            const events = ticket.getUncommittedEvents();
            const event = events[1];
            expect(event.constructor.name).toBe('TicketUsedEvent')
        })
    })
})