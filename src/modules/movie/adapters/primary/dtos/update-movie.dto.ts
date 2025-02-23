import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateMovieDto {
    @ApiProperty({
        description: 'Name of the movie',
        example: 'The Godfather: P2',
        required: false
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Age restriction for the movie',
        example: 18,
        minimum: 0,
        required: false
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    ageRestriction?: number;
}