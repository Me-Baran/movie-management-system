import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { SessionTypeormEntity } from "./session.typeorm-entity";

@Entity('movie')
export class MovieTypeormEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    ageRestriction: number;

    @OneToMany(() => SessionTypeormEntity, session => session.movie, {
        cascade: ['insert', 'update', 'remove'],
        eager: true,
    })
    sessions: SessionTypeormEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}