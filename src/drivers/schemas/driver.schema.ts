import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Vehicle } from "../enums/vehicle.enum";
import { Status } from "../enums/driverstatus.enum";

export type DriverDocument = Driver & Document;


@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Driver {
    @Prop({ required: true, unique: true })
    phone: string

    @Prop({ required: true })
    vehicle: Vehicle

    @Prop({ required: true })
    vehicleId: string

    @Prop({ required: true })
    avatar: string

    @Prop({ required: true })
    vehicleImage: string

    @Prop({ })
    location: {
        lat: number,
        long: number
    }

    @Prop({ required: true, default: Status.OFFLINE })
    status: Status

    @Prop()
    refreshToken: string
}


const DriverSchema = SchemaFactory.createForClass(Driver)



export { DriverSchema };
