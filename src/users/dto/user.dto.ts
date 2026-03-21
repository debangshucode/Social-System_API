import { Expose } from "class-transformer";
import { user_role } from "../entities/user.entity";

export class UserDto {

    @Expose()
    email:string;

    @Expose()
    first_name:string;

    @Expose()
    last_name:string;

    @Expose()
    phone_number:string;

    @Expose()
    role:user_role;

    @Expose()
    created_at:Date;

    @Expose()
    updated_at:Date;

}


/**"
 * id": 1,
            "email": "abcd@gmail.com",
            "password": "$2b$12$p57DeL/sOSPUDvWlZXLG.upKA2l.Je/.rORwwJWRzzDcXcbRr6Fda",
            "first_name": "Debangshu",
            "last_name": "Dey",
            "phone_number": "1234567890",
            "role": "USER",
            "refreshToken": "$2b$10$bK0/gBF0FFM4tWrU6Ejoauz5StPzRhPq9aD2ts7VD6pf85HLHf5.C",
            "created_at": "2026-03-21T06:13:28.901Z",
            "updated_at": "2026-03-21T10:06:55.320Z" */