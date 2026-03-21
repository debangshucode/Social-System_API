import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';


export class AuthResponseDto {
  @Expose()
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @Expose()
  @Type(() => UserDto)
  @ApiProperty({ type: () => UserDto })
  user: UserDto;
}
