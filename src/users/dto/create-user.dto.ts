import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @IsString()
    password: string

    @IsString()
    @IsNotEmpty()
    first_name: string

    @IsString()
    @IsNotEmpty()
    last_name: string

    @IsString()
    @Length(10, 10)
    @Matches(/^\d+$/)
    phone_number: string

}
