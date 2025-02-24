import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from "@nestjs/common";
import { catchError, Observable, throwError, timeout, TimeoutError } from "rxjs"; // [1]

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        return next.handle()
            .pipe(
                timeout(30000),
                catchError(err => { // Catches any errors that occur in the pipeline
                    if (err instanceof TimeoutError) {
                        return throwError(() => new RequestTimeoutException('Request timeout'));
                    }
                    return throwError(() => err); // For all other errors, re-throws them without modification
                })
            )
    }
}


/**
 * [1]
 * RxJS in NestJS Interceptors
 * 
 * NestJS's interceptor interface is designed to work with RxJS Observables,
 * and the reactive programming model provides elegant mechanisms for timeouts
 * and error handling.
 * 
 * If attempting to avoid RxJS, alternative approaches would require:
 * 1. Creating a middleware instead of an interceptor
 * 2. Implementing custom timeout logic using JavaScript's `setTimeout`
 * 3. Clearing the timeout when the request completes
 * 4. Handling errors manually
 */