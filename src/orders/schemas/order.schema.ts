import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { OrderStatus } from "../../utils/enums/oderstatus.enum";
import { location } from "../../utils/interface/location.interface";
import { Vehicle } from "src/utils/enums/vehicle.enum";

export type OrderDocument = Order & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Order {
    @Prop({ default: OrderStatus.PENDING })
    orderStatus: OrderStatus

    @Prop({ default: Vehicle.BIKE })
    vehicle_type: Vehicle

    @Prop({ required: true })
    orderTotal: number

    @Prop({ required: true })
    source_address: string

    @Prop({})
    source_location: location

    @Prop({ required: true })
    destination_address: string

    @Prop({})
    destination_location: location

    @Prop({})
    distance: number;

    @Prop({})
    duration: number;

    @Prop({ref: 'Driver'})
    driver: string

    @Prop({ref: 'User'})
    user: string
}


const OrderSchema = SchemaFactory.createForClass(Order)



export { OrderSchema };
