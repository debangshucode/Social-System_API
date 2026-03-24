import { AuthorResponseDto } from "./author.response.dto";


export class CommentPreviewResponseDto {
  id: number;
  content: string;
  created_at: Date;
  author: AuthorResponseDto;
}