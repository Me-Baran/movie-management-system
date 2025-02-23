import { Movie } from "../../domain/models/movie.entity";

export abstract class IMovieRepository {
    abstract save(movie: Movie): Promise<Movie>;
    abstract findById(id: string): Promise<Movie | null>;
    abstract findAll(filter?: Record<string, any>): Promise<Movie[]>;
    abstract delete(id: string): Promise<void>;
    abstract existsById(id: string): Promise<boolean>;
    abstract checkRoomAvailability(date: Date, timeSlot: string, roomNumber: number): Promise<boolean>
}