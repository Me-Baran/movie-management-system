import { UserRoleType } from "../value-objects/user-role.vo";
import { DomainEvent } from "src/shared/domain/base-event";

export class UserLoggedInEvent extends DomainEvent {
    constructor(
        public readonly id: string,
        public readonly username: string,
    ) {
        super();
    }
}