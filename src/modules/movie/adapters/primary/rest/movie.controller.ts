import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/auth/adapters/secondary/security/jwt-adapter/jwt-auth.guard";
import { Roles } from "src/modules/auth/adapters/secondary/security/utils/decorators/roles.decorator";
import { RolesGuard } from "src/modules/auth/adapters/secondary/security/utils/guards/roles.guard";
import { MovieService } from "src/modules/movie/application/services/movie.service";
import { CreateMovieDto } from "../dtos/create-movie.dto";
import { CreateMovieCommand } from "src/modules/movie/application/commands/create-movie.command";
import { UpdateMovieDto } from "../dtos/update-movie.dto";
import { UpdateMovieCommand } from "src/modules/movie/application/commands/update-movie.command";
import { DeleteMovieCommand } from "src/modules/movie/application/commands/delete-movie.command";
import { CreateSessionDto } from "../dtos/create-session.dto";
import { AddSessionCommand } from "src/modules/movie/application/commands/add-session.command";
import { AgeRestriction } from "src/modules/movie/domain/models/age-restriction.value-object";
import { FilterMoviesDto } from "../dtos/filter-movies.dto";
import { CurrentUser } from "src/modules/auth/adapters/primary/rest/decorators/current-user.decorator";
import { BulkCreateMoviesDto } from "../dtos/bulk-create-movies.dto";
import { BulkCreateMoviesCommand } from "src/modules/movie/application/commands/bulk-create-movies.command";
import { BulkDeleteMoviesDto } from "../dtos/bulk-delete-movies.dto";
import { BulkDeleteMoviesCommand } from "src/modules/movie/application/commands/bulk-delete-movies.command";

