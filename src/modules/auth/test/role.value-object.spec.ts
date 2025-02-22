import { Role } from "../domain/models/role.value-object";

describe('Role Value Object', () => {
    it('should have predefined roles', () => {
        expect(Role.MANAGER).toBeDefined();
        expect(Role.CUSTOMER).toBeDefined();

        expect(Role.MANAGER.getValue()).toBe('manager');
        expect(Role.CUSTOMER.getValue()).toBe('customer');
    });

    it('should create role object from string', () => {
        const managerRole = Role.fromString('manager');
        const customerRole = Role.fromString('customer');

        expect(managerRole.getValue()).toBe('manager');
        expect(customerRole.getValue()).toBe('customer');

        // whether we create fromString or we use static property MANAGER to create
        expect(managerRole.equals(Role.MANAGER)).toBe(true);
        expect(customerRole.equals(Role.CUSTOMER)).toBe(true);
    });

    it('should handle case insensivity', () => {
        const role1 = Role.fromString('MANAGER');
        const role2 = Role.fromString('Manager');

        expect(role1.equals(Role.MANAGER)).toBe(true);
        expect(role1.equals(role2)).toBe(true);
    });

    it('should throw error for invalid roles', () => {
        expect(() => Role.fromString('admin')).toThrow('Invalid role')
        expect(() => Role.fromString('')).toThrow('Invalid role')
    });
})
