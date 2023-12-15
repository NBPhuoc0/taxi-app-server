import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus } from 'src/utils/enums/oderstatus.enum';
import { location } from 'src/utils/interface/location.interface';

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
    // this.eventEmitter.emit('order.new', order);
    return order.save();
  }
  
  async cancelOrder(id: string, user: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new ConflictException('Order not found');
    if (order.user.toString() !== user) throw new ConflictException('User dont have permission to cancel this order');
    if (order.orderStatus !== OrderStatus.PENDING) throw new ConflictException('Order is not waiting');
    order.orderStatus = OrderStatus.CANCEL;
    order.save();
    // this.eventEmitter.emit('order.cancel', order);
    return order;
  }


  async createByAdmin(createOrderDto: CreateOrderDto) {
    const newOrder = {...createOrderDto}
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

  async getOrderPercentageChange ( currDate?: string, preDate?: string, userID?: string, driverID?: string ){
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

    if (userID !== '' && userID) {
      queryToday['user'] = userID;
      queryYesterday['user'] = userID;
    }
    else if(driverID !== '' && driverID){
      queryToday['driver'] = driverID;
      queryYesterday['driver'] = driverID;
    }

    const totalOrdersToday = await this.orderModel.find(queryToday).count().exec();
    const totalOrdersYesterday = await this.orderModel.find(queryYesterday).count().exec();

    return totalOrdersYesterday === 0 ? (totalOrdersToday === 0 ? 0 : 100) : parseFloat((((totalOrdersToday - totalOrdersYesterday) / totalOrdersYesterday) * 100).toFixed(2));
  }
  
  async getEarningPercentageChange(currDate?: string, preDate?: string, userID?: string, driverID?: string){
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

    if (userID !== '' && userID) {
      queryToday['user'] = userID;
      queryYesterday['user'] = userID;
    }
    else if(driverID !== '' && driverID){
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

  async getCancelledPercentageChange( currDate?: string, preDate?: string, userID?: string, driverID?: string ){
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

    if (userID !== '' && userID) {
      queryToday['user'] = userID;
      queryYesterday['user'] = userID;
    }
    else if(driverID !== '' && driverID){
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

  async ordersByTime(year?: string, month?: string){
    const y = year ?? new Date().getFullYear();
    const m = month ?? new Date().getMonth() + 1;
    let mStart, dStart;
    let mEnd, dEnd;
    let formatDate;

    if(month){
      mStart = mEnd = m;
      dStart = 1;
      dEnd = 31;
      formatDate = '%Y-%m-%d';
    }
    else{
      mStart = 1;
      mEnd = 12;
      dStart = 1;
      dEnd = 31;
      formatDate = '%Y-%m';
    }
    const ordersByTime = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${y}-${mStart}-${dStart}T00:00:00.000Z`),
            $lt: new Date(`${y}-${mEnd}-${dEnd}T23:59:59.999Z`)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: formatDate, date: '$createdAt' } },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id', 
          total: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]).exec()
    return ordersByTime;
  }

  async statisticsByUser(userID: string){
    const date = new Date();
    date.setDate(new Date().getDate()-1);
    const currDate = new Date().toISOString().slice(0,10);
    const preDate = date.toISOString().slice(0,10)

    const orders = await this.orderModel.find({ user: userID }).count().exec();
    const totalEarning = await this.getToTalEarningByID(userID, '');
    const totalOrderCancelled = await this.orderModel.find({ user: userID, orderStatus: OrderStatus.CANCEL}).count().exec();
    const orderPercentageChange = await this.getOrderPercentageChange(currDate, preDate, userID, '');
    const earningPercentageChange  = await this.getEarningPercentageChange(currDate, preDate, userID, '');
    const cancelledPercentageChange = await this.getCancelledPercentageChange( currDate, preDate, userID, '' );
    return{
      totalOrder: orders,
      orderPercentageChange: orderPercentageChange,
      totalEarning: totalEarning && totalEarning.length > 0 ? totalEarning[0].total : 0,
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
    const orderPercentageChange = await this.getOrderPercentageChange( currDate, preDate, '', driverID );
    const earningPercentageChange  = await this.getEarningPercentageChange( currDate, preDate, '', driverID );
    const cancelledPercentageChange = await this.getCancelledPercentageChange( currDate, preDate, '', driverID );
    return{
      totalOrder: orders,
      orderPercentageChange: orderPercentageChange,
      totalEarning: totalEarning[0].total ?? 0,
      earningPercentageChange: earningPercentageChange,
      totalOrderCancelled: totalOrderCancelled,
      cancelledPercentageChange: cancelledPercentageChange,
    }
  }

  async statisticsByAdmin(){
    const date = new Date();
    date.setDate(new Date().getDate()-1);
    const currDate = new Date().toISOString().slice(0,10);
    const preDate = date.toISOString().slice(0,10)

    const totalOrders = await this.orderModel.find().count().exec();
    const totalOrderCancelled = await this.orderModel.find({ orderStatus: OrderStatus.CANCEL }).count().exec();
    const totalEarning = await this.orderModel.aggregate([
      { $group: {
          _id: null,
          total: { $sum: '$orderTotal' }
        }
      }
    ]).exec();

    const orderPercentageChange = await this.getOrderPercentageChange(currDate, preDate);
    const earningPercentageChange = await this.getEarningPercentageChange(currDate, preDate);
    const cancelledPercentageChange = await this.getCancelledPercentageChange(currDate, preDate);
    const percentOrderCompleted = await this.findOrdersCompleted();

    return {
      totalOrder: totalOrders,
      orderPercentageChange: orderPercentageChange,
      totalEarning: totalEarning[0].total ?? 0,
      earningPercentageChange: earningPercentageChange,
      totalOrderCancelled: totalOrderCancelled,
      cancelledPercentageChange: cancelledPercentageChange,
      percentOrderCompleted: percentOrderCompleted
    };
  }

  async findOrderInProgress(){
    const orderAvailable = await this.orderModel.find({
      orderStatus: { $nin: [OrderStatus.COMPLETED, OrderStatus.CANCEL] },
    },{
      source_location: 1,
      destination_location: 1,
    }
    ).exec();
    return orderAvailable;
  }

  async findTopDrivers(){
    const drivers = await this.orderModel.aggregate([
      {
        $addFields: {
          driverObjectId: { $toObjectId: "$driver" }
        }
      },
      {
        $lookup:
          {
            from: "drivers",
            localField: "driverObjectId",
            foreignField: "_id",
            as: "driver_info"
          }
      },
      { $unwind: "$driver_info" },
      {
        $group: {
          _id: '$driver_info._id',
          fullname: { $first: '$driver_info.fullname' },
          phone: { $first: '$driver_info.phone' },
          avatar: { $first: '$driver_info.avatar' },
          total: { $sum: '$orderTotal' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }, 
      {
        $project: {
          id: '$_id',
          fullname: 1,
          phone: 1,
          avatar: 1,
          total: 1,
          _id: 0
        },
      },
    ]);
    return drivers;
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

  async findOrdersCompleted(){
    const ordersCompleted = await this.orderModel.find({
      orderStatus: OrderStatus.COMPLETED
    }).count().exec();
    const orders = await this.orderModel.find().count().exec();
    return parseFloat(((ordersCompleted/orders)*100).toFixed(2))
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
    const nearbyOrders = orders.filter((order) => {
      const distance = this.getDistance(
        location.lat,
        location.long,
        order.source_location.lat,
        order.source_location.long,
      );
      return distance <= distance_expect ?? 25;
    });
    return nearbyOrders;
  }

  async acceptBookingRequest(orderID: string, location: location, driverID: string) {
    const order = await this.orderModel.findById(orderID).exec();
    if (!order) throw new ConflictException('Order not found');
    if (order.orderStatus !== OrderStatus.PENDING) throw new ConflictException('Order is not waiting');
    order.orderStatus = OrderStatus.INPROGRESS;
    order.driver = driverID;
    order.save();
    // this.eventEmitter.emit('order.accept', order);
    return order;
  }

  async setCompleted(orderID: string, driverID: string) {
    const order = await this.orderModel.findById(orderID).exec();
    if (!order) throw new ConflictException('Order not found');
    if (order.orderStatus !== OrderStatus.INPROGRESS) throw new ConflictException('Order is not in progress');
    order.orderStatus = OrderStatus.COMPLETED;
    order.save();
    // this.eventEmitter.emit('order.complete', order);
    return order;
  }

}

