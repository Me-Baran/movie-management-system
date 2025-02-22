


// src/modules/auth/test/auth.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth.module';
import { UserTypeormEntity } from '../adapters/secondary/persistence/user.typeorm-entity';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserTypeormEntity],
          synchronize: true,
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Endpoints', () => {
    it('should register a new customer user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testcustomer',
          password: 'Password123!',
          age: 25,
          role: 'customer',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testcustomer');
      expect(response.body.role).toBe('customer');
      expect(response.body.age).toBe(25);
    });

    it('should register a new manager user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testmanager',
          password: 'Password123!',
          age: 30,
          role: 'manager',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testmanager');
      expect(response.body.role).toBe('manager');
      expect(response.body.age).toBe(30);
      userId = response.body.id;
    });

    it('should reject registration with invalid role', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'invalidrole',
          password: 'Password123!',
          age: 25,
          role: 'admin', // Invalid role
        })
        .expect(400);
    });

    it('should reject registration with duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testcustomer', // Already exists
          password: 'Password123!',
          age: 26,
          role: 'customer',
        })
        .expect(409);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testmanager',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.username).toBe('testmanager');
      expect(response.body.user.role).toBe('manager');
      authToken = response.body.accessToken;
    });

    it('should reject login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testmanager',
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.username).toBe('testmanager');
      expect(response.body.role).toBe('manager');
    });

    it('should reject profile request without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should allow managers to get user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.username).toBe('testmanager');
    });

    it('should reject customers trying to access manager endpoints', async () => {
      // First login as customer
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testcustomer',
          password: 'Password123!',
        });
      
      const customerToken = loginResponse.body.accessToken;
      
      // Try to access manager-only endpoint
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });
});