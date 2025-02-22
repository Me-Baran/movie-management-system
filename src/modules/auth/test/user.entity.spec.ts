import { User } from "../domain/models/user.entity";
import { Role } from "../domain/models/role.value-object";
import { Credentials } from "../domain/models/credentials.value-object";

describe('User Entity', () => {
    let user: User;
    let credentials: Credentials;

    beforeEach(() => {
        credentials = new Credentials('hashed_password');
        user = new User('user-123', 'testuser', credentials, 25, Role.CUSTOMER);
    });

    it('should create a valid user', () => {
        expect(user).toBeDefined();
        expect(user.getId()).toBe('user-123');
        expect(user.getUsername()).toBe('testuser');
        expect(user.getCredentials()).toBe(credentials);
        expect(user.getAge()).toBe(25);
        expect(user.getRole().getValue()).toBe('customer');
        expect(user.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should create a suer using factory method', () => {
        const factoryUser = User.create(
            'user-456',
            'factoryuser',
            'hashed_password',
            30,
            Role.MANAGER,
        );

        expect(factoryUser).toBeDefined();
        expect(factoryUser.getId()).toBe('user-456');
        expect(factoryUser.getUsername()).toBe('factoryuser');
        expect(factoryUser.getAge()).toBe(30);
        expect(factoryUser.getRole().getValue()).toBe('manager');
    });

    it('should correctly identify user role', () => {
        const customerUser = new User('c-123', 'customer', credentials, 20, Role.CUSTOMER);
        const managerUser = new User('m-123', 'manager', credentials, 30, Role.MANAGER);

        expect(customerUser.isCustomer()).toBe(true);
        expect(customerUser.isManager()).toBe(false);

        expect(managerUser.isCustomer()).toBe(false);
        expect(managerUser.isManager()).toBe(true);
    });

    it('should check age restrictions correctly', () => {
        const minorUser = new User('minor-123', 'minor', credentials, 15, Role.CUSTOMER);
        const adultUser = new User('adult-123', 'adult', credentials, 21, Role.CUSTOMER);

        expect(minorUser.canAccessByAge(18)).toBe(false);
        expect(adultUser.canAccessByAge(18)).toBe(true);

        expect(minorUser.canAccessByAge(13)).toBe(true);
        expect(adultUser.canAccessByAge(21)).toBe(true);
    });
})