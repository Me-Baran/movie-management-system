import { BaseEntity } from "src/shared/domain/base.entity";
import { Password } from "../value-objects/password.vo";
import { UserRole, UserRoleType } from "../value-objects/user-role.vo";
import { UserRegisteredEvent } from "../events/user-registered.event";
import { UserLoggedInEvent } from "../events/user-logged-in.event";

export class User extends BaseEntity {
    private _username: string;
    private _password: Password;
    private _age: number;
    private _role: UserRole;
    private _events: any[];

    // Private constructor to force use of factory method
    private constructor(
        id: string,
        username: string,
        password: Password,
        age: number,
        role: UserRole
    ) {
        super();
        this.id = id;
        this._username = username;
        this._password = password;
        this._age = age;
        this._role = role;
    }
    
    /**
     * Factory method for creating new user.
     * 
     * Automatically adds a UserRegisteredEvent to the events array.
     * 
     * @param id - The unique identifier for the user
     * @param username - The username of the user
     * @param password - The users password
     * @param age - The age of the user
     * @param role - The role of the user
     * 
     * @returns A new user instance
     */
    static create(
        id: string,
        username: string,
        password: Password,
        age: number,
        role: UserRoleType
    ) : User {
        const user = new User(
            id,
            username,
            password,
            age,
            UserRole.create(role)
        );

        user._events.push(new UserRegisteredEvent(id, username, role));
        return user;
    };

    get username(): string {
        return this._username;
    }

    get password(): Password {
        return this._password;
    }

    get age(): number {
        return this._age;
    }

    get role(): UserRole {
        return this._role;
    } 

    get events(): any[] {
        return this._events;
    }

    // Business logic methods
    
    /**
     * Sets the password for this user.
     * 
     * Automatically hashes the password before assigning it to the user.
     * 
     * @param password - The new password for the user
     * 
     * @returns A promise that resolves when the password has been set
     */
    async setPassword(password: Password): Promise<void> {
        const hashedPassword = await password.hashPassword();
        this._password = hashedPassword;
    }

    /**
     * Determines if the user is an adult.
     * 
     * @returns True if the user's age is 18 or older, false otherwise.
     */
    isAdult(): boolean {
        return this._age >= 18;
    }

    /**
     * Adds a UserLoggedInEvent to the event stream to indicate that this user
     * has logged in.
     * 
     * This method is idempotent and can be called multiple times without any
     * side effects.
     */
    loggedIn(): void {
        this._events.push(new UserLoggedInEvent(this.id, this.username));
    }

    /**
     * Clears the event stream for this user.
     * 
     * This method is useful in scenarios where the event stream for a user needs
     * to be reset or cleared.  This is typically the case when a user is
     * deleted or their data is being purged.
     */
    clearEvents(): void {
        this._events = [];
    }
    
}