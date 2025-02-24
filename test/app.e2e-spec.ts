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

    describe('Authentication', () => {
      it('should authenticate manager and provide token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: 'testmanager',
            password: 'Manager123!'
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        managerToken = response.body.accessToken;
      });

      it('should authenticate customer and provide token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: 'testcustomer',
            password: 'Customer123!'
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        customerToken = response.body.accessToken;
      });

      it('should reject invalid credentials', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: 'testmanager',
            password: 'wrongpassword'
          })
          .expect(401);
      });
    });
  });

  describe('Movie Management', () => {
    describe('Create and Manage Movies', () => {
      it('should allow manager to create a movie', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            name: 'Test Movie',
            ageRestriction: 12
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test Movie');
        movieId = response.body.id;
      });

      it('should prevent customer from creating movies', async () => {
        await request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Customer Movie',
            ageRestriction: 12
          })
          .expect(403);
      });

      it('should allow manager to add a session', async () => {
        const response = await request(app.getHttpServer())
          .post(`/movies/${movieId}/sessions`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            date: '2025-03-01',
            timeSlot: '14:00-16:00',
            roomNumber: 1,
            availableSeats: 100
          })
          .expect(201);

        expect(response.body.sessions).toHaveLength(1);
        sessionId = response.body.sessions[0].id;
      });

      it('should prevent double-booking of rooms', async () => {
        await request(app.getHttpServer())
          .post(`/movies/${movieId}/sessions`)
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            date: '2025-03-01',
            timeSlot: '14:00-16:00',
            roomNumber: 1,
            availableSeats: 100
          })
          .expect(409);
      });
    });

    describe('View Movies', () => {
      it('should list all available movies', async () => {
        const response = await request(app.getHttpServer())
          .get('/movies')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('sessions');
      });

      it('should allow sorting movies', async () => {
        await request(app.getHttpServer())
          .get('/movies?sortBy=name&sortOrder=ASC')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);
      });
    });
  });

  describe('Ticket System', () => {
    describe('Purchase and Use Tickets', () => {
      it('should allow customer to buy a ticket', async () => {
        const response = await request(app.getHttpServer())
          .post('/tickets/buy')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            movieId,
            sessionId
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        ticketId = response.body.id;
      });

      it('should prevent duplicate ticket purchase', async () => {
        await request(app.getHttpServer())
          .post('/tickets/buy')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            movieId,
            sessionId
          })
          .expect(409);
      });

      it('should allow customer to use a ticket', async () => {
        const response = await request(app.getHttpServer())
          .post(`/tickets/${ticketId}/use`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('usedDate');
      });

      it('should prevent using the same ticket twice', async () => {
        await request(app.getHttpServer())
          .post(`/tickets/${ticketId}/use`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(409);
      });
    });

    describe('View Ticket History', () => {
      it('should show customer watch history', async () => {
        const response = await request(app.getHttpServer())
          .get('/tickets/history')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('usedDate');
      });

      it('should show unused tickets', async () => {
        const response = await request(app.getHttpServer())
          .get('/tickets/unused')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Age Restrictions', () => {
    it('should prevent underage customers from viewing restricted movies', async () => {
      // Create a movie with high age restriction
      const restrictedMovie = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Adult Movie',
          ageRestriction: 21
        })
        .expect(201);

      // Try to get details as underage customer
      await request(app.getHttpServer())
        .get(`/movies/${restrictedMovie.body.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid movie IDs', async () => {
      await request(app.getHttpServer())
        .get('/movies/invalid-id')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);
    });

    it('should handle invalid ticket IDs', async () => {
      await request(app.getHttpServer())
        .post('/tickets/invalid-id/use')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);
    });

    it('should handle unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/movies')
        .expect(401);
    });
  });

  describe('Bulk Operations', () => {
    describe('POST /movies/bulk', () => {
      it('should create multiple movies successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/bulk')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            movies: [
              { name: 'Bulk Movie 1', ageRestriction: 12 },
              { name: 'Bulk Movie 2', ageRestriction: 16 }
            ]
          })
          .expect(201);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0].name).toBe('Bulk Movie 1');
        expect(response.body[1]).toHaveProperty('id');
        expect(response.body[1].name).toBe('Bulk Movie 2');

        // Store movie IDs for the delete test
        const movieIds = response.body.map(movie => movie.id);

        // Verify movies exist
        for (const id of movieIds) {
          const getResponse = await request(app.getHttpServer())
            .get(`/movies/${id}`)
            .set('Authorization', `Bearer ${managerToken}`)
            .expect(200);

          expect(getResponse.body.id).toBe(id);
        }

        // Delete the movies
        await request(app.getHttpServer())
          .delete('/movies/bulk')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({ movieIds })
          .expect(204);

        // Verify movies are deleted
        for (const id of movieIds) {
          await request(app.getHttpServer())
            .get(`/movies/${id}`)
            .set('Authorization', `Bearer ${managerToken}`)
            .expect(404);
        }
      });

      it('should reject bulk creation by customer', async () => {
        await request(app.getHttpServer())
          .post('/movies/bulk')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            movies: [
              { name: 'Customer Movie', ageRestriction: 12 }
            ]
          })
          .expect(403);
      });

      it('should validate movie data in bulk creation', async () => {
        await request(app.getHttpServer())
          .post('/movies/bulk')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            movies: [
              { name: '', ageRestriction: -1 } // Invalid data
            ]
          })
          .expect(400);
      });
    });

    describe('DELETE /movies/bulk', () => {
      it('should handle non-existent movies in bulk deletion', async () => {
        await request(app.getHttpServer())
          .delete('/movies/bulk')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            movieIds: ['123e4567-e89b-12d3-a456-426614174000']
          })
          .expect(404)
          .expect(res => {
            expect(res.body.message).toContain('not found');
          });
      });

      it('should reject bulk deletion by customer', async () => {
        await request(app.getHttpServer())
          .delete('/movies/bulk')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            movieIds: ['123e4567-e89b-12d3-a456-426614174000']
          })
          .expect(403);
      });

      it('should validate movieIds in bulk deletion request', async () => {
        await request(app.getHttpServer())
          .delete('/movies/bulk')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            movieIds: [] // Empty array should be rejected
          })
          .expect(400);
      });
    });
  });
});
