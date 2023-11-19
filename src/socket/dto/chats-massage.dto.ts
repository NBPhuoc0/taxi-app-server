import { IsNotEmpty } from "class-validator";

export class ChatMessageDto {
    @IsNotEmpty()
    chatId: string;

    @IsNotEmpty()
    owner: boolean;
    
    @IsNotEmpty()
    message: string;
}