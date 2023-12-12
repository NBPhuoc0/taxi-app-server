import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateOrderDto {

    @ApiProperty()
    @IsNotEmpty()
    source_address: string;

    @ApiProperty()
    @IsNotEmpty()
    destination_address: string;

    @ApiProperty()
    @IsNotEmpty()
    orderTotal: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    source_location: {
        lat: number;
        long: number;
    };
    
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    destination_location: {
        lat: number;
        long: number;
    };

    @ApiProperty()
    @IsNotEmpty()
    distance: number;

    @ApiProperty()
    @IsNotEmpty()
    duration: number;

    @ApiProperty()
    @IsNotEmpty()
    user: string;

}
