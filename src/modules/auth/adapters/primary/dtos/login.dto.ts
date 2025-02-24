import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({
        description: 'Username fro login',
        example: 'johnsmith'
    })
    @IsNotEmpty()
    @IsString()
    username: string;
    

    @ApiProperty({
        description: 'User password',
        example: 'StrongPassword123@'
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}