import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Driver, DriverDocument } from './schemas/driver.schema';
import { Model } from 'mongoose';
import { AzureStorageService } from '../utils/auzre/storage-blob.service';
import { location } from '../utils/interface/location.interface';
import {  filesUploadDTO } from './dto/files.dto';
import { Status } from 'src/utils/enums/driverstatus.enum';
import { FilterUserDto } from 'src/users/dto/filter-user.dto';

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

  async updateProfile(createDriverDto: CreateDriverDto, files: filesUploadDTO) {
    try {
      const newDriver = await new this.driverModel(createDriverDto);

      const avatarURL = await this.azureStorage.uploadFile(files.avatar[0], 'driveravatar', newDriver._id);
      const vehicleImageURL = await this.azureStorage.uploadFile(files.vehicleImage[0], 'vehicleimage', newDriver._id);
      const Cavet_fURL = await this.azureStorage.uploadFile(files.Cavet_f[0], 'cavetf', newDriver._id);
      const Cavet_bURL = await this.azureStorage.uploadFile(files.Cavet_b[0], 'cavetb', newDriver._id);
      const identification_card_fURL = await this.azureStorage.uploadFile(files.identification_card_f[0], 'identificationcardf', newDriver._id);
      const identification_card_bURL = await this.azureStorage.uploadFile(files.identification_card_b[0], 'identificationcardb', newDriver._id);
      const license_image_fURL = await this.azureStorage.uploadFile(files.license_image_f[0], 'licenseimagef', newDriver._id);
      const license_image_bURL = await this.azureStorage.uploadFile(files.license_image_b[0], 'licenseimageb', newDriver._id);

      newDriver.avatar = avatarURL; 
      newDriver.vehicleImage = vehicleImageURL;
      newDriver.Cavet_f = Cavet_fURL;
      newDriver.Cavet_b = Cavet_bURL;
      newDriver.identification_card_f = identification_card_fURL;
      newDriver.identification_card_b = identification_card_bURL;
      newDriver.license_image_f = license_image_fURL;
      newDriver.license_image_b = license_image_bURL;
      
      return await newDriver.save();
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

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<DriverDocument> {
    const driver = await this.driverModel.findByIdAndUpdate(id, updateDriverDto, { new: true }).exec()

    return driver
  }

  async updateLocation(id: string, location: location): Promise<DriverDocument> {
    const driver = await this.driverModel.findByIdAndUpdate(id, { location: location }, { new: true }).exec()

    return driver
  }

  async findById_location(id: string) {
    const driver = await this.driverModel.findById(id).exec()
    let result = (({ id, fullname, phone, location }) => ({ id, fullname, phone, location }))(driver);
    return result
  }

  async verify(id: string,status : boolean): Promise<DriverDocument> {
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

    const newDriver = await this.driverModel.findByIdAndUpdate(id, { rate: newRate, totalRate: totalRate, totalRateCount: totalRateCount }, { new: true }).exec()

    return newDriver
  }

  async driverRate(id: string) {
    const driver = await this.driverModel.findById(id).select('rate').exec()
    return driver.rate
  }
}
