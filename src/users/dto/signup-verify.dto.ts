import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsPhoneNumber, IsString, Length } from "class-validator";

export class CreateUserDto_verify {
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

    @ApiProperty({
        type: String,
        description: 'fullname property of a user',
        example: '000000',
        required: true,
    })
    @IsNumberString()
    @Length(6, 6)
    code: string;

    refreshToken: string;
    email: string;
    avatar: string;
}