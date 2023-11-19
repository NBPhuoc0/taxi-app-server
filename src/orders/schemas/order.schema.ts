import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { OderStatus } from "../enum/oderstatus.enum";

export type OderDocument = Oder & Document;

class location {
    lat: number ;
    long: number ;
}

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Oder {
    @Prop({ required: true })
    oderStatus: OderStatus

    @Prop({ required: true, unique: true })
    oderTotal: number

    @Prop({ required: true })
    source_address: string

    @Prop({})
    source_location: location

    @Prop({ required: true })
    destination_address: string

    @Prop({})
    destination_location: location

    @Prop({ required: true, ref: 'Driver' })
    driver: string

    @Prop({ required: true, ref: 'User'})
    user: string
}


const OderSchema = SchemaFactory.createForClass(Oder)



export { OderSchema };
