import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class RegisterUserDto {
    @ApiProperty({
        description: 'Username for registeration',
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

    @ApiProperty({
        description: 'User age',
        example: 18,
        minimum: 1
    })
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    age: number;

    @IsNotEmpty()
    @IsString()
    @IsEnum(['manager', 'customer'])
    role: string;
}