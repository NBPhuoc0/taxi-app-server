import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schema/admin.schema';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    private adminModel: Model<AdminDocument>,
  ) {}

  logger = new Logger('AdminService');

  async create(createAdminDto: CreateAdminDto) {
    const admin = new this.adminModel(createAdminDto);
    return await admin.save();
    }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminModel.findByIdAndUpdate(id, updateAdminDto, { new: true }).exec();
    return admin;
  }

  async findByUsername(username: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findOne({ username }).exec();
    return admin;
  }

  async findById(id: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findById(id).exec();
    return admin;
  }
}
