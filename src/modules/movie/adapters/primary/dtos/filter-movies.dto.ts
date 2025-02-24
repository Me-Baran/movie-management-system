import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class FilterMoviesDto {
    @ApiProperty({
        description: 'Filter movies by name (partial match)',
        example: 'father',
        required: false
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Filter movies by moinimum age restriction',
        example: 12,
        required: false
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    minAge?: number;

    @ApiProperty({
        description: 'Filter movies by maximum age restriction',
        example: 16,
        required: false
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    maxAge?: number;

    @ApiProperty({
        description: 'Sort movies by field',
        enum: ['name', 'ageRestriction', 'createdAt'],
        required: false
    })
    @IsOptional()
    @IsEnum(['name', 'ageRestriction', 'createdAt'])
    sortBy?: string;

    @ApiProperty({
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
        default: 'ASC',
        required: false
    })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC';
}