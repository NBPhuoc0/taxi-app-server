import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
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

  // async findByUser(id: string) {
  //   return this.orderModel.find({ user: id }).exec();
  // }

  async findByUser(uid: string, src?: string, des?: string, limit?: number, currPage?: number) {
    const pageSize = Number(limit) > 100 ? 100 : ( Number(limit) < 10 ? 10 : Number(limit) ) || 10;
    const currentPage = Number(currPage) || 1;
    const skip = limit * (currentPage - 1);

    const searchConditions = {}
    if (src) searchConditions['source_address'] = { $regex: new RegExp(src, 'i') };    
    if (des) searchConditions['destination_address'] = { $regex: new RegExp(des, 'i') };    

    const orders = await this.orderModel.find({...searchConditions}).populate({
      path: 'driver',
      select: 'fullname phone',
    })
    .limit(pageSize)
    .skip(skip)
    .exec();
    return {
      totalElements: orders.length,
      currentPage: currentPage,
      totalPage: Math.ceil(orders.length / pageSize),
      content: orders
    }
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

