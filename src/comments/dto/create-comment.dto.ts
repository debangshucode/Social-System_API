import { IsNumber, IsString } from "class-validator";

export class CreateCommentDto {

    @IsNumber()
    post_id:number;

    @IsString()
    content:string;
}
