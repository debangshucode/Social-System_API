import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreatePostDto {
    @ApiProperty({
        example:"This is a test post ,No: 1"
    })
    @IsString()
    content:string;
}
