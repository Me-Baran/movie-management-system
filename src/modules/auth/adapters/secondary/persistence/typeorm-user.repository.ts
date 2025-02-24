import { InjectRepository } from "@nestjs/typeorm";
import { IUserRepository } from "src/modules/auth/application/ports/user-repository.interface";
import { UserTypeormEntity } from "./user.typeorm-entity";
import { Repository } from "typeorm";
import { UserMapper } from "./user.mapper";
import { User } from "src/modules/auth/domain/models/user.entity";

// We implement IUserRepository interface(port) from user domain in persistence adapter, 
// meaning we put the methods of port into effect here
export class TypeormUserRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserTypeormEntity)
        private readonly userRepository: Repository<UserTypeormEntity>,
        private readonly userMapper: UserMapper
    ) {}

    async save(user: User): Promise<User> {
        const userEntity = this.userMapper.toPersistence(user);
        const savedEntity = await this.userRepository.save(userEntity);
        const domainUser = this.userMapper.toDomain(savedEntity);

        if (!domainUser) {
            throw new Error('Failed to map saved Entity back to domain model');
        }
       
        return domainUser;
    }

    async findById(id: string): Promise<User | null> {
        const userEntity = await this.userRepository.findOne({where: {id}});
        return userEntity ? this.userMapper.toDomain(userEntity) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const userEntity = await this.userRepository.findOne({where: {username}});
        return userEntity ? this.userMapper.toDomain(userEntity) : null;
    }

    async exists(username: string): Promise<boolean> {
        const count = await this.userRepository.count({where: {username}});
        return count > 0;
    }
}