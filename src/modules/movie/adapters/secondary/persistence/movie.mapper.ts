import { Injectable } from "@nestjs/common";
import { MovieTypeormEntity } from "./movie.typeorm-entity";
import { Movie } from "src/modules/movie/domain/models/movie.entity";
import { AgeRestriction } from "src/modules/movie/domain/models/age-restriction.value-object";
import { Session } from "src/modules/movie/domain/models/session.entity";
import { SessionTypeormEntity } from "./session.typeorm-entity";
import { TimeSlot } from "src/modules/movie/domain/models/time-slot.value-object";

@Injectable()
export class MovieMapper {
    /**
     * Maps a MovieTypeormEntity to a Movie domain object
     */
    toDomain(movieEntity: MovieTypeormEntity): Movie | null {
        if (!movieEntity) return null;

        const ageRestriction = new AgeRestriction(movieEntity.ageRestriction);

        const sessions = movieEntity.sessions?.map(sessionEntity => 
            this.sessionToDomain(sessionEntity)
        ) || [];

        const movie = new Movie(
            movieEntity.id,
            movieEntity.name,
            ageRestriction,
            sessions,
            movieEntity.createdAt
        );

        return movie;
    }

    /**
     * Maps a SessionTypeormEntity to a Session domain object
     */
    private sessionToDomain(sessionEntity: SessionTypeormEntity): Session {
        const timeSlot = TimeSlot.fromString(sessionEntity.timeSlot);

        return new Session(
            sessionEntity.id,
            sessionEntity.movieId,
            sessionEntity.date,
            timeSlot,
            sessionEntity.roomNumber,
            sessionEntity.availableSeats,
            sessionEntity.bookedSeats
        );
    }

    /**
     * Maps a Movie domain object to a MovieTypeormEntity
     */
    toPersistence(movie: Movie): MovieTypeormEntity {
        const movieEntity = new MovieTypeormEntity();
        movieEntity.id = movie.getId();
        movieEntity.name = movie.getName();
        movieEntity.ageRestriction = movie.getAgeRestriction().getValue();

        // Map sessions of movie
        movieEntity.sessions = movie.getSessions().map(session => {
            const sessionEntity = new SessionTypeormEntity();
            sessionEntity.id = session.getId();
            sessionEntity.movieId = session.getMovieId();
            sessionEntity.date = session.getDate();
            sessionEntity.timeSlot = session.getTimeSlot().getValue();
            sessionEntity.roomNumber = session.getRoomNumber();
            sessionEntity.availableSeats = session.getAvailableSeats();
            sessionEntity.bookedSeats = session.getBookedSeats();
            return sessionEntity;
        });

        return movieEntity;
    }
}