import { Expose, Type } from 'class-transformer';
import { UserDto } from 'src/users/dto/user.dto';


export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}
