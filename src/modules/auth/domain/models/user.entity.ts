import {AggregateRoot} from '@nestjs/cqrs';
import { Role } from './role.value-object';
import { Credentials } from './credentials.value-object';
import { UserCreatedEvent } from '../events/user-created.event';

export class User extends AggregateRoot {
    private readonly _id: string;
    private readonly _username: string;
    private readonly _credentials: Credentials;
    private readonly _age: number;
    private readonly _role: Role;
    private readonly _createdAt: Date;
    private readonly _watchHistory: string[] = []; //IDs of watched movies

    constructor(
        id: string,
        username: string,
        credentials: Credentials,
        age: number,
        role: Role,
        createdAt = new Date()
    ) {
        super();
        this._id = id;
        this._username = username;
        this._credentials = credentials;
        this._age = age;
        this._role = role;
        this._createdAt = createdAt;
        this.apply(new UserCreatedEvent(id, username, role.getValue(), age));
    }

    // Getters
    public getId(): string {
        return this._id;
    }

    public getUsername(): string {
        return this._username;
    }

    public getCredentials(): Credentials {
        return this._credentials;
    }

    public getAge(): number {
        return this._age;
      }
    
      public getRole(): Role {
        return this._role;
      }
    
      public getCreatedAt(): Date {
        return this._createdAt;
      }
    
      public getWatchHistory(): string[] {
        return [...this._watchHistory];
      }

      // Domain methods
      public isManager(): boolean {
        return this._role.equals(Role.MANAGER)
      }

      public isCustomer(): boolean {
        return this._role.equals(Role.CUSTOMER);
      }

      public canAccessByAge(ageRestriction: number): boolean {
        return this._age >= ageRestriction;
      }

      public verifyPassword(plainTexPassword: string): boolean {
        return this._credentials.comparePassword(plainTexPassword);
      }

      // Factory methods
      public static create(
        id: string,
        username: string,
        hashedPassword: string,
        age: number,
        role: Role
      ): User {
        const credentials = new Credentials(hashedPassword);
        return new User(id, username, credentials, age, role);
      }
}