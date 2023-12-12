import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateOrderDto {
    @ApiProperty()
    @IsNotEmpty()
    driver: string;

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

}
