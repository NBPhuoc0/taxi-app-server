import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { location } from "src/utils/interface/location.interface";

export class CreateOrderDto {
    @ApiProperty()
    @IsNotEmpty()
    vehicle_type: string;

    @ApiProperty()
    @IsNotEmpty()
    source_address: string;

    @ApiProperty()
    @IsNotEmpty()
    destination_address: string;

    @ApiProperty()
    @IsNotEmpty()
    source_location: location;
    
    @ApiProperty()
    @IsNotEmpty()
    destination_location: location;

    @ApiProperty()
    @IsNotEmpty()
    orderTotal: number;

    @ApiProperty()
    @IsNotEmpty()
    distance: number;

    @ApiProperty()
    @IsNotEmpty()
    duration: number;

}
