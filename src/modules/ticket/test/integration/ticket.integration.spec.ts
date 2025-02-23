import { INestApplication, ValidationPipe } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserTypeormEntity } from "src/modules/auth/adapters/secondary/persistence/user.typeorm-entity";
import { MovieTypeormEntity } from "src/modules/movie/adapters/secondary/persistence/movie.typeorm-entity";
import { SessionTypeormEntity } from "src/modules/movie/adapters/secondary/persistence/session.typeorm-entity";
import { TicketTypeormEntity } from "../../adapters/secondary/persistence/ticket.typeorm-entity";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "src/modules/auth/auth.module";
import { MovieModule } from "src/modules/movie/movie.module";
import { TicketModule } from "../../ticket.module";
import * as request from "supertest";

describe('Ticket Integration Tests', () => {
    let app: INestApplication;
    let customerToken: string;
    let managerToken: string;
    let movieId: string;
    let sessionId: string;
    let ticketId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test'
                }),
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [MovieTypeormEntity, SessionTypeormEntity, UserTypeormEntity, TicketTypeormEntity],
                    synchronize: true,
                }),
                PassportModule.register({ defaultStrategy: 'jwt' }),
                JwtModule.register({
                    secret: '19d83ec3dc9d1a50763810d3719d8558df831410933395341035d3fa9b8d14dc',
                    signOptions: { expiresIn: '1h' }
                }),
                AuthModule,
                MovieModule,
                TicketModule
            ]
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        // Set up test data
        // Register and login users for testing
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: 'testmanager',
                password: 'Password123!',
                age: 30,
                role: 'manager'
            });

        const managerLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: 'testmanager',
                password: 'Password123!'
            });
        managerToken = managerLogin.body.accessToken;

        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: 'testcustomer',
                password: 'Password123!',
                age: 15,
                role: 'customer'
            });

        const customerLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: 'testcustomer',
                password: 'Password123!'
            });
        customerToken = customerLogin.body.accessToken;

        // Create a test movie
        const movieResponse = await request(app.getHttpServer())
            .post('/movies')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                name: 'Test Movie',
                ageRestriction: 12
            });

        movieId = movieResponse.body.id;

        // Add a session to the movie
        const sessionResponse = await request(app.getHttpServer())
            .post(`/movies/${movieId}/sessions`)
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                date: '2025-02-01',
                timeSlot: '14:00-16:00',
                roomNumber: 1,
                availableSeats: 100
            });

        sessionId = sessionResponse.body.sessions[0].id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Ticket Endpoints', () => {
        describe('POST /tickets/buy', () => {
            it('should successfully buy a ticket', async () => {
                const response = await request(app.getHttpServer())
                    .post('/tickets/buy')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .send({
                        movieId,
                        sessionId
                    })
                    .expect(201);

                expect(response.body).toHaveProperty('id');
                expect(response.body.movieId).toBe(movieId);
                expect(response.body.sessionId).toBe(sessionId);
                expect(response.body).toHaveProperty('purchaseDate');

                ticketId = response.body.id;
            });

            it('should prevent buying duplicate tickets', async () => {
                await request(app.getHttpServer())
                    .post('/tickets/buy')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .send({
                        movieId,
                        sessionId
                    })
                    .expect(409) // conflict
            });

            it('should reject invalid movie ID', async () => {
                await request(app.getHttpServer())
                    .post('/tickets/buy')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .send({
                        movieId: 'invalid-movie-id',
                        sessionId
                    })
                    .expect(404); // Not Found
            });
        });

        describe('POST /tickets/:id/use - Use a ticket', () => {
            it('should successfully use a ticket', async () => {
                const response = await request(app.getHttpServer())
                    .post(`/tickets/${ticketId}/use`)
                    .set('Authorization', `Bearer ${customerToken}`)
                    .expect(200);

                expect(response.body.id).toBe(ticketId);
                expect(response.body).toHaveProperty('usedDate');
            });

            it('should prevent using ticket twice', async () => {
                await request(app.getHttpServer())
                    .post(`/tickets/${ticketId}/use`)
                    .set('Authorization', `Bearer ${customerToken}`)
                    .expect(409); // Conflict
            });

            it('should reject invalid ticket ID', async () => {
                await request(app.getHttpServer())
                    .post('/tickets/invalid-ticket-id/use')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .expect(404); // Not Found
            });
        });

        describe('GET /tickets/history - Get watch history', () => {
            it('should return watch history', async () => {
                const response = await request(app.getHttpServer())
                    .get('/tickets/history')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .expect(200);

                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length).toBeGreaterThan(0);
                expect(response.body[0].id).toBe(ticketId);
                expect(response.body[0]).toHaveProperty('usedDate');
            });
        });

        describe('GET /tickets/unused - Get unused tickets', () => {
            it('should return unused tickets', async () => {
                const response = await request(app.getHttpServer())
                    .get('/tickets/unused')
                    .set('Authorization', `Bearer ${customerToken}`)
                    .expect(200);

                expect(Array.isArray(response.body)).toBe(true);
                // Since we used our only ticket, unused tickets should be empty
                expect(response.body.length).toBe(0);
            });
        });

        describe('Authentication and Authorization', () => {
            it('should reject requests without authentication', async () => {
                await request(app.getHttpServer())
                    .get('/tickets/history')
                    .expect(401); // Unauthorized
            });

            it('should reject requests with invalid token', async () => {
                await request(app.getHttpServer())
                    .get('/tickets/history')
                    .set('Authorization', 'Bearer invalid-token')
                    .expect(401); // Unauthorized
            });
        });
    })
})