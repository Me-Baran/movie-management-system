/**
 * Base class for all value objects in the domain model
 * 
 * Value objects are immutable objects defined by their properties rather than their identity.
 * They encapsulate concepts that are important to the domain but do not have identity.
 * 
 * @abstract
 * @template T - The structure of the properties that define this value object
 */
export abstract class ValueObject<T> {
    /**
     * The properties that define this value object
     * @protected
     * @readonly
     */
    protected readonly props: T;

    /**
     * 
     * @param props Creates a new value object instance
     * 
     * @param props - The properties that define this value object
     * @throws {Error} When validation fails
     */
    constructor(props: T) {
        this.props = props;
        this.validate();
    }

    /**
     * Validates that the properties of this value object meet domain rules
     * 
     * Must be implemented by all extending classes to enforce domain-specific validation rules.
     * Called automatically during object construction
     * 
     * @protected
     * @abstract
     * @throws {Error} When validation rules are violated
     */
    protected abstract validate(): void;

    /**
     * 
     * @param vo Compares this value object with another for equality
     * 
     * Two value objects are considered equal when their properties have the same values.
     * This is in contrast with entities which are equal when they have the same identity.
     * 
     * @param vo - The value object to compare with
     * @returns True if all properties are equal, false otherwise
     */
    public equals(vo?: ValueObject<T>): boolean {
        if (vo === null || vo === undefined) {
            return false;
        }
        return JSON.stringify(this.props) === JSON.stringify(vo.props)
    }
}