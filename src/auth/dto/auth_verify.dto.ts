import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumberString, IsPhoneNumber, Length } from "class-validator"

export class AuthDto_verify {
    @ApiProperty({
        type: String,
        description: 'phone property of a user',
        example: '+84333495017',
        required: true,
    })
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phone: string

    @ApiProperty({
        type: String,
        description: 'fullname property of a user',
        example: '000000',
        required: true,
    })
    @IsNumberString()
    @Length(6, 6)
    code: string;
}