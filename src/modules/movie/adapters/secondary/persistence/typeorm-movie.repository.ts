import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IMovieRepository } from "src/modules/movie/application/ports/movie-repository.interface";
import { MovieTypeormEntity } from "./movie.typeorm-entity";
import { Repository } from "typeorm";
import { SessionTypeormEntity } from "./session.typeorm-entity";
import { privateDecrypt } from "crypto";
import { MovieMapper } from "./movie.mapper";
import { Movie } from "src/modules/movie/domain/models/movie.entity";

@Injectable()
export class TypeormMovieRepository implements IMovieRepository {
    constructor(
        @InjectRepository(MovieTypeormEntity)
        private readonly movieRepository: Repository<MovieTypeormEntity>,
        @InjectRepository(SessionTypeormEntity)
        private readonly sessionRepository: Repository<SessionTypeormEntity>,
        private readonly movieMapper: MovieMapper
    ) { }

    async save(movie: Movie): Promise<Movie> {
        const movieEntity = this.movieMapper.toPersistence(movie);
        const savedMovie = await this.movieRepository.save(movieEntity);
        const domainMovie = this.movieMapper.toDomain(savedMovie);

        if (!domainMovie) {
            throw new Error('Failed to map saved Entity back to domain model');
        }

        return domainMovie;
    }

    async findById(id: string): Promise<Movie | null> {
        const movieEntity = await this.movieRepository.findOne({
            where: { id },
            relations: ['sessions']
        });

        return movieEntity ? this.movieMapper.toDomain(movieEntity) : null;
    }

    async findAll(filter?: Record<string, any>): Promise<Movie[]> {
        // build a query for adding filters
        const query = this.movieRepository.createQueryBuilder('movie')
            .leftJoinAndSelect('movie.sessions', 'session');

        if (filter) {
            if (filter.name) {
                query.andWhere('movie.name LIKE :name', { name: `%${filter.name}%` })
            }
            if (filter.minAge !== undefined) {
                query.andWhere('movie.ageRestriction >= :minAge', {minAge: filter.minAge})
            }
            if (filter.maxAge !== undefined) {
                query.andWhere('movie.ageRestriction <= :maxAge', {maxAge: filter.maxAge})
            }

            // Sorting
            if (filter.sortBy) {
                const order = filter.sortOrder === 'DESC' ? 'DESC' : 'ASC';
                query.orderBy(`movie.${filter.sortBy}`, order);
            }
        }

        const movieEntities = await query.getMany();
        return movieEntities.map(entity => this.movieMapper.toDomain(entity))
            .filter(movie => movie !== null) as Movie[];
    }

    async delete(id: string): Promise<void> {
        await this.movieRepository.delete(id);
    }

    async existsById(id: string): Promise<boolean> {
        const count = await this.movieRepository.count({where: {id}});
        return count > 0;
    }

    async checkRoomAvailability(date: Date, timeSlot: string, roomNumber: number): Promise<boolean> {
        // convert to date without time
        const dateString = date.toISOString().split('T')[0];

        // check if there are any sessions in same room at same timemslot
        const conflictingSessions = await this.sessionRepository
            .createQueryBuilder('session')
            .where('DATE(session.date) = :date', {date: dateString})
            .andWhere('session.timeSlot = :timeSlot', {timeSlot: timeSlot})
            .andWhere('session.roomNumber = :roomNumber', {roomNumber})
            .getCount();

        return conflictingSessions === 0;
    }
}