import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { MovieTypeormEntity } from "./movie.typeorm-entity";

@Entity('sessions')
export class SessionTypeormEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column('uuid')
    movieId: string;

    @ManyToOne(() => MovieTypeormEntity, movie => movie.sessions, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({name: 'movieId'})
    movie: MovieTypeormEntity;

    @Column('date')
    date: Date;

    @Column()
    timeSlot: string;

    @Column()
    roomNumber: number;

    @Column()
    availableSeats: number

    @Column({default: 0})
    bookedSeats: number;
}