import { ValueObject } from "src/shared/domain/base-value-object";

export enum UserRoleType {
    MANAGER = 'manager',
    CUSTOMER = 'customer'
}

interface UserRoleProps {
    value: UserRoleType;
}

export class UserRole extends ValueObject<UserRoleProps> {
    static create(role: UserRoleType): UserRole {
        return new UserRole({ value: role })
    }

    get value(): UserRoleType {
        return this.props.value;
    }

    validate(): void {
        if (!Object.values(UserRoleType).includes(this.props.value)) {
            throw new Error(`Invalid user role: ${this.props.value}`);
        }
    }

    isManager(): boolean {
        return this.props.value === UserRoleType.MANAGER;
    }

    isCustomer(): boolean {
        return this.props.value === UserRoleType.CUSTOMER;
    }

}

