import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Userservice } from "src/modules/auth/application/services/user.service";
import { User } from "src/modules/auth/domain/models/user.entity";
import { MovieService } from "src/modules/movie/application/services/movie.service";
import { Movie } from "src/modules/movie/domain/models/movie.entity";
import { BuyTicketCommand } from "src/modules/ticket/application/commands/buy-ticket.command";
import { UseTicketCommand } from "src/modules/ticket/application/commands/use-ticket.command";
import { ITicketRepository } from "src/modules/ticket/application/ports/ticket-repository.interface";
import { TicketService } from "src/modules/ticket/application/services/ticket.service"
import { Ticket } from "src/modules/ticket/domain/models/ticket.entity";

describe('TicketService', () => {
    let service: TicketService;
    let ticketRepository: jest.Mocked<ITicketRepository>;
    let movieService: jest.Mocked<MovieService>;
    let userService: jest.Mocked<Userservice>;

    const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
    const mockMovieId = '123e4567-e89b-12d3-a456-426614174001';
    const mockSessionId = '123e4567-e89b-12d3-a456-426614174002';
    const mockTicketId = '123e4567-e89b-12d3-a456-426614174003';

    beforeEach(async () => {
        const ticketRepositoryMock = {
            save: jest.fn(),
            findById: jest.fn(),
            findByUser: jest.fn(),
            findByUserAndSession: jest.fn(),
            findBySession: jest.fn(),
            findUsedTicketsByUser: jest.fn(),
            findUnusedTicketsByUser: jest.fn(),
            delete: jest.fn()
        }

        const movieServiceMock = {
            bookSessionSeats: jest.fn(),
            getMovieById: jest.fn()
        }

        const userServiceMock = {
            getUserById: jest.fn()
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketService,
                {
                    provide: ITicketRepository,
                    useValue: ticketRepositoryMock
                },
                {
                    provide: MovieService,
                    useValue: movieServiceMock
                },
                {
                    provide: Userservice,
                    useValue: userServiceMock
                }
            ]
        }).compile();

        service = module.get(TicketService);
        ticketRepository = module.get(ITicketRepository);
        movieService = module.get(MovieService);
        userService = module.get(Userservice);
    });

    describe('buyTicket', () => {
        const mockUser = {
            getAge: () => 25,
        } as User;

        const buyTicketCommand = new BuyTicketCommand(
            mockUserId,
            mockMovieId,
            mockSessionId
        );

        it('should successfully buy a ticket', async () => {
            userService.getUserById.mockResolvedValue(mockUser);
            ticketRepository.findByUserAndSession.mockResolvedValue(null);
            movieService.bookSessionSeats.mockResolvedValue(undefined);
            // we need it to return back whatever ticket we passed to save, so we mock implementation
            ticketRepository.save.mockImplementation((ticket) => Promise.resolve(ticket));

            const result = await service.buyTicket(buyTicketCommand);

            expect(result).toBeDefined();
            expect(result.getUserId()).toBe(mockUserId);
            expect(result.getMovieId()).toBe(mockMovieId);
            expect(result.getSessionId()).toBe(mockSessionId);
            expect(result.isUsed()).toBe(false);
        });

        it('should throw ConflictException when a user already has a ticket', async () => {
            userService.getUserById.mockResolvedValue(mockUser);
            ticketRepository.findByUserAndSession.mockResolvedValue(new Ticket(mockTicketId, mockUserId, mockMovieId, mockSessionId));
            movieService.bookSessionSeats.mockResolvedValue(undefined);

            await expect(service.buyTicket(buyTicketCommand))
                .rejects
                .toThrow(ConflictException);
        });
    });

    describe('useticket', () => {
        const useTicketCommand = new UseTicketCommand(mockUserId, mockTicketId);

        const mockTicket = new Ticket(
            mockTicketId,
            mockUserId,
            mockMovieId,
            mockSessionId
        );

        const mockMovie = {
            getSession: jest.fn().mockReturnValue({ id: mockSessionId })
        } as unknown as Movie;

        it('should successfully use a ticket', async () => {
            // Arrange
            ticketRepository.findById.mockResolvedValue(mockTicket);
            movieService.getMovieById.mockResolvedValue(mockMovie);
            ticketRepository.save.mockImplementation(ticket => Promise.resolve(ticket));
            expect(mockTicket.isUsed()).toBe(false);

            // Act
            const result = await service.useTicket(useTicketCommand);

            // Assert
            expect(result).toBeDefined();
            expect(result.getUsedDate()).toBeDefined();
            expect(result.isUsed()).toBe(true);
        });

        it('should throw NotFoundException when ticket not found', async () => {
            ticketRepository.findById.mockResolvedValue(null);

            await expect(service.useTicket(useTicketCommand))
                .rejects
                .toThrow(NotFoundException);
        });

        it('should throw BadRequestException when ticket belongs to another user', async () => {
            const wrongTicket = new Ticket(
                mockTicketId,
                'wrong-user-id',
                mockMovieId,
                mockSessionId
            );
            ticketRepository.findById.mockResolvedValue(wrongTicket);

            await expect(service.useTicket(useTicketCommand))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should throw ConflictException when ticket already used', async () => {
            const usedTicket = new Ticket(
                mockTicketId,
                mockUserId,
                mockMovieId,
                mockSessionId
            );
            usedTicket.useTicket();
            ticketRepository.findById.mockResolvedValue(usedTicket);

            await expect(service.useTicket(useTicketCommand))
                .rejects
                .toThrow(ConflictException);
        });
    });

    describe('getUserTickets', () => {
        it('should return user tickets', async () => {
            const mockTickets = [
                new Ticket(mockTicketId, mockUserId, mockMovieId, mockSessionId)
            ];
            userService.getUserById.mockResolvedValue({} as User);
            ticketRepository.findByUser.mockResolvedValue(mockTickets);

            const result = await service.getUserTickets(mockUserId);

            expect(result).toEqual(mockTickets);
            expect(ticketRepository.findByUser).toHaveBeenCalledWith(mockUserId);
        });

        it('should throw NotFoundException when user not found', async () => {
            userService.getUserById.mockRejectedValue(new NotFoundException());

            await expect(service.getUserTickets(mockUserId))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('getTicketById', () => {
        it('should return ticket when found', async () => {
            const mockTicket = new Ticket(
                mockTicketId,
                mockUserId,
                mockMovieId,
                mockSessionId
            );
            ticketRepository.findById.mockResolvedValue(mockTicket);

            const result = await service.getTicketById(mockTicketId);

            expect(result).toEqual(mockTicket);
        });

        it('should throw NotFoundException when ticket not found', async () => {
            ticketRepository.findById.mockResolvedValue(null);

            await expect(service.getTicketById(mockTicketId))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('getSessionTicketCount', () => {
        it('should return correct ticket count', async () => {
            const mockTickets = [
                new Ticket(mockTicketId, mockUserId, mockMovieId, mockSessionId),
                new Ticket('ticket-123', 'user-123', 'movie-123', 'session-123')
            ];
            ticketRepository.findBySession.mockResolvedValue(mockTickets);

            const result = await service.getSessionTicketCount(mockSessionId);

            expect(result).toBe(2);
            expect(ticketRepository.findBySession).toHaveBeenCalledWith(mockSessionId);
        });
    });
})