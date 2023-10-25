import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {  User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UserDto } from './dto/create-user.dto';


@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async create(createUserDto: UserDto): Promise<UserDocument> {
        const createdUser = new this.userModel(createUserDto)
        return createdUser.save()
    }


    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find().exec()
    }


    async findById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id).exec()

        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)

        return user
    }

    async findByPhone(phone: string): Promise<UserDocument> {
        return this.userModel.findOne({ phone })
    }


    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument>  {
        const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec()

        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)

        return user
    }

    async remove(id: string):  Promise<UserDocument> {
        const user = await this.userModel.findByIdAndDelete(id).exec()

        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)

        return user
    }

    


}
