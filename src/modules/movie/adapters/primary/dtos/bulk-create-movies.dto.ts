import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateMovieDto } from './create-movie.dto';

export class BulkCreateMoviesDto {
    @ApiProperty({
        description: 'Array of movies to create',
        type: [CreateMovieDto]
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateMovieDto)
    movies: CreateMovieDto[];
}