import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UploadedFile, UseGuards, Req, Sse, Logger } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuardD } from 'src/utils/guards/accessTokenD.guard';
import RequestWithDriver from 'src/utils/interface/requestWithDriver.interface';
import { location } from 'src/utils/interface/location.interface';
import { Status } from 'src/utils/enums/driverstatus.enum';
import { OrdersService } from 'src/orders/orders.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';
import { Order, OrderDocument } from 'src/orders/schemas/order.schema';

@Controller('drivers')
@ApiBearerAuth()
@ApiTags('Drivers')
@UseGuards(AccessTokenGuardD)
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly ordersService: OrdersService,
  ) {}

  logger = new Logger('DriversController');

  @Get()
  findById(@Req() req: RequestWithDriver) {
    this.logger.log(req.user['sub']);
  }

  @Get('location')
  findById_location( @Req() req: RequestWithDriver) {
    return this.driversService.findById_location(req.user['sub']);
  }

  @Patch('profile')
  update(@Req() req: RequestWithDriver, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(req.user['sub'], updateDriverDto);
  }

  @Patch('location')
  update_location(@Req() req: RequestWithDriver, @Body() location: location) {
    return this.driversService.updateLocation(req.user['sub'], location);
  }

  @Patch('status')
  update_status(@Req() req: RequestWithDriver, @Body() status: Status) {
    return this.driversService.updateStatus(req.user['sub'], status);
  }

  @Sse('wait')
  @OnEvent('order.new')
  async sse(@Req() req: RequestWithDriver):Promise<Observable<MessageEvent<OrderDocument>>> {
    const eventEmitter = await this.ordersService.getObservable(); 
    return fromEvent(eventEmitter, 'order.new').pipe(
      map((data : OrderDocument ) => {
        if (req.user['sub'] == data.driver) {
          return new MessageEvent('order.new', { data } );
        }
      }),
    );
  } 

  @Get('emit')
  async emit(@Req() req: RequestWithDriver){
    const eventEmitter = await this.ordersService.getObservable(); 
    eventEmitter.emit('order.new', 'order');
  }

  @Get('order')
  findOrder(@Req() req: RequestWithDriver) {
    return this.ordersService.findByDriver(req.user['sub']);
  }

}
