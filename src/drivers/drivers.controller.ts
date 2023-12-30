import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UploadedFile, UseGuards, Req, Sse, Logger, Query, Put } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuardD } from 'src/utils/guards/accessTokenD.guard';
import RequestWithDriver from 'src/utils/interface/requestWithDriver.interface';
import { Status } from 'src/utils/enums/driverstatus.enum';
import { OrdersService } from 'src/orders/orders.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';
import { Order, OrderDocument } from 'src/orders/schemas/order.schema';
import { filesUploadDTO } from './dto/files.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('drivers')
@ApiBearerAuth()
@ApiTags('Drivers')
@UseGuards(AccessTokenGuardD)
export class DriversController {
  twilioService: any;
  constructor(
    private readonly driversService: DriversService,
    private readonly ordersService: OrdersService,
  ) {}

  logger = new Logger('DriversController');

  @Get('userInfor')
  findById(@Req() req: RequestWithDriver) {
    // this.logger.log(req.user['sub']);
    return this.driversService.findById(req.user['sub']);
  }

  @Patch('setlocation')
  findById_location( @Req() req: RequestWithDriver, @Body() body: { lat: number, long: number }) {
    const location = {
      lat: body.lat,
      long: body.long,
    }
    return this.driversService.updateLocation(req.user['sub'], location); 
  }

  @Get('getNearbyBookingRequest')
  async getNearbyBookingRequest(@Req() req: RequestWithDriver, @Query('distance_expect') distance_expect: number ) {
    const driver = await this.driversService.findById_location(req.user['sub']);
    return this.ordersService.getNearbyBookingRequest(driver.location, distance_expect);
  }

  @Patch('acceptBookingRequest')
  async acceptBookingRequest(@Req() req: RequestWithDriver, @Body() body: { order: string}) {
    const driver = await this.driversService.findById_location(req.user['sub']);
    let result = {massage: ''};
    result.massage = await this.ordersService.acceptBookingRequest(body.order, driver.location, req.user['sub']);
    return result;
  }

  @Get('getHistory')
  async getHistory(@Req() req: RequestWithDriver) {
    return this.ordersService.findByid_driverOrderComplete(req.user['sub']);
  }

  @Patch('setCompleted')
  async setCompleted(@Req() req: RequestWithDriver, @Body() body: { order: string}) {
    let result = {massage: ''};
    result.massage = await this.ordersService.setCompleted(body.order, req.user['sub']);
    return result;
  }


  @Patch('profile')
  update(@Req() req: RequestWithDriver, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(req.user['sub'], updateDriverDto);
  }

  @Patch('status')
  update_status(@Req() req: RequestWithDriver, @Body() status: Status) {
    return this.driversService.updateStatus(req.user['sub'], status);
  }

  @Sse('wait')
  async sse(@Req() req: RequestWithDriver):Promise<Observable<MessageEvent<OrderDocument>>> {
    const eventEmitter = await this.ordersService.getObservable(); 
    return fromEvent(eventEmitter, 'trigger').pipe(
      map((data : any ) => {
        return new MessageEvent('ố dè', { data } );
      }),
    );
  }

  @Patch('image-profile')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'avatar', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 },
    { name: 'Cavet_f', maxCount: 1 },
    { name: 'Cavet_b', maxCount: 1 },
    { name: 'identification_card_f', maxCount: 1 },
    { name: 'identification_card_b', maxCount: 1 },
    { name: 'license_image_f', maxCount: 1 },
    { name: 'license_image_b', maxCount: 1 },
  ]))
  updateProfile(
    @Req() req: RequestWithDriver,
    @UploadedFiles() files?: filesUploadDTO) {
    return this.driversService.updateProfile(req.user['sub'], files);
  }
  // @Sse('wait')
  // @OnEvent('order.new')
  // async sse(@Req() req: RequestWithDriver):Promise<Observable<MessageEvent<OrderDocument>>> {
  //   const eventEmitter = await this.ordersService.getObservable(); 
  //   return fromEvent(eventEmitter, 'order.new').pipe(
  //     map((data : OrderDocument ) => {
  //       if (req.user['sub'] == data.driver) {
  //         return new MessageEvent('order.new', { data } );
  //       }
  //     }),
  //   );
  // } 

  // @Get('emit')
  // async emit(@Req() req: RequestWithDriver){
  //   const eventEmitter = await this.ordersService.getObservable(); 
  //   eventEmitter.emit('order.new', 'order');
  // }

  // @Get('order')
  // findOrder(@Req() req: RequestWithDriver) {
  //   return this.ordersService.findByDriver(req.user['sub']);
  // }

  @Post('sendSMS')
  sendSMS(@Body() body: {phone: string, message: string}) {
    try {
      return this.twilioService.client.messages.create(
        {
          body: body.message,
          from: '+12023189346',
          to: body.phone,
          // Body: "hé looo"
          // From: "+12023189346"
          // To: "+84333495017"
        },
      );
    } catch (error) {
      return error;
    }
  }

  

}
