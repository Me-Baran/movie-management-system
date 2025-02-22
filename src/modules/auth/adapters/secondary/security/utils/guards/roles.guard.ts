import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

/**
 * Guard that checks if the current user has the required roles to access a route.
 * Uses metadata applied via @Roles() decorator at either method or class level.
 * 
 * @see [1] Reflection metadata system
 * @see [2] Execution context types
 */
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    /**
     * Determines if the current request has the required roles to access the route.
     * 
     * If no roles are specified, the guard will allow the request to proceed.
     * 
     * @param context The execution context that contains data about the current request.
     * @returns true if the request has the required roles, false otherwise.
     */
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(), // [1.1]
            context.getClass() // [1.2]
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest(); // [2.1]
        return requiredRoles.includes(user.role);
    }
}

/**
 * Documentation references:
 * 
 * [1] Reflection metadata system:
 *     The Reflector utility retrieves metadata attached by decorators.
 *     getAllAndOverride checks multiple locations with priority:
 *     - First handler-level (method), then class-level (controller)
 *     - Method-level overrides class-level for inheritance patterns
 * 
 * [1.1] context.getHandler():
 *      Returns method where the guard is applied, checking for method-level metadata
 * 
 * [1.2] context.getClass():
 *      Returns controller class, checking for controller-level metadata
 * 
 * [2] Execution context types:
 *     ExecutionContext is a wrapper that can represent different transport layers:
 *     - HTTP contexts (REST API)
 *     - WebSocket contexts
 *     - Microservice contexts (gRPC, Redis, MQTT, etc.)
 *     - GraphQL contexts
 * 
 * [2.1] context.switchToHttp():
 *      Switches to HTTP-specific context to access request/response objects
 */