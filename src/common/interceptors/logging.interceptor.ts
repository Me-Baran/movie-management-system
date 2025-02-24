import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor { // Implements the NestInterceptor interface, indicating it will intercept requests/responses
    private readonly logger = new Logger(LoggingInterceptor.name);

    /**
     * Log the request and response details.
     *
     * The request details logged include: HTTP method, URL, user who made the request.
     * The response details logged include: HTTP method, URL, time taken to respond in milliseconds, user who made the request.
     *
     * @param context ExecutionContext of the request
     * @param next CallHandler to handle the request
     * @returns Observable of the response
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> { //Observable: Represents an asynchronous data stream
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        const now = Date.now();
        const userInfo = req.user ? `user:${req.user.username}` : 'anonymous';

        this.logger.log(`Request: ${method} ${url} - ${userInfo}`);

        return next // next: Represents the next step in the request pipeline
            .handle() // The request is passed to the next handler in the chain with next.handle()
                      // next.handle() returns an Observable that will emit the response when ready
            .pipe( // .pipe(tap(() => {...})) chains an operator that will execute after the response is generated
                   // this is to perform operations after the request has been processed but before the response is sent to the client.
                tap(() => { // tap: An RxJS operator that allows side effects without modifying the stream
                    const responseTime = Date.now() - now;
                    this.logger.log(`Response: ${method} ${url} - ${responseTime}ms - ${userInfo}`)
                })
            )
    }
}