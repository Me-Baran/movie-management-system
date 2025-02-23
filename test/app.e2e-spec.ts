import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Movie Management System (e2e)', () => {
  let app: INestApplication<App>;
  let managerToken: string;
  let customerToken: string;
  let movieId: string;
  let sessionId: string;
  let ticketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Management', () => {
    describe('Registration', () => {
      it('should register a manager user', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            username: 'testmanager',
            password: 'Manager123!',
            age: 30,
            role: 'manager'
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.username).toBe('testmanager');
        expect(response.body.role).toBe('manager');
      });

      it('should register a customer user', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            username: 'testcustomer',
            password: 'Customer123!',
            age: 18,
            role: 'customer'
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.username).toBe('testcustomer');
        expect(response.body.role).toBe('customer');
      });

      it('should reject registration with invalid role', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            username: 'invalid',
            password: 'Invalid123!',
            age: 25,
            role: 'invalid'
          })
          .expect(400);
      });
    });

    

  })
});
