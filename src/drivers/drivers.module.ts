import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DriverSchema } from './schemas/driver.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AzureStorageModule } from '../utils/auzre/storage-blob.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Driver',schema: DriverSchema, },
    ]),
    OrdersModule,
    AzureStorageModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService]
})
export class DriversModule {}
