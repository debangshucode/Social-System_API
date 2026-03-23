import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateProfileDto {
    @ApiProperty({
        example:'debangshu_07'
    })
    @IsString()
    user_name:string ;

    @ApiProperty({
        example:'Hi everyone'
    })
    @IsString()
    @IsOptional()
    bio:string | null;

}
