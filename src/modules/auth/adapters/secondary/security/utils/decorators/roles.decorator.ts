import { SetMetadata } from "@nestjs/common";

/**
 * Key used to store and retrieve role metadata
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator that attaches role information to a class or method's metadata
 * 
 * @param roles - List of roles that are allowed to access the route
 * @returns A decorator function that applies the metadata
 * 
 * Usage examples:
 * - @Roles('admin')
 * - @Roles('manager', 'editor')
 * - @Roles() // No roles specified, empty array
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);