import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString, IsUUID } from 'class-validator';

export class BulkDeleteMoviesDto {
    @ApiProperty({
        description: 'Array of movie IDs to delete',
        example: ['123e4567-e89b-12d3-a456-426614174000']
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    movieIds: string[];
}