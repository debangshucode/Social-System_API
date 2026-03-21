import { Expose } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';
import { user_role } from "../entities/user.entity";

export class UserDto {

    @Expose()
    @ApiProperty({ example: 'alex@example.com' })
    email:string;

    @Expose()
    @ApiProperty({ example: 'Alex' })
    first_name:string;

    @Expose()
    @ApiProperty({ example: 'Morgan' })
    last_name:string;

    @Expose()
    @ApiProperty({ example: '9876543210' })
    phone_number:string;

    @Expose()
    @ApiProperty({ enum: user_role, example: user_role.USER })
    role:user_role;

    @Expose()
    @ApiProperty({ example: '2026-03-21T06:13:28.901Z' })
    created_at:Date;

    @Expose()
    @ApiProperty({ example: '2026-03-21T10:06:55.320Z' })
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
