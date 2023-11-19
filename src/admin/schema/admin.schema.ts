import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AdminDocument = Admin & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Admin {
    @Prop({ required: true, unique: true })
    username: string

    @Prop({ required: true })
    password: string

    @Prop({ required: true })
    fullname: string

    @Prop()
    refreshToken: string
}

export const AdminSchema = SchemaFactory.createForClass(Admin)