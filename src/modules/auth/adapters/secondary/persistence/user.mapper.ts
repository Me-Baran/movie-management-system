import { Injectable } from "@nestjs/common";
import { UserTypeormEntity } from "./user.typeorm-entity";
import { User } from "src/modules/auth/domain/models/user.entity";
import { Role } from "src/modules/auth/domain/models/role.value-object";
import { Credentials } from "src/modules/auth/domain/models/credentials.value-object";

// bidirectional Data Mapper between domain object layer and data source layer
@Injectable()
export class UserMapper {
    /**
     * Maps a UserTypeormEntity to a User domain object
     * @param userEntity The UserTypeormEntity to map
     * @returns The mapped User domain object, or null if userEntity is null
     */
    toDomain(userEntity: UserTypeormEntity): User | null {
        if (!userEntity) return null;

        const role = Role.fromString(userEntity.role);
        const credentials = new Credentials(userEntity.password);

        const user = new User(
            userEntity.id,
            userEntity.username,
            credentials,
            userEntity.age,
            role,
            userEntity.createdAt
        );

        return user;
    }

    /**
     * Maps a User domain object to a UserTypeormEntity
     * @param user The User domain object to map
     * @returns The mapped UserTypeormEntity
     */
    toPersistence(user: User): UserTypeormEntity {
        // Create instance first, lets proper initialization of any internal state before assigning properties
        const userEntity = new UserTypeormEntity();
        userEntity.id = user.getId();
        userEntity.username = user.getUsername();
        userEntity.password = user.getCredentials().getHashedPassword();
        userEntity.age = user.getAge();
        userEntity.role = user.getRole().getValue();
        userEntity.watchHistory = user.getWatchHistory();

        return userEntity;
    }
}