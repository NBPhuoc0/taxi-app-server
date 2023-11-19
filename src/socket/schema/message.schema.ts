import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MessageDocument = Message & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Message {
    @Prop({ required: true, type: [{ type: Types.ObjectId, ref: 'Chats' }] })
    chatId: string

    @Prop({ required: true })
    owner: boolean // true = user, false = driver

    @Prop({ required: true })
    message: string

}

export const MessageSchema = SchemaFactory.createForClass(Message)
