import { ValueObject } from "src/shared/domain/base-value-object";
import * as bcrypt from 'bcrypt';

interface PasswordProps {
    value: string;
    hashed?: boolean;
}

export class Password extends ValueObject<PasswordProps> {
    static create(password: string, hashed = false) {
        return new Password({
            value: password,
            hashed: hashed
        });
    }

    /**
     * Retrieves the password value stored in this object.
     * 
     * @returns The password string.
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Determines if the password is already hashed.
     *
     * @returns True if the password is hashed, false otherwise.
     */
    get isHashed(): boolean {
        return this.props.hashed || false;
    }


    /**
     * Validates the password length to ensure it meets the required constraints.
     *
     * @throws {Error} If the password length is less than 8 or more than 100 characters.
     */
    validate() {
        if (this.props.value.length < 8 || this.props.value.length > 100) {
            throw new Error('Password must be between 8 and 100 characters');
        }
    }

    
    /**
     * Hashes the password with bcrypt if it is not already hashed.
     * 
     * This method is idempotent and does not modify the original Password object.
     * 
     * @returns A new Password object with the hashed password.
     */
    async hashPassword(): Promise<Password> {
        if (this.isHashed) {
            return this;
        }

        const hashedPassword = await bcrypt.hash(this.props.value, 10);
        return Password.create(hashedPassword, true);
    }

    
    /**
     * Compares a plain text password with the hashed password.
     *
     * @param plainTextPassword The plain text password to compare with.
     *
     * @returns A boolean indicating whether the password is valid.
     *
     * @throws {Error} If the password is not hashed.
     */
    async comparePassword(plainTextPassword: string): Promise<boolean> {
        if (!this.isHashed) {
            throw new Error('Password is not hashed');
        }

        return bcrypt.compare(plainTextPassword, this.props.value);
    }
}