import { UserRoleType } from "../value-objects/user-role.vo";
import { DomainEvent } from "src/shared/domain/base-event";

export class UserRegisteredEvent extends DomainEvent {
    constructor(
        public readonly userId: string,
        public readonly username: string,
        public readonly role: UserRoleType
    ) {
        super();
    }
}