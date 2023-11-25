import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) 
    private readonly orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
  ) {
  }

  async getObservable() {
    return this.eventEmitter;
  }

  async create(id:string,createOrderDto: CreateOrderDto) {
    const newOrder = {...createOrderDto, user: id}
    const order = new this.orderModel(newOrder);
    this.eventEmitter.emit('order.new', order);
    return order;
  }

  async findByid(id: string) {
    return this.orderModel.findById(id).exec();
  }

  async findByUser(id: string) {
    return this.orderModel.find({ user: id }).exec();
  }

  async findByDriver(id: string) {
    return this.orderModel.find({ driver: id }).exec();
  }

  async findAll() {
    return this.orderModel.find().exec();
  }

  async remove(id: string) {
    return this.orderModel.findByIdAndDelete(id).exec();
  }
}

