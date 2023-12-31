import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AzureStorageModule } from '../utils/auzre/storage-blob.module';
import { OrdersModule } from 'src/orders/orders.module';
import { DriversModule } from 'src/drivers/drivers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User',schema: UserSchema, },
    ]),
    OrdersModule,
    DriversModule,
    AzureStorageModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
