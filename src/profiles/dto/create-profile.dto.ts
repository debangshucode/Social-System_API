import { IsString } from "class-validator";

export class CreateProfileDto {
    @IsString()
    user_name:string ;

    @IsString()
    bio:string;

}
