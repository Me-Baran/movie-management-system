import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity('tickets')
export class TicketTypeormEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column('uuid')
    userId: string;

    @Column('uuid')
    movieId: string;

    @Column('uuid')
    sessionId: string;

    @CreateDateColumn()
    purchaseDate: Date;

    @Column('boolean', {default: false})
    used: boolean;

    @Column({
        type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', 
        nullable: true
    })
    usedDate: Date | null;
}