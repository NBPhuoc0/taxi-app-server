import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsPhoneNumber } from "class-validator"
import { Vehicle } from "src/utils/enums/vehicle.enum"

export class CreateDriverDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone : string

    @ApiProperty()
    @IsNotEmpty()
    password : string

    @ApiProperty()
    @IsNotEmpty()
    fullname: string

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(Vehicle)
    vehicle: Vehicle

    refreshToken: string

    location: {
        lat: number,
        long: number
    }

}
