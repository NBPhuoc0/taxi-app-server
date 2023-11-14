import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
export class UserDto {
    @ApiProperty({
        type: String,
        description: 'phone property of a user and validates that it is unique',
        example: '+84333495017',
        required: true,
    })
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phone: string

    @ApiProperty({
        type: String,
        description: 'fullname property of a user',
        example: 'Nguyen Ba Phuoc',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    fullname: string;

    avatar: string;
    refreshToken: string;
    email: string;

}