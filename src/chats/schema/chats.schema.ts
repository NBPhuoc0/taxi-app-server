import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Message } from "./message.schema";

export type ChatsDocument = Chats & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Chats {
    @Prop({ required: true })
    user: string

    @Prop({ required: true })
    driver: string

    @Prop({type: [{ type: Types.ObjectId, ref: 'Message' }]}) 
    messages: Message[]

}

const ChatsSchema = SchemaFactory.createForClass(Chats)

export { ChatsSchema };