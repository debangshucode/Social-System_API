import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthorResponseDto {
  @ApiProperty({ example: 4 })
  profile_id: number;

  @ApiProperty({ example: 'john' })
  user_name: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/john.jpg', nullable: true })
  avatar_url: string | null;
}