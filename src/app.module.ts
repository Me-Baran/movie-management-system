import { HttpException, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/filters/logging.interceptor';
import { TimeoutInterceptor } from './common/filters/timeout.interceptor';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}`
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get('DB_TYPE', 'postgres') as any,
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        databse: configService.get('DB_NAME', 'movie_management'),
        entities: [__dirname + '/**/*.typeorm-entity{.ts}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false)
      })
    }),

    // Domain modules
    AuthModule,
    // MovieModule,
    // TicketModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global exception filter
    {
      provide: APP_FILTER, // [1]
      useClass: HttpExceptionFilter
    },
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor
    }
  ],
})
export class AppModule {}


/**
 * When a request comes in, interceptors are executed in the order they're registered (LoggingInterceptor → TimeoutInterceptor)
When a response goes out, they're executed in reverse order (TimeoutInterceptor → LoggingInterceptor)

This pattern allows you to apply cross-cutting concerns (logging, timeout handling, etc.) globally 
without repeating code in individual controllers or routes.

The APP_* tokens are special injection tokens provided by NestJS's core that enable framework-level integration
PP_FILTER and APP_INTERCEPTOR allow for global registration of application components
 */