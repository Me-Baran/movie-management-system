import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "src/modules/auth/adapters/primary/rest/decorators/current-user.decorator";
import { JwtAuthGuard } from "src/modules/auth/adapters/secondary/security/jwt-adapter/jwt-auth.guard";
import { TicketService } from "src/modules/ticket/application/services/ticket.service";
import { BuyTicketDto } from "../dtos/buy-ticket.dto";
import { BuyTicketCommand } from "src/modules/ticket/application/commands/buy-ticket.command";
import { session } from "passport";
import { UseTicketCommand } from "src/modules/ticket/application/commands/use-ticket.command";

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    @Post('buy')
    @ApiOperation({ summary: 'Buy a ticket for a movie session' })
    @ApiResponse({
        status: 201,
        description: 'Ticket purchased successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                movieId: { type: 'string' },
                sessionId: { type: 'string' },
                purchaseDate: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Movie or session not found' })
    async buyTicket(@CurrentUser() user: any, @Body() buyTicketDto: BuyTicketDto) {
        const command = new BuyTicketCommand(
            user.id,
            buyTicketDto.movieId,
            buyTicketDto.sessionId
        );

        const ticket = await this.ticketService.buyTicket(command);

        return {
            id: ticket.getId(),
            movieId: ticket.getMovieId(),
            sessionId: ticket.getSessionId(),
            purchaseDate: ticket.getPurchaseDate()
        }
    }

    @Post(':id/use')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Use a ticket to watch a movie' })
    @ApiResponse({
        status: 200,
        description: 'Ticket used successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                movieId: { type: 'string' },
                sessionId: { type: 'string' },
                usedDate: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Ticket not found' })
    @ApiResponse({ status: 409, description: 'Ticket already used' })
    async useTicket(@CurrentUser() user: any, @Param('id') ticketId: string) {
        const command = new UseTicketCommand(user.id, ticketId);
        const ticket = await this.ticketService.useTicket(command);

        return {
            id: ticket.getId(),
            movieId: ticket.getMovieId(),
            sessionId: ticket.getSessionId(),
            usedDate: ticket.getUsedDate()
        }
    }

    @Get('unused')
    @ApiOperation({ summary: 'Get user unused tickets' })
    @ApiResponse({
        status: 200,
        description: 'Unused tickets retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    movieId: { type: 'string' },
                    sessionId: { type: 'string' },
                    purchaseDate: { type: 'string', format: 'date-time' }
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserUnusedTickets(@CurrentUser() user: any) {
        const tickets = await this.ticketService.getUserUnusedTickets(user.id);

        return tickets.map(ticket => ({
            id: ticket.getId(),
            movieId: ticket.getMovieId(),
            sessionId: ticket.getSessionId(),
            purchaseDate: ticket.getPurchaseDate()
        }));
    }

    @Get('history')
    @ApiOperation({ summary: 'Get user watch history' })
    @ApiResponse({
        status: 200,
        description: 'Watch history retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    movieId: { type: 'string' },
                    sessionId: { type: 'string' },
                    purchaseDate: { type: 'string', format: 'date-time' },
                    usedDate: { type: 'string', format: 'date-time' }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getWatchHistory(@CurrentUser() user: any) {
        const tickets = await this.ticketService.getUserWatchHistory(user.id);

        return tickets.map(ticket => ({
            id: ticket.getId(),
            movieId: ticket.getMovieId(),
            sessionId: ticket.getSessionId(),
            purchaseDate: ticket.getPurchaseDate(),
            usedDate: ticket.getUsedDate()
        }));
    }
}