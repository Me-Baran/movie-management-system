export class Role {
    public static readonly MANAGER = new Role('manager');
    public static readonly CUSTOMER = new Role('customer');

    private constructor(private readonly value: string) {
        if (!this.isValidRole(value)) {
            throw new Error(`Invalid role: ${value}`);
        }
    }

    private isValidRole(role: string): boolean {
        return ['manager', 'customer'].includes(role);
    }

    public getValue(): string {
        return this.value;
    }

    public equals(role: Role): boolean {
        return this.value === role.value;
    }

    public static fromString(value: string): Role {
        value = value.toLocaleLowerCase();
        if (value === 'manager') return Role.MANAGER;
        if (value === 'customer') return Role.CUSTOMER;
        throw new Error(`Invalid role: ${value}`);
    }
}