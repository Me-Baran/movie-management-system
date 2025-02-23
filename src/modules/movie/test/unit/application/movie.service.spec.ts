import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from 'src/modules/movie/application/services/movie.service';
import { IMovieRepository } from 'src/modules/movie/application/ports/movie-repository.interface';
import { CreateMovieCommand } from 'src/modules/movie/application/commands/create-movie.command';
import { AddSessionCommand } from 'src/modules/movie/application/commands/add-session.command';
import { Movie } from 'src/modules/movie/domain/models/movie.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

describe('MovieService', () => {
    let service: MovieService;
    let repository: jest.Mocked<IMovieRepository>;

    beforeEach(async () => {
        const mockRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn(),
            existsById: jest.fn(),
            checkRoomAvailability: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MovieService,
                {
                    provide: IMovieRepository,
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<MovieService>(MovieService);
        repository = module.get(IMovieRepository);
    });

    describe('createMovie', () => {
        it('should create a movie successfully', async () => {
            const command = new CreateMovieCommand('Test Movie', 12);
            const savedMovie = Movie.create(uuidv4(), command.name, command.ageRestriction);
            repository.save.mockResolvedValue(savedMovie);

            const result = await service.createMovie(command);

            expect(result).toBeDefined();
            expect(result.getName()).toBe(command.name);
            expect(result.getAgeRestriction().getValue()).toBe(command.ageRestriction);
            expect(repository.save).toHaveBeenCalled();
        });
    });

    describe('addSession', () => {
        it('should add session to existing movie', async () => {
            const movieId = uuidv4();
            const existingMovie = Movie.create(movieId, 'Test Movie', 12);
            const command = new AddSessionCommand(
                movieId,
                new Date(),
                '10:00-12:00',
                1,
                100
            );

            repository.findById.mockResolvedValue(existingMovie);
            repository.checkRoomAvailability.mockResolvedValue(true);
            repository.save.mockResolvedValue(existingMovie);

            const result = await service.addSession(command);

            expect(result).toBeDefined();
            expect(result.getSessions()).toHaveLength(1);
            expect(repository.checkRoomAvailability).toHaveBeenCalled();
            expect(repository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException for non-existent movie', async () => {
            const command = new AddSessionCommand(
                uuidv4(),
                new Date(),
                '10:00-12:00',
                1,
                100
            );

            repository.findById.mockResolvedValue(null);

            await expect(service.addSession(command))
                .rejects
                .toThrow(NotFoundException);
        });

        it('should throw ConflictException for room booking conflict', async () => {
            const movieId = uuidv4();
            const existingMovie = Movie.create(movieId, 'Test Movie', 12);
            const command = new AddSessionCommand(
                movieId,
                new Date(),
                '10:00-12:00',
                1,
                100
            );

            repository.findById.mockResolvedValue(existingMovie);
            repository.checkRoomAvailability.mockResolvedValue(false);

            await expect(service.addSession(command))
                .rejects
                .toThrow(ConflictException);
        });
    });

});