import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { IMovieRepository } from "../ports/movie-repository.interface";
import { CreateMovieCommand } from "../commands/create-movie.command";
import { Movie } from "../../domain/models/movie.entity";
import { v4 as uuidv4 } from "uuid";
import { UpdateMovieCommand } from "../commands/update-movie.command";
import { AgeRestriction } from "../../domain/models/age-restriction.value-object";
import { DeleteMovieCommand } from "../commands/delete-movie.command";
import { AddSessionCommand } from "../commands/add-session.command";
import { Session } from "../../domain/models/session.entity";
import { TimeSlot } from "../../domain/models/time-slot.value-object";

@Injectable()
export class MovieService {
    constructor(
        private readonly movieRepository: IMovieRepository
    ) { }

    async createMovie(command: CreateMovieCommand): Promise<Movie> {
        const { name, ageRestriction } = command;

        const movie = Movie.create(
            uuidv4(),
            name,
            ageRestriction
        );

        return await this.movieRepository.save(movie);
    }

    async updateMovie(command: UpdateMovieCommand): Promise<Movie> {
        const { id, name, ageRestriction } = command;

        const movie = await this.movieRepository.findById(id);
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${id} not found`);
        }

        if (name) {
            movie.updateName(name);
        }

        // ageRestriction might be 0(!ageRestriction becomes true if 0)
        if (ageRestriction !== undefined) {
            movie.updateAgeRestriction(new AgeRestriction(ageRestriction));
        }

        return await this.movieRepository.save(movie);
    }

    async deleteMovie(command: DeleteMovieCommand): Promise<void> {
        const { id } = command;

        const exists = await this.movieRepository.existsById(id);
        if (!exists) {
            throw new NotFoundException(`Movie with ID ${id} not found`);
        }

        await this.movieRepository.delete(id);
    }

    async addSession(command: AddSessionCommand): Promise<Movie> {
        const {movieId, date, timeSlot, roomNumber, availableSeats} = command;

        const movie = await this.movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${movieId} not found`);
        }

        // check room availability at specified timeSlot/date
        const isRoomAvailable = await this.movieRepository.checkRoomAvailability(
            date,
            timeSlot,
            roomNumber
        );

        if (!isRoomAvailable) {
            throw new ConflictException(
                `Room ${roomNumber} is already booked at ${timeSlot} on ${date.toDateString()}`
            );
        }

        const session = new Session(
            uuidv4(),
            movieId,
            date,
            TimeSlot.fromString(timeSlot),
            roomNumber,
            availableSeats
        );

        try {
            movie.addSession(session);
            return await this.movieRepository.save(movie);
        } catch(error) {
            throw new ConflictException(error.message);
        }
    }

    async getMovieById(movieId: string): Promise<Movie> {
        const movie = await this.movieRepository.findById(movieId);
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${movieId} not found`);
        }
        return movie;
    }

    async getAllMovies(filter?: Record<string, any>): Promise<Movie[]> {
        return await this.movieRepository.findAll(filter);
    }
}