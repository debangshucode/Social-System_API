import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Alex' })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    first_name: string;

    @ApiPropertyOptional({ example: 'Morgan' })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    last_name: string;

    @ApiPropertyOptional({ example: '9876543210', minLength: 10, maxLength: 10 })
    @IsString()
    @Length(10, 10)
    @Matches(/^\d+$/)
    @IsOptional()
    phone_number: string;
}
