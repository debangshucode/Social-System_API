import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class changePasswordDto {
    @ApiProperty({ example: 'secret123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    cur_password: string;

    @ApiProperty({ example: 'newsecret123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    new_password: string;
}
