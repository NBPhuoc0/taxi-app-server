import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus } from 'src/utils/enums/oderstatus.enum';
import { location } from 'src/utils/interface/location.interface';
import * as admin from 'firebase-admin';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) 
    private readonly orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  firebaseConfig = require('../../firebaseconfig.json');
  

  firebaseService = admin.initializeApp({
    credential: admin.credential.cert(this.firebaseConfig),
    databaseURL: "https://demoflutter-bff5a-default-rtdb.asia-southeast1.firebasedatabase.app"
  });

  logger = new Logger('OrdersService');

  async getObservable() {
    return this.eventEmitter;
  }

  async triggerSSEvent(data: any,id : string) {
    const result = {data: data, id_user: id}
    this.eventEmitter.emit('trigger', result);
  }

  async create(id:string,createOrderDto: CreateOrderDto) {
    const newOrder = {...createOrderDto, user: id}
    try {
      const order = new this.orderModel(newOrder);
      // this.eventEmitter.emit('order.new', order);
      // this.logger.log(order._id.toString());
      const database = this.firebaseService.database().ref("bookingRequests");
      await database.child(order._id.toString()).set(order.toJSON());
      // await database.child(key).set(order);
      return order.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  
  async cancelOrder(id: string, user: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new ConflictException('Order not found');
    if (order.user.toString() !== user) throw new ConflictException('User dont have permission to cancel this order');
    if (order.orderStatus !== OrderStatus.PENDING) throw new ConflictException('Order is not waiting');
    const database = this.firebaseService.database().ref("bookingRequests");
    await database.child(order._id.toString()).remove();
    order.orderStatus = OrderStatus.CANCEL;
    order.save();
    // this.eventEmitter.emit('order.cancel', order);
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

  async findByid_driver(id: string) {
    const driver = await this.orderModel
    .findById(id)
    .select('driver')
    .exec();
    return driver.driver;
  }

  async findByid_userOrderComplete(id: string) {
    return await this.orderModel
    .find({ user: id, orderStatus: OrderStatus.COMPLETED })
    .exec();
  }

  async findByid_driverOrderComplete(id: string) {
    return await this.orderModel
    .find({ driver: id, orderStatus: OrderStatus.COMPLETED })
    .exec();
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
      orderStatus: OrderStatus.CANCEL
    };

    const queryYesterday = {
      createdAt: {
        $gte: new Date(`${preDate}T00:00:00.000Z`),
        $lte: new Date(`${preDate}T23:59:59.999Z`),
      },
      orderStatus: OrderStatus.CANCEL
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
    const totalOrderCancelled = await this.orderModel.find({ user: userID, orderStatus: OrderStatus.CANCEL}).count().exec();
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
    const totalOrderCancelled = await this.orderModel.find({ driver: driverID, orderStatus: OrderStatus.CANCEL}).count().exec();
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

  // async remove(id: string) {
  //   return this.orderModel.findByIdAndDelete(id).exec();
  // }

  /// UPDATE ///

  getDistance(fromLat: number, fromLong: number, toLat: number, toLong: number) {
    const earthRadiusKm = 6371;
    const fromLatRad = fromLat * (Math.PI / 180);
    const fromLongRad = fromLong * (Math.PI / 180);
    const toLatRad = toLat * (Math.PI / 180);
    const toLongRad = toLong * (Math.PI / 180);
  
    const dLat = toLatRad - fromLatRad;
    const dLong = toLongRad - fromLongRad;
  
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.sin(dLong / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = earthRadiusKm * c;
  
    return distance;
  }
  
  async getNearbyBookingRequest(location: location,distance_expect: number) {
    const orders = await this.orderModel.find({ orderStatus: OrderStatus.PENDING }).exec();
    const nearbyOrders = orders.filter((value,index,array) => {
      const distance = this.getDistance(
        location.lat,
        location.long,
        value.source_location.lat,
        value.source_location.long,
      );
      return distance < (distance_expect ?? 25) ;
    });
    return nearbyOrders;
  }

  async acceptBookingRequest(orderID: string, location: location, driverID: string) {
    let result;
    const order = await this.orderModel.findById(orderID).exec();
    if (!order) throw new ConflictException('Order not found');
    if (order.orderStatus !== OrderStatus.PENDING) throw new ConflictException('Order is not waiting');
    try {
      const database = this.firebaseService.database().ref("bookingRequests");
      await database.child(order._id.toString()).remove();
      order.orderStatus = OrderStatus.INPROGRESS;
      order.driver = driverID;
      order.save();
      // this.eventEmitter.emit('order.accept', order);
      return result = 'success';
    } catch (error) {
      return result = error.message;
    }
  }

  async setCompleted(orderID: string, driverID: string) {
    let result;
    const order = await this.orderModel.findById(orderID).exec();
    if (!order) throw new ConflictException('Order not found');
    if (order.orderStatus !== OrderStatus.INPROGRESS) throw new ConflictException('Order is not in progress');
    try {
      order.orderStatus = OrderStatus.COMPLETED;
      order.save();
      // this.eventEmitter.emit('order.complete', order);
      return result;
    } catch (error) {
      return result = error.message;
    }
  }

}

