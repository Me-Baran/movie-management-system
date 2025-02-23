import { MovieMapper } from 'src/modules/movie/adapters/secondary/persistence/movie.mapper';
import { MovieTypeormEntity } from 'src/modules/movie/adapters/secondary/persistence/movie.typeorm-entity';
import { Movie } from 'src/modules/movie/domain/models/movie.entity';
import { Session } from 'src/modules/movie/domain/models/session.entity';
import { v4 as uuidv4 } from 'uuid';
import { TimeSlot } from 'src/modules/movie/domain/models/time-slot.value-object';

describe('MovieMapper', () => {
    let mapper: MovieMapper;

    beforeEach(() => {
        mapper = new MovieMapper();
    });

    describe('toDomain', () => {
        it('should map TypeORM entity to domain model', () => {
            const movieEntity = new MovieTypeormEntity();
            movieEntity.id = uuidv4();
            movieEntity.name = 'Test Movie';
            movieEntity.ageRestriction = 12;
            movieEntity.sessions = [];
            movieEntity.createdAt = new Date();

            const domainMovie = mapper.toDomain(movieEntity);

            expect(domainMovie).toBeDefined();
            expect(domainMovie?.getId()).toBe(movieEntity.id);
            expect(domainMovie?.getName()).toBe(movieEntity.name);
            expect(domainMovie?.getAgeRestriction().getValue()).toBe(movieEntity.ageRestriction);
        });

        it('should return null for null input', () => {
            expect(mapper.toDomain(null as unknown as MovieTypeormEntity)).toBeNull();
        });
    });

    describe('toPersistence', () => {
        it('should map domain model to TypeORM entity', () => {
            const movieId = uuidv4();
            const domainMovie = Movie.create(movieId, 'Test Movie', 12);
            
            const persistenceMovie = mapper.toPersistence(domainMovie);

            expect(persistenceMovie).toBeDefined();
            expect(persistenceMovie.id).toBe(movieId);
            expect(persistenceMovie.name).toBe('Test Movie');
            expect(persistenceMovie.ageRestriction).toBe(12);
            expect(persistenceMovie.sessions).toEqual([]);
        });

        it('should map domain model with sessions to TypeORM entity', () => {
            const movieId = uuidv4();
            const movie = Movie.create(movieId, 'Test Movie', 12);
            const session = new Session(
                uuidv4(),
                movieId,
                new Date(),
                TimeSlot.fromString('10:00-12:00'),
                1,
                100
            );
            movie.addSession(session);

            const persistenceMovie = mapper.toPersistence(movie);

            expect(persistenceMovie.sessions).toHaveLength(1);
            expect(persistenceMovie.sessions[0].movieId).toBe(movieId);
            expect(persistenceMovie.sessions[0].roomNumber).toBe(1);
            expect(persistenceMovie.sessions[0].timeSlot).toBe('10:00-12:00');
        });
    });
});