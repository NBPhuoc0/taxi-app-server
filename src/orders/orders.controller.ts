import { Controller, Get, Post, Body, Patch, Param, Delete, Sse, Logger, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable, from, fromEvent, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { format } from 'date-fns';
@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private configService: ConfigService) {

  }
  logger = new Logger('OrdersController');

  @Post('create_payment_url')
  createPayment_URL(@Req() req ,@Body() body: { amount: number, bankCode: string, language: string }){
    const date = new Date();
    const createDate = format(date, 'yyyyMMddHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

    let tmnCode = this.configService.get('VNP_TMNCODE');
    let secretKey = this.configService.get('VNP_HASHSECRET');
    let vnpUrl = this.configService.get('VNP_URL');
    let returnUrl = this.configService.get('VNP_RETURN_URL');
    let orderId = format(date, 'ddHHmmss');
    let amount = body.amount;
    let bankCode = body.bankCode;

    let locale = body.language;
    if(locale === null || locale === ''){
        locale = 'vn';
    }

    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount*100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = this.ordersService.sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    return {
      error: false,
      url: vnpUrl,
    }
  }
  
  @Sse('sse')
  async sse():Promise<Observable<MessageEvent<string>>> {
    this.logger.log('sse connected');
    const eventEmitter = await this.ordersService.getObservable(); 
    return fromEvent(eventEmitter, 'trigger').pipe(
      map((data : any ) => {
        this.logger.log('sse trigger!!!!');
        return new MessageEvent('ố dè', { data } );
      }),
    );
  }
}
