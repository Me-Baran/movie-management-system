import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global middleware
  app.use(helmet());
  app.use(compression());
  app.enableCors();

  // Global pipes
  app.useGlobalPipes( // [1]
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { 
        enableImplicitConversion: true 
      },
    })
  )

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Movie management system API')
    .setDescription('RESTful API for managing movies, users and tickets')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('movies', 'Movie management endpoints')
    .addTag('tickets', 'Ticket purchase and management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Set the api path for serving swagger documentation
  SwaggerModule.setup('api', app, document);

  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application listening on http://localhost:${port} in ${process.env.NODE_ENV} mode`);
}
bootstrap();


/**
 * [1]:
 *
 * whitelist: true
 *
 * Automatically removes any properties from the request body that don't have a matching property in the DTO (Data Transfer Object) class.
 * Helps prevent unwanted or potentially malicious properties from being passed to your application.
 *
 * forbidNonWhitelisted: true
 *
 * Rather than just silently stripping non-whitelisted properties, this option makes the validation throw an error if any non-whitelisted properties are present.
 * Provides stronger protection and gives clear feedback to API consumers when they send invalid data.
 *
 * transform: true
 *
 * Automatically transforms incoming payload to be an instance of the DTO class.
 * Converts primitive types to their JavaScript types according to the type declarations in your DTO (e.g., string "123" to number 123).
 * Enables automatic conversion of query parameters and path parameters to the correct types.
 * Makes it easier to work with typed objects throughout your application.
 */
