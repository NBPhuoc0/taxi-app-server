import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"

export class CreateAdminDto {
    @ApiProperty()
    @IsNotEmpty()
    username: string

    @ApiProperty()
    @IsNotEmpty()
    password : string

    @ApiProperty()
    @IsNotEmpty()
    fullname : string

    
    refreshToken : string
}
