import { User } from "../../domain/models/user.entity";

export abstract class IUserRepository {
    abstract save(user: User): Promise<User>;
    abstract findById(id: string): Promise<User | null>;
    abstract findByUsername(username: string): Promise<User | null>;
    abstract exists(username: string): Promise<boolean>;
}