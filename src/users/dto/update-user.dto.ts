import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    last_name: string;

    @IsString()
    @Length(10, 10)
    @Matches(/^\d+$/)
    @IsOptional()
    phone_number: string;
}
