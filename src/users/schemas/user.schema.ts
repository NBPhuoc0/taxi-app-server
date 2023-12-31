import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { location } from "src/utils/interface/location.interface";

export type UserDocument = User & Document;
@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class User {
    @Prop({ required: true, unique: true })
    phone: string

    @Prop({ required: true })
    password: string

    @Prop({ required: true })
    fullname: string

    @Prop({  })
    email: string

    @Prop({ })
    location: location

    @Prop()
    refreshToken: string

    @Prop()
    avatar: string
}


const UserSchema = SchemaFactory.createForClass(User)



export { UserSchema };
