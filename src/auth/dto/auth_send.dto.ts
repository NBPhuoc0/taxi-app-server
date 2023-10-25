import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsPhoneNumber } from "class-validator"

export class AuthDto_send {
    @ApiProperty({
        type: String,
        description: 'phone property of a user',
        example: '+84333495017',
        required: true,
    })
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phone: string

}