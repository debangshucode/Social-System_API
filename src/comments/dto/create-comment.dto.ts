import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCommentDto {
    @ApiProperty({
        example:'Tooo goood postt !'
    })
    @IsString()
    content:string;
}
