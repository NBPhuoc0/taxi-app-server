import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

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
    oderTotal: number;

    @ApiProperty()
    @IsNotEmpty()
    source_location: {
        lat: number;
        long: number;
    };
    
    @ApiProperty()
    @IsNotEmpty()
    destination_location: {
        lat: number;
        long: number;
    };

}
