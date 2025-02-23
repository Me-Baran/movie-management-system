import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MovieTypeormEntity } from "../../adapters/secondary/persistence/movie.typeorm-entity";
import { SessionTypeormEntity } from "../../adapters/secondary/persistence/session.typeorm-entity";
import { UserTypeormEntity } from "src/modules/auth/adapters/secondary/persistence/user.typeorm-entity";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { MovieModule } from "../../movie.module";
import { AuthModule } from "src/modules/auth/auth.module";
import * as request from "supertest";

describe('Movie Integration Tests', () => {
    let app: INestApplication;
    let managerToken: string;
    let customerToken: string;
    let movieId: string;

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
                    entities: [MovieTypeormEntity, SessionTypeormEntity, UserTypeormEntity],
                    synchronize: true,
                    // Enable foreign key support for SQLite
                    extra: {
                        foreign_keys: true
                    }
                }),
                PassportModule.register({ defaultStrategy: 'jwt' }),
                JwtModule.register({
                    secret: '19d83ec3dc9d1a50763810d3719d8558df831410933395341035d3fa9b8d14dc',
                    signOptions: { expiresIn: '1h' }
                }),
                AuthModule,
                MovieModule
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        // Register and login users for testing
        // Manager user
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

        // Customer user
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
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Movie Endpoints', () => {
        it('should create a new movie as manager', async () => {
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
            expect(response.body.ageRestriction).toBe(12);
            movieId = response.body.id;
        });

        it('should reject movie creation by customer', async () => {
            await request(app.getHttpServer())
                .post('/movies')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    name: 'Customer Movie',
                    ageRestriction: 12
                })
                .expect(403);
        });

        it('should add a session to a movie as manager', async () => {
            const response = await request(app.getHttpServer())
                .post(`/movies/${movieId}/sessions`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    date: '2024-12-25',
                    timeSlot: '14:00-16:00',
                    roomNumber: 1,
                    availableSeats: 100
                })
                .expect(201);

            expect(response.body.sessions).toHaveLength(1);
            expect(response.body.sessions[0].timeSlot).toBe('14:00-16:00');
            expect(response.body.sessions[0].roomNumber).toBe(1);
        });

        it('should reject session creation with invalid time slot', async () => {
            await request(app.getHttpServer())
                .post(`/movies/${movieId}/sessions`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    date: '2024-12-25',
                    timeSlot: '11:00-13:00', // Invalid time slot
                    roomNumber: 1,
                    availableSeats: 100
                })
                .expect(400);
        });

        it('should prevent double booking of room', async () => {
            // Try to book the same room at the same time
            await request(app.getHttpServer())
                .post(`/movies/${movieId}/sessions`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    date: '2024-12-25',
                    timeSlot: '14:00-16:00',
                    roomNumber: 1,
                    availableSeats: 100
                })
                .expect(409);
        });

        it('should update movie details as manager', async () => {
            const response = await request(app.getHttpServer())
                .put(`/movies/${movieId}`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    name: 'Updated Movie Name',
                    ageRestriction: 16
                })
                .expect(200);

            expect(response.body.name).toBe('Updated Movie Name');
            expect(response.body.ageRestriction).toBe(16);
        });

        it('should list all movies with sessions', async () => {
            const response = await request(app.getHttpServer())
                .get('/movies')
                .set('Authorization', `Bearer ${managerToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('sessions');
            expect(Array.isArray(response.body[0].sessions)).toBe(true);
        });

        it('should filter movies by age restriction for customer', async () => {
            // Create a movie with high age restriction
            await request(app.getHttpServer())
                .post('/movies')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    name: 'Adult Movie',
                    ageRestriction: 18
                });

            // Customer (age 15) should not see movies with ageRestriction > 15
            const response = await request(app.getHttpServer())
                .get('/movies')
                .set('Authorization', `Bearer ${customerToken}`)
                .expect(200);

            const adultMovies = response.body.filter(
                (movie: any) => movie.ageRestriction > 15
            );
            expect(adultMovies).toHaveLength(0);
        });

        it('should allow sorting movies by name', async () => {
            const response = await request(app.getHttpServer())
                .get('/movies?sortBy=name&sortOrder=ASC')
                .set('Authorization', `Bearer ${managerToken}`)
                .expect(200);

            const names = response.body.map((m: any) => m.name);
            const sortedNames = [...names].sort();
            expect(names).toEqual(sortedNames);
        });

        // Test getting movie by ID before deletion
        it('should get movie by ID', async () => {
            const response = await request(app.getHttpServer())
                .get(`/movies/${movieId}`)
                .set('Authorization', `Bearer ${managerToken}`)
                .expect(200);

            expect(response.body.id).toBe(movieId);
            expect(response.body).toHaveProperty('sessions');
        });

        // Delete related sessions first
        it('should allow deletion of a movie with sessions', async () => {
            // Get the movie to find its sessions
            const movieResponse = await request(app.getHttpServer())
                .get(`/movies/${movieId}`)
                .set('Authorization', `Bearer ${managerToken}`);

            // Now delete the movie
            await request(app.getHttpServer())
                .delete(`/movies/${movieId}`)
                .set('Authorization', `Bearer ${managerToken}`)
                .expect(204);

            // Verify movie is deleted
            await request(app.getHttpServer())
                .get(`/movies/${movieId}`)
                .set('Authorization', `Bearer ${managerToken}`)
                .expect(404);
        });
    });
});