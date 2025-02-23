import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateMovieDto {
    @ApiProperty({
        description: 'Name of the movie',
        example: 'The Godfather'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Age restriction for the movie',
        example: 16,
        minimum: 0
    })
    @IsInt()
    @Min(0)
    ageRestriction: number;
}