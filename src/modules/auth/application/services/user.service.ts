import { NotFoundException } from "@nestjs/common";
import { IUserRepository } from "../ports/user-repository.interface";
import { User } from "../../domain/models/user.entity";
import { use } from "passport";

export class Userservice {
    constructor(private readonly userRepository: IUserRepository) {}

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async getUserByUsername(username: string): Promise<User> {
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new NotFoundException(`User with username ${username} not found`);
        }
        return user;
    }
}