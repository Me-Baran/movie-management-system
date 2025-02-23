import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsIn, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateSessionDto {
    @ApiProperty({
        description: 'Date of the session',
        example: '2023-06-15'
    })
    @IsNotEmpty()
    @IsDateString()
    date: string;

    @ApiProperty({
        description: 'Time slot for the session',
        example: '18:00-20:00',
        enum: [
            '10:00-12:00', '12:00-14:00', '14:00-16:00',
            '16:00-18:00', '18:00-20:00', '20:00-22:00', 
            '22:00-00:00'
        ]
    })
    @IsNotEmpty()
    @IsString()
    @IsEnum([
        '10:00-12:00', '12:00-14:00', '14:00-16:00',
            '16:00-18:00', '18:00-20:00', '20:00-22:00', 
            '22:00-00:00'
    ])
    timeSlot: string;

    @ApiProperty({
        description: 'Room number for the session',
        example: 3,
        minimum: 1
    })
    @IsInt()
    @Min(1)
    roomNumber: number;

    @ApiProperty({
        description: 'Number of available seats',
        example: 100,
        minimum: 1
    })
    @IsInt()
    @Min(1)
    availableSeats: number
}