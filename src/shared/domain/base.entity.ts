/**
 * Base class for all Entities of all domains
 * 
 * Provides common properties that all Entities share
 * 
 * @abstract
 */
export abstract class BaseEntity {
    /**
     * Unique identifier of the entity
     */
    id: string;
    /**
     * Timestamp when the entity was created
     */
    createdAt: Date;
    /**
     * Timestamp when the entity was last updated
     */
    updatedAt: Date;
}