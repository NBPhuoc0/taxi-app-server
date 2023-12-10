import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
export class FilterUserDto {

    @ApiProperty({
        type: String,
        description: 'find by name',
        example: 'Phước',
        required: false,
    })
    @IsString()
    fullname: string

    @ApiProperty({
        type: String,
        description: 'find by phonenumer',
        example: '84333',
        required: false,
    })
    @IsString()
    phone: string

    @ApiProperty({
        type: Number,
        description: 'current page',
        example: 1,
        required: false,
    })
    page: number;

    @ApiProperty({
        type: Number,
        description: 'limit seacrh results',
        example: 10,
        required: false,
    })
    limit: number;
}