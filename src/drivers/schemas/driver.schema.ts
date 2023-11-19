import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Vehicle } from "../../utils/enums/vehicle.enum";
import { Status } from "../../utils/enums/driverstatus.enum";
import { location } from "../../utils/interface/location.interface";

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
    password: string

    @Prop({ required: true })
    fullname: string

    @Prop({ required: true })
    vehicle: Vehicle

    @Prop({ required: true,default: false })
    isVerified: boolean

    @Prop({  })
    avatar: string

    @Prop({  })
    vehicleImage: string

    @Prop()
    Cavet_f: string

    @Prop()
    Cavet_b: string

    @Prop()
    identification_card_f: string

    @Prop()
    identification_card_b: string

    @Prop({  })
    license_image_f: string

    @Prop()
    license_image_b: string

    @Prop({ })
    location: location

    @Prop({ default: Status.OFFLINE })
    status: Status

    @Prop()
    refreshToken: string
}


const DriverSchema = SchemaFactory.createForClass(Driver)



export { DriverSchema };
