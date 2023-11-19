import { Body, Controller, Get, Param, Post, Delete } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ChatsService } from "./chats.service";
import { ChatDto } from "./dto/create-chats.dto";

@ApiTags('Chats')
@Controller('chats')
export class ChatsController{
    constructor(
        private readonly chatsService: ChatsService,
    ) {}

    @Get(':id')
    getChats( @Param('id') id: string) {
        return this.chatsService.findOneChats(id);
    }

    @Post()
    createChats( @Body() ChatDto: ChatDto) {
        return this.chatsService.create(ChatDto);
    }

    @Delete(':id')
    deleteChats( @Body() id: string) {
        return this.chatsService.deleteChats(id);
    }
}