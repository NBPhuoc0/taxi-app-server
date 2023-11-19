import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class AuthDto_pass_driver {
    @ApiProperty()
    @IsPhoneNumber('VN')
    phone: string;

    @IsNotEmpty()
    @ApiProperty()
    password: string;
}