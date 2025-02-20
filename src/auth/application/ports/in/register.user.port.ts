import { UserRoleType } from "src/auth/domain/value-objects/user-role.vo";

/**
 * Command for registering a new user.
 * 
 * @interface RegisterUserCommand
 * @property {string} username - The username of the user.
 * @property {string} password - The password for the user.
 * @property {number} age - The age of the user.
 * @property {UserRoleType} role - The role of the user.
 */
export interface RegisterUserCommand {
    username: string;
    password: string;
    age: number;
    role: UserRoleType;
}

/**
 * Interface for the Register User Port.
 * 
 * Defines a contract for registering a new user with the specified command.
 * 
 * @interface RegisterUserPort
 * @method registerUser
 * @param {RegisterUserCommand} command - The command containing user registration details.
 * @returns {Promise<string>} A promise that resolves with the new user's ID upon successful registration.
 */
export interface RegisterUserPort {
    registerUser(command: RegisterUserCommand): Promise<string>;
}