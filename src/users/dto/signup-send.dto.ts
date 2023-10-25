import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class CreateUserDto_send {

    @ApiProperty({
        type: String,
        description: 'phone property of a user and validates that it is unique',
        example: '+84333495017',
        required: true,
    })
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phone: string
}