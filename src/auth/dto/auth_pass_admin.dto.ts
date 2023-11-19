import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class AuthDto_pass_admin {
    @ApiProperty()
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @ApiProperty()
    password: string;
}