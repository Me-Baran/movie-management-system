import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ITicketRepository } from "../ports/ticket-repository.interface";
import { MovieService } from "src/modules/movie/application/services/movie.service";
import { Userservice } from "src/modules/auth/application/services/user.service";
import { Ticket } from "../../domain/models/ticket.entity";
import {v4 as uuidv4} from "uuid";
import { BuyTicketCommand } from "../commands/buy-ticket.command";
import { UseTicketCommand } from "../commands/use-ticket.command";

@Injectable()
export class TicketService {
    constructor(
        private readonly ticketRepository: ITicketRepository,
        private readonly movieService: MovieService,
        private readonly userService: Userservice
    ) {}

    /**
     * Buys a ticket for a user for a given session.
     * 
     * This method first verifies that the user exists and has a valid age for the movie.
     * It then uses the MovieService to book a seat for the user in the session.
     * If the user already has a ticket for this session, a ConflictException is thrown.
     * 
     * @param command BuyTicketCommand object containing the user id, movie id and session id.
     * @returns A Ticket object representing the newly created ticket.
     * @throws NotFoundException if the user does not exist.
     * @throws BadRequestException if the user is not old enough for the movie.
     * @throws ConflictException if the user already has a ticket for this session.
     */
    async buyTicket(command: BuyTicketCommand): Promise<Ticket> {
        const {userId, movieId, sessionId} = command;

        // Verify user exists and get details
        const user = await this.userService.getUserById(userId);

        // Let MovieService handle all movie/session related validations
        await this.movieService.bookSessionSeats(movieId, sessionId, 1, user.getAge());

        // Check if user has already a ticket for this session
        const existingTickets = await this.ticketRepository.findByUserAndSession(userId, sessionId);
        if (existingTickets) {
            throw new ConflictException('User already has a ticket for this session');
        }

        // Create new ticket
        const ticket = new Ticket(
            uuidv4(),
            userId,
            movieId,
            sessionId
        );

        return this.ticketRepository.save(ticket);
    }

    /**
     * Uses a ticket for a user.
     * 
     * This method first verifies that the user owns the ticket and that the ticket has not been used before.
     * It then verifies that the movie and session still exist.
     * If the verifications pass, the ticket is marked as used and saved back to ticket repository
     * 
     * @param command UseTicketCommand object containing the user id and ticket id.
     * @returns The updated Ticket object.
     * @throws NotFoundException if the ticket does not exist.
     * @throws BadRequestException if the ticket belongs to another user or the movie session no longer exists.
     * @throws ConflictException if the ticket has already been used.
     */
    async useTicket(command: UseTicketCommand): Promise<Ticket> {
        const {userId, ticketId} = command;

        // Find the ticket
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new NotFoundException(`Ticket ${ticketId} not found`);
        }

        // Verify ticket ownership
        if (ticket.getUserId() !== userId) {
            throw new BadRequestException('Ticket belongs to another user');
        }

        // Ckeck if ticket has already been used
        if (ticket.isUsed()) {
            throw new ConflictException('Ticket has already been used');
        }

        // Verify the movie and session still eexists
        const movie = await this.movieService.getMovieById(ticket.getMovieId());
        const session = movie.getSession(ticket.getSessionId());
        if (!session) {
            throw new BadRequestException('Movie session no longer exists');
        }

        // Mark ticket as used
        ticket.useTicket();
        return await this.ticketRepository.save(ticket);
    }

   
    /**
     * Retrieves all tickets associated with a specific user.
     * 
     * This method first verifies that the user exists.
     * If the user is found, it returns a list of tickets belonging to the user.
     * 
     * @param userId The ID of the user whose tickets are being retrieved.
     * @returns A promise that resolves to an array of Ticket objects for the user.
     * @throws NotFoundException if the user does not exist.
     */
    async getUserTickets(userId: string): Promise<Ticket[]> {
        // Verify user exists
        await this.userService.getUserById(userId);
        return await this.ticketRepository.findByUser(userId);
    }

    /**
     * Retrieves all unused tickets associated with a specific user.
     * 
     * This method first verifies that the user exists.
     * If the user is found, it returns a list of tickets belonging to the user that have not been used.
     * 
     * @param userId The ID of the user whose tickets are being retrieved.
     * @returns A promise that resolves to an array of Ticket objects for the user that have not been used.
     * @throws NotFoundException if the user does not exist.
     */
    async getUserUnusedTickets(userId: string): Promise<Ticket[]> {
        // Verify user exists
        await this.userService.getUserById(userId);
        return await this.ticketRepository.findUnusedTicketsByUser(userId);
    }

    /**
     * Retrieves all tickets associated with a specific user that have been used(Watch history).
     * 
     * This method first verifies that the user exists.
     * If the user is found, it returns a list of tickets belonging to the user which have been used.
     * 
     * @param userId The ID of the user whose tickets are being retrieved.
     * @returns A promise that resolves to an array of Ticket objects that have been used by the user.
     * @throws NotFoundException if the user does not exist.
     */
    async getUserWatchHistory(userId: string): Promise<Ticket[]> {
        // verify user exists
        await this.userService.getUserById(userId);
        const tickets = await this.ticketRepository.findUsedTicketsByUser(userId);
        return tickets;
    }

    /**
     * Retrieves a ticket by its ID.
     * 
     * This method simply retrieves a ticket by its ID.
     * 
     * @param ticketId The ID of the ticket being retrieved.
     * @returns A promise that resolves to the Ticket object or rejects with a NotFoundException if the ticket does not exist.
     */
    async getTicketById(ticketId: string): Promise<Ticket> {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new NotFoundException(`Ticket ${ticketId} not found`);
        }
        return ticket;
    }

    /**
     * This method queries the ticket repository for all tickets related to the given session ID
     * and returns the count of those tickets.
     * 
     * @param sessionId The ID of the session whose ticket count is being retrieved.
     * @returns A promise that resolves to the number of tickets for the session.
     */

    async getSessionTicketCount(sessionId: string): Promise<number> {
        const tickets = await this.ticketRepository.findBySession(sessionId);
        return tickets.length;
    }
}