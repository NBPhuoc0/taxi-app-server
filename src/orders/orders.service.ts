import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus } from 'src/utils/enums/oderstatus.enum';

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

  async createByAdmin(id:string, createOrderDto: CreateOrderDto) {
    const newOrder = {...createOrderDto, user: id}
    const order = new this.orderModel(newOrder);
    return order.save();
  }

  async findByid(id: string) {
    return await this.orderModel.findById(id).populate({
      path: 'user driver',
      select: 'fullname phone avatar vehicleImage',
    }).exec();
  }

  async getOrderPercentageChange (userID: string, driverID: string, currDate: string, preDate: string){
    const queryToday = {
      createdAt: {
        $gte: new Date(`${currDate}T00:00:00.000Z`),
        $lte: new Date(`${currDate}T23:59:59.999Z`),
      }
    };

    const queryYesterday = {
      createdAt: {
        $gte: new Date(`${preDate}T00:00:00.000Z`),
        $lte: new Date(`${preDate}T23:59:59.999Z`),
      }
    };

    if (userID !== '') {
      queryToday['user'] = userID;
      queryYesterday['user'] = userID;
    }
    else if(driverID !== ''){
      queryToday['driver'] = driverID;
      queryYesterday['driver'] = driverID;
    }

    const totalOrdersToday = await this.orderModel.find(queryToday).count().exec();
    const totalOrdersYesterday = await this.orderModel.find(queryYesterday).count().exec();

    return totalOrdersYesterday === 0 ? (totalOrdersToday === 0 ? 0 : 100) : parseFloat((((totalOrdersToday - totalOrdersYesterday) / totalOrdersYesterday) * 100).toFixed(2));
  }
  
  async getEarningPercentageChange(userID: string, driverID: string, currDate: string, preDate: string){
    const queryToday = {
      createdAt: {
        $gte: new Date(`${currDate}T00:00:00.000Z`),
        $lte: new Date(`${currDate}T23:59:59.999Z`),
      }
    };

    const queryYesterday = {
      createdAt: {
        $gte: new Date(`${preDate}T00:00:00.000Z`),
        $lte: new Date(`${preDate}T23:59:59.999Z`),
      }
    };

    if (userID !== '') {
      queryToday['user'] = userID;
      queryYesterday['user'] = userID;
    }
    else if(driverID !== ''){
      queryToday['driver'] = driverID;
      queryYesterday['driver'] = driverID;
    }

    const totalEarningToday = await this.orderModel.aggregate([
      { $match: queryToday 
      },
      { $group: {
          _id: null,
          total: { $sum: '$orderTotal' }
        }
      }
    ]).exec();

    const totalEarningYesterday = await this.orderModel.aggregate([
      { $match: queryYesterday
      },
      { $group: {
          _id: null,
          total: { $sum: '$orderTotal' }
        }
      }
    ]).exec();

    const earningToday = totalEarningToday.length > 0 ? totalEarningToday[0].total : 0;
    const earningYesterday = totalEarningYesterday.length > 0 ? totalEarningYesterday[0].total : 0;
    const earningPercentageChange = earningYesterday === 0 ? (earningToday === 0 ? 0 : 100 ) : parseFloat((((earningToday - earningYesterday)/earningYesterday)*100).toFixed(2))
    return earningPercentageChange;
  }

  async getCancelledPercentageChange(userID: string, driverID: string, currDate: string, preDate: string){
    const queryToday = {
      createdAt: {
        $gte: new Date(`${currDate}T00:00:00.000Z`),
        $lte: new Date(`${currDate}T23:59:59.999Z`),
      },
      orderStatus: OrderStatus.CANCELLED
    };

    const queryYesterday = {
      createdAt: {
        $gte: new Date(`${preDate}T00:00:00.000Z`),
        $lte: new Date(`${preDate}T23:59:59.999Z`),
      },
      orderStatus: OrderStatus.CANCELLED
    };

    if (userID !== '') {
      queryToday['user'] = userID;
      queryYesterday['user'] = userID;
    }
    else if(driverID !== ''){
      queryToday['driver'] = driverID;
      queryYesterday['driver'] = driverID;
    }

    const totalOrderCancelledToday = await this.orderModel.find(queryToday).count().exec();
    const totalOrderCancelledgYesterday = await this.orderModel.find(queryYesterday).count().exec();

    return totalOrderCancelledgYesterday === 0 ? (totalOrderCancelledToday === 0 ? 0 : 100) : parseFloat((((totalOrderCancelledToday - totalOrderCancelledgYesterday)/totalOrderCancelledgYesterday)*100).toFixed(2));
  }

  async getToTalEarningByID(userID: string, driverID: string){
    const query = userID === '' ? {driver: driverID} : {user: userID};
    const totalEarning = await this.orderModel.aggregate([
      { $match: query },
      { $group: {
          _id: null,
          total: { $sum: '$orderTotal' }
        }
      }
    ]).exec();
    return totalEarning;
  }

  async statisticsByUser(userID: string){
    const date = new Date();
    date.setDate(new Date().getDate()-1);
    const currDate = new Date().toISOString().slice(0,10);
    const preDate = date.toISOString().slice(0,10)

    const orders = await this.orderModel.find({ user: userID }).count().exec();
    const totalEarning = await this.getToTalEarningByID(userID, '');
    const totalOrderCancelled = await this.orderModel.find({ user: userID, orderStatus: OrderStatus.CANCELLED}).count().exec();
    const orderPercentageChange = await this.getOrderPercentageChange(userID, '', currDate, preDate);
    const earningPercentageChange  = await this.getEarningPercentageChange(userID, '', currDate, preDate);
    const cancelledPercentageChange = await this.getCancelledPercentageChange(userID, '', currDate, preDate);
    return{
      totalOrder: orders,
      orderPercentageChange: orderPercentageChange,
      totalEarning: totalEarning.length > 0 ? totalEarning[0].total : 0,
      earningPercentageChange: earningPercentageChange,
      totalOrderCancelled: totalOrderCancelled,
      cancelledPercentageChange: cancelledPercentageChange,
    }
  }

  async statisticsByDriver(driverID: string){
    const date = new Date();
    date.setDate(new Date().getDate()-1);
    const currDate = new Date().toISOString().slice(0,10);
    const preDate = date.toISOString().slice(0,10)

    const orders = await this.orderModel.find({ driver: driverID }).count().exec();
    const totalEarning = await this.getToTalEarningByID('',driverID);
    const totalOrderCancelled = await this.orderModel.find({ driver: driverID, orderStatus: OrderStatus.CANCELLED}).count().exec();
    const orderPercentageChange = await this.getOrderPercentageChange('', driverID, currDate, preDate);
    const earningPercentageChange  = await this.getEarningPercentageChange('', driverID, currDate, preDate);
    const cancelledPercentageChange = await this.getCancelledPercentageChange('', driverID, currDate, preDate);
    return{
      totalOrder: orders,
      orderPercentageChange: orderPercentageChange,
      totalEarning: totalEarning.length > 0 ? totalEarning[0].total : 0,
      earningPercentageChange: earningPercentageChange,
      totalOrderCancelled: totalOrderCancelled,
      cancelledPercentageChange: cancelledPercentageChange,
    }
  }

  async findByUser(uid: string, src?: string, des?: string, limit?: number, currPage?: number) {
    const pageSize = Number(limit) > 100 ? 100 : ( Number(limit) < 10 ? 10 : Number(limit) ) || 10;
    const currentPage = Number(currPage) || 1;
    const skip = limit * (currentPage - 1);

    const searchConditions = {user: uid}
    if (src) searchConditions['source_address'] = { $regex: new RegExp(src, 'i') };    
    if (des) searchConditions['destination_address'] = { $regex: new RegExp(des, 'i') };    

    const totalElements = await this.orderModel.find({ user:uid }).count().exec();
    const orders = await this.orderModel.find({...searchConditions}).populate({
      path: 'driver',
      select: 'fullname phone avatar',
    })
    .limit(pageSize)
    .skip(skip)
    .exec();
    return {
      totalElements: totalElements,
      currentPage: currentPage,
      totalPage: Math.ceil(totalElements / pageSize),
      content: orders
    }
  }

  async findByDriver(id: string, src?: string, des?: string, limit?: number, currPage?: number) {
    const pageSize = Number(limit) > 100 ? 100 : ( Number(limit) < 10 ? 10 : Number(limit) ) || 10;
    const currentPage = Number(currPage) || 1;
    const skip = limit * (currentPage - 1);

    const searchConditions = {driver: id}
    if (src) searchConditions['source_address'] = { $regex: new RegExp(src, 'i') };    
    if (des) searchConditions['destination_address'] = { $regex: new RegExp(des, 'i') };    

    const totalElements = await this.orderModel.find({ driver: id }).count().exec();
    const orders = await this.orderModel.find({...searchConditions}).populate({
      path: 'user',
      select: 'fullname phone avatar',
    })
    .limit(pageSize)
    .skip(skip)
    .exec();
    return {
      totalElements: totalElements,
      currentPage: currentPage,
      totalPage: Math.ceil(totalElements / pageSize),
      content: orders
    }
  }

  async findOrders(src?: string, des?: string, orderStatus?: string, limit?: number, currPage?: number) {
    const pageSize = Number(limit) > 100 ? 100 : ( Number(limit) < 10 ? 10 : Number(limit) ) || 10;
    const currentPage = Number(currPage) || 1;
    const skip = limit * (currentPage - 1);
    const searchConditions = {}
    if (orderStatus) searchConditions['orderStatus'] = { $regex: new RegExp(orderStatus, 'i') }; 
    if (src) searchConditions['source_address'] = { $regex: new RegExp(src, 'i') };    
    if (des) searchConditions['destination_address'] = { $regex: new RegExp(des, 'i') };   

    const totalElements = await this.orderModel.find({...searchConditions}).count().exec();
    const orders = await this.orderModel.find({...searchConditions}).populate({
      path: 'user driver',
      select: 'fullname phone avatar'
    }).limit(pageSize).skip(skip).exec();
    return {
      totalElements: totalElements,
      currentPage: currentPage,
      totalPage: Math.ceil(totalElements / pageSize),
      content: orders
    }
  }

  async findAll() {
    return this.orderModel.find().exec();
  }

  async remove(id: string) {
    return this.orderModel.findByIdAndDelete(id).exec();
  }
}

