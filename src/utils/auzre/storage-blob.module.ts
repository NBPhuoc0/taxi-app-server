import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AzureStorageService } from './storage-blob.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [AzureStorageService],
  exports: [AzureStorageService],
})
export class AzureStorageModule {}