@ApiTags('movies')
@Controller('movies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MovieController {
    constructor(private readonly movieService: MovieService) { }


    @Post('bulk')
    @Roles('manager')
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Create multiple movies (managers only)' })
    @ApiResponse({
        status: 201,
        description: 'Movies created successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    ageRestriction: { type: 'number' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires manager role' })
    async bulkCreateMovies(@Body() dto: BulkCreateMoviesDto) {
        const command = new BulkCreateMoviesCommand(dto.movies);
        const movies = await this.movieService.bulkCreateMovies(command);

        return movies.map(movie => ({
            id: movie.getId(),
            name: movie.getName(),
            ageRestriction: movie.getAgeRestriction().getValue(),
            createdAt: movie.getCreatedAt()
        }));
    }

    @Delete('bulk')
    @Roles('manager')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete multiple movies (managers only)' })
    @ApiResponse({ status: 204, description: 'Movies deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires manager role' })
    @ApiResponse({ status: 404, description: 'One or more movies not found' })
    async bulkDeleteMovies(@Body() dto: BulkDeleteMoviesDto): Promise<void> {
        const command = new BulkDeleteMoviesCommand(dto.movieIds);
        await this.movieService.bulkDeleteMovies(command);
    }

    @Post()
    @Roles('manager')
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Create a new movie (managers only)' })
    @ApiResponse({
        status: 201,
        description: 'Movie created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                ageRestriction: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires manager role' })
    async createMovie(@Body() createMovieDto: CreateMovieDto) {
        const command = new CreateMovieCommand(
            createMovieDto.name,
            createMovieDto.ageRestriction
        );

        const movie = await this.movieService.createMovie(command);

        return {
            id: movie.getId(),
            name: movie.getName(),
            ageRestriction: movie.getAgeRestriction().getValue(),
            createdAt: movie.getCreatedAt()
        }
    }

    @Put(':id')
    @Roles('manager')
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update a movie (managers only)' })
    @ApiResponse({
        status: 200,
        description: 'Movie updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                ageRestriction: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires manager role' })
    @ApiResponse({ status: 404, description: 'Movie not found' })
    async updateMovie(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
        const command = new UpdateMovieCommand(
            id,
            updateMovieDto.name,
            updateMovieDto.ageRestriction
        );

        const movie = await this.movieService.updateMovie(command);

        return {
            id: movie.getId(),
            name: movie.getName(),
            ageRestriction: movie.getAgeRestriction().getValue(),
            createdAt: movie.getCreatedAt()
        }
    }

    @Delete(':id')
    @Roles('manager')
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a movie (managers only)' })
    @ApiResponse({ status: 204, description: 'Movie deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires manager role' })
    @ApiResponse({ status: 404, description: 'Movie not found' })
    async deleteMovie(@Param('id') id: string) {
        const command = new DeleteMovieCommand(id);
        await this.movieService.deleteMovie(command);
    }

    @Post(':id/sessions')
    @Roles('manager')
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Add a session to a movie (managers only' })
    @ApiResponse({
        status: 201,
        description: 'Session added successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                ageRestriction: { type: 'number' },
                sessions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            date: { type: 'string', format: 'date' },
                            timeSlot: { type: 'string' },
                            roomNumber: { type: 'number' },
                            availableSeats: { type: 'number' },
                            bookedSeats: { type: 'number' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires manager role' })
    @ApiResponse({ status: 404, description: 'Movie not found' })
    @ApiResponse({ status: 409, description: 'Room already booked at this time' })
    async addSession(@Param('id') movieId: string, @Body() createSessionDto: CreateSessionDto) {
        const command = new AddSessionCommand(
            movieId,
            new Date(createSessionDto.date),
            createSessionDto.timeSlot,
            createSessionDto.roomNumber,
            createSessionDto.availableSeats
        );

        const movie = await this.movieService.addSession(command);

        return {
            id: movie.getId(),
            name: movie.getName(),
            ageRestriction: movie.getAgeRestriction().getValue(),
            sessions: movie.getSessions().map(session => ({
                id: session.getId(),
                date: session.getDate(),
                timeSlot: session.getTimeSlot().getValue(),
                roomNumber: session.getRoomNumber(),
                availableSeats: session.getAvailableSeats(),
                bookedSeats: session.getBookedSeats()
            }))
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all movies with optional filtering' })
    @ApiResponse({
        status: 200,
        description: 'List of movies',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    ageRestriction: { type: 'number' },
                    sessions: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                date: { type: 'string', format: 'date' },
                                timeSlot: { type: 'string' },
                                roomNumber: { type: 'number' },
                                availableSeats: { type: 'number' },
                                bookedSeats: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getAllMovies(@Query() filterDto: FilterMoviesDto, @CurrentUser() user: any) {
        // enforce max age filter by customer age (if user is customer)
        if (user.role === 'customer') {
            // if user has provided max age and chosen a max age flter more than his age, we select his age as max age filter
            if (filterDto.maxAge) {
                filterDto.maxAge = Math.min(filterDto.maxAge, user.age);
            } else {
                // we always filter based on age even though no max age filter is provided
                filterDto.maxAge = user.age
            }
        }

        const movies = await this.movieService.getAllMovies(filterDto);

        return movies.map(movie => ({
            id: movie.getId(),
            name: movie.getName(),
            ageRestriction: movie.getAgeRestriction().getValue(),
            sessions: movie.getSessions().map(session => ({
                id: session.getId(),
                date: session.getDate(),
                timeSlot: session.getTimeSlot().getValue(),
                roomNumber: session.getRoomNumber(),
                availableSeats: session.getAvailableSeats(),
                bookedSeats: session.getBookedSeats(),
                remainingSeats: session.getRemainingSeats()
            }))
        }));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get movie by ID' })
    @ApiResponse({
        status: 200,
        description: 'Movie details',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                ageRestriction: { type: 'number' },
                sessions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            date: { type: 'string', format: 'date' },
                            timeSlot: { type: 'string' },
                            roomNumber: { type: 'number' },
                            availableSeats: { type: 'number' },
                            bookedSeats: { type: 'number' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Movie not found' })
    async getMovieById(@Param('id') id: string, @CurrentUser() user: any) {
        const movie = await this.movieService.getMovieById(id);

        // For customer role, check age restriction
        if (user.role === 'customer' && !movie.isAllowedForAge(user.age)) {
            throw new HttpException('Age restriction prevents access to this movie', HttpStatus.FORBIDDEN);
        }

        return {
            id: movie.getId(),
            name: movie.getName(),
            ageRestriction: movie.getAgeRestriction().getValue(),
            sessions: movie.getSessions().map(session => ({
                id: session.getId(),
                date: session.getDate(),
                timeSlot: session.getTimeSlot().getValue(),
                roomNumber: session.getRoomNumber(),
                availableSeats: session.getAvailableSeats(),
                bookedSeats: session.getBookedSeats(),
                remainingSeats: session.getRemainingSeats()
            }))
        };
    }

}