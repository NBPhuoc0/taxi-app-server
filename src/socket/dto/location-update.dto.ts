import { IsNotEmpty } from "class-validator";
import { location } from "../../utils/interface/location.interface";

export class LocationUpdateDto {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    location: location;
}