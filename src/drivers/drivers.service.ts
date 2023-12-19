import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Driver, DriverDocument } from './schemas/driver.schema';
import mongoose, { Model, Types } from 'mongoose';
import { AzureStorageService } from '../utils/auzre/storage-blob.service';
import { location } from '../utils/interface/location.interface';
import {  filesUploadDTO } from './dto/files.dto';
import { Status } from 'src/utils/enums/driverstatus.enum';
import { FilterUserDto } from 'src/users/dto/filter-user.dto';
import { log } from 'console';

@Injectable()
export class DriversService {
  constructor(
    @InjectModel(Driver.name) 
    private driverModel: Model<DriverDocument>,
    private azureStorage: AzureStorageService
  ) {}

  logger = new Logger('DriversService');

  async findDrivers(query: FilterUserDto) {
    const limit = Number(query.limit) > 100 ? 100 : ( Number(query.limit) < 10 ? 10 : Number(query.limit) ) || 10;
    const currentPage = Number(query.page) || 1;
    const skip = limit * (currentPage - 1);

    const searchConditions = {}
    if (query.fullname) searchConditions['fullname'] = { $regex: new RegExp(query.fullname, 'i') };    
    if (query.phone) searchConditions['phone'] = { $regex: new RegExp(query.phone, 'i') };   

    const users = await this.driverModel
        .find({ ...searchConditions })
        .limit(limit)
        .skip(skip);

    return {
        totalElements: users.length,
        currentPage: currentPage,
        totalPage: Math.ceil(users.length / limit),
        content: users
    };
  }

  async create(createDriverDto: CreateDriverDto):Promise<DriverDocument> {
    try {
      return await new this.driverModel({ ...createDriverDto }).save();
    } catch (error) {
      throw new BadRequestException('Create driver account failed')
    }
  }

  async updateProfile(id: string, files?: filesUploadDTO) {
    try {
      let driver = await this.driverModel.findById(id)
      if(files?.avatar){
        const avatarURL = await this.azureStorage.uploadFile(files.avatar[0], 'driveravatar', driver._id);
        driver.avatar = avatarURL; 
      }
      if(files?.vehicleImage){
        const vehicleImageURL = await this.azureStorage.uploadFile(files.vehicleImage[0], 'vehicleimage', driver._id);
        driver.vehicleImage = vehicleImageURL;
      }
      if(files?.Cavet_f){
        const Cavet_fURL = await this.azureStorage.uploadFile(files.Cavet_f[0], 'cavetf', driver._id);
        driver.Cavet_f = Cavet_fURL;
      }
      if(files?.Cavet_b){
        const Cavet_bURL = await this.azureStorage.uploadFile(files.Cavet_b[0], 'cavetb', driver._id);
        driver.Cavet_b = Cavet_bURL;
      }
      if(files?.identification_card_f){
        const identification_card_fURL = await this.azureStorage.uploadFile(files.identification_card_f[0], 'identificationcardf', driver._id);
        driver.identification_card_f = identification_card_fURL;
      }
      if(files?.identification_card_b){
        const identification_card_bURL = await this.azureStorage.uploadFile(files.identification_card_b[0], 'identificationcardb', driver._id);
        driver.identification_card_b = identification_card_bURL;
      }
      if(files?.license_image_f){
        const license_image_fURL = await this.azureStorage.uploadFile(files.license_image_f[0], 'licenseimagef', driver._id);
        driver.license_image_f = license_image_fURL;
      }
      if(files?.license_image_b){
        const license_image_bURL = await this.azureStorage.uploadFile(files.license_image_b[0], 'licenseimageb', driver._id);
        driver.license_image_b = license_image_bURL;
      }
      return driver.save();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  async findByPhone(phone: string): Promise<DriverDocument> {
    const driver = this.driverModel.findOne({ phone:phone }).exec()

    return driver
  }

  async findById(id: string): Promise<DriverDocument> {
    const driver = this.driverModel.findById(id).exec()

    return driver
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    let result;
    try {
      await this.driverModel.findByIdAndUpdate(id, updateDriverDto, { new: true }).exec()
      return result = "success";
    } catch (error) {
      return result = error.message;
    }
  }

  async updateLocation(id: string, location: location) {
    let result;
    try {
      const driver = await this.driverModel.findByIdAndUpdate(id, { location: location},{new: true} ).exec()
      return driver.location;
    } catch (error) {
      return result = error.message;
    }
  }

  async findById_location(id: string) {
    const driver = await this.driverModel.findById(id).exec()
    let result = (({ id, fullname, phone, location }) => ({ id, fullname, phone, location }))(driver);
    return result
  }

  async verify(id: string, status: boolean): Promise<DriverDocument>{
    const driver = await this.driverModel.findByIdAndUpdate(id, { isVerified: status}, { new: true }).exec()
    
    return driver
  }

  async updateStatus(id: string, status: Status): Promise<DriverDocument> {
    const driver = await this.driverModel.findByIdAndUpdate(id, { status: status}, { new: true }).exec()
    
    return driver
  }
  
  async remove(id: string): Promise<DriverDocument> {
    const driver = await this.driverModel.findByIdAndDelete(id).exec()

    if (!driver) throw new HttpException('Driver not found', HttpStatus.NOT_FOUND)

    return driver
  }

  async rateDriver(id: string, rate: number) {
    const driver = await this.driverModel.findById(id).exec()

    const totalRate = driver.totalRate + rate;
    const totalRateCount = driver.totalRateCount + 1;
    const newRate = totalRate / totalRateCount;

    await this.driverModel.findByIdAndUpdate(id, { rate: newRate, totalRate: totalRate, totalRateCount: totalRateCount }, { new: true }).exec()

    return 
  }

  async driverRate(id: string) {
    await this.driverModel.findById(id).select('rate').exec()
    return 
  }
}
