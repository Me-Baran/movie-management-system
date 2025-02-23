import { Movie } from 'src/modules/movie/domain/models/movie.entity';
import { Session } from 'src/modules/movie/domain/models/session.entity';
import { AgeRestriction } from 'src/modules/movie/domain/models/age-restriction.value-object';
import { TimeSlot } from 'src/modules/movie/domain/models/time-slot.value-object';
import { v4 as uuidv4 } from 'uuid';
import { MovieCreatedEvent } from 'src/modules/movie/domain/events/movie-created.event';
import { SessionCreatedEvent } from 'src/modules/movie/domain/events/session-created.event';

describe('Movie', () => {
    let movie: Movie;
    const movieId = uuidv4();

    beforeEach(() => {
        movie = Movie.create(
            movieId,
            'Test Movie',
            12
        );
    });

    describe('create', () => {

        it('should create a movie with correct properties', () => {
            expect(movie.getId()).toBe(movieId);
            expect(movie.getName()).toBe('Test Movie');
            expect(movie.getAgeRestriction().getValue()).toBe(12);
            expect(movie.getSessions()).toHaveLength(0);
        });

        it('should apply MovieCreatedEvent', () => {
            const events = movie.getEvents();
            const event = events[0] as MovieCreatedEvent;
            expect(event.constructor.name).toBe('MovieCreatedEvent');
            expect(event.movieId).toBe(movieId);
        });
    });

    describe('addSession', () => {
        it('should add a valid session', () => {
            const session = new Session(
                uuidv4(),
                movieId,
                new Date(),
                TimeSlot.fromString('10:00-12:00'),
                1,
                100
            );

            movie.addSession(session);
            expect(movie.getSessions()).toHaveLength(1);
            expect(movie.getSessions()[0]).toBe(session);
        });

        it('should throw error when adding session for different movie', () => {
            const session = new Session(
                uuidv4(),
                uuidv4(), // Different movie ID
                new Date(),
                TimeSlot.fromString('10:00-12:00'),
                1,
                100
            );

            expect(() => movie.addSession(session))
                .toThrow('Session does not belong to this movie');
        });

        it('should apply SessionCreatedEvent', () => {
            const session = new Session(
                uuidv4(),
                movieId,
                new Date(),
                TimeSlot.fromString('10:00-12:00'),
                1,
                100
            );

            movie.addSession(session);
            
            const events = movie.getEvents();
            const event = events[1] as SessionCreatedEvent;
            expect(event.constructor.name).toBe('SessionCreatedEvent');
        });
    });

    describe('updateName', () => {
        it('should update movie name', () => {
            movie.updateName('New Name');
            expect(movie.getName()).toBe('New Name');
        });
    });

    describe('updateAgeRestriction', () => {
        it('should update age restriction', () => {
            movie.updateAgeRestriction(new AgeRestriction(16));
            expect(movie.getAgeRestriction().getValue()).toBe(16);
        });
    });

    describe('isAllowedForAge', () => {
        it('should allow access for appropriate age', () => {
            expect(movie.isAllowedForAge(15)).toBe(true);
        });

        it('should not allow access for underage', () => {
            expect(movie.isAllowedForAge(10)).toBe(false);
        });
    });
});