import { IsNotEmpty } from "class-validator";

export class ChatDto {

    @IsNotEmpty()
    user: string;

    @IsNotEmpty()
    driver: string;
}
