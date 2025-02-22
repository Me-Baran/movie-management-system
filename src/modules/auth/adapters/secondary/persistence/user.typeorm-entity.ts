import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class UserTypeormEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({unique:true})
    username: string;

    @Column()
    password: string;

    @Column()
    age: number;

    @Column()
    role: string;

    @Column('json', {nullable: true, default: '[]'})
    watchHistory: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}