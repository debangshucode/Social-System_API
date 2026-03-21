import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'alex@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Alex' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Morgan' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: '9876543210', minLength: 10, maxLength: 10 })
  @IsString()
  @Length(10, 10)
  @Matches(/^\d+$/)
  phone_number: string;
}
