import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    /**
     * Handles HTTP exceptions thrown by the application.
     * Transforms the exception into a structured JSON response containing
     * the status code, timestamp, request path, HTTP method, and error message.
     * Logs the exception details using the application's logger.
     * 
     * @param exception - The HttpException being caught.
     * @param host - The execution context containing request and response objects.
     */

    catch(exception: HttpException, host: ArgumentsHost) { // [1]
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const errorResponse = exception.getResponse();

        const error = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            ...(typeof errorResponse === 'object' ? errorResponse : {message: errorResponse})
        }

        // Log error information
        this.logger.error(
            `HTTP Exception: ${status} - ${request.method} ${request.url}`,
            typeof errorResponse === 'object'
                ? JSON.stringify(errorResponse)
                : errorResponse,
            exception.stack
        );

        response.status(status).json(error);
    }
}

/**
 * [1]:
 * - ctx: ExecutionContext:
 * ExecutionContext is a wrapper that can represent different transport layers:
 * - HTTP contexts (REST API)
 * - WebSocket contexts
 * - Microservice contexts (gRPC, Redis, MQTT, etc.)
 * - GraphQL contexts
 * 
 * - host: ArgumentsHost:
 * ArgumentHost object is a wrapper around ExecutionContext that provides access to request and response objects
 * methods:
 * - switchToHttp(): Switches to HTTP-specific context to access request/response objects
 * - getRequest(): Returns the request object associated with the current context
 * - getResponse(): Returns the response object associated with the current context

 * exception: 
 * - HttpException: Exception thrown by the application
 * - status: Status code of the HTTP response
 * - getStatus(): Returns the status code of the HTTP response
 * - getResponse(): Returns the response object associated with the current context
 */