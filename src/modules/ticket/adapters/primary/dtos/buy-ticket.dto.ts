import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class BuyTicketDto {
    @ApiProperty({
        description: 'ID of the movie',
        example: 'movie-123'
    })
    @IsNotEmpty()
    @IsString()
    movieId: string;

    @ApiProperty({
        description: 'ID of the session',
        example: 'session-123'
    })
    @IsNotEmpty()
    @IsString()
    sessionId: string;
}