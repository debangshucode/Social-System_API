import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class changePasswordDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    cur_password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    new_password: string;
}