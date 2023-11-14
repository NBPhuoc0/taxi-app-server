import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UserDto } from './dto/create-user.dto';
import { AzureStorageService } from 'src/utils/auzre/storage-blob.service';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) 
        private userModel: Model<UserDocument>,
        private azureStorage: AzureStorageService
    ) {}

    logger = new Logger('UsersService');



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

    async findById_location(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id).select('location').exec()

        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)

        return user
    }

    async findByPhone(phone: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ phone }).exec()

        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)

        return user
        
    }


    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument>  {
        const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec()

        return user
    }
    
    async updateAvatar(id: string, file: Express.Multer.File): Promise<UserDocument>  {
        if (!file) throw new HttpException('File not found', HttpStatus.BAD_REQUEST)

        try {
            const avatarURL = await this.azureStorage.uploadFile(file, 'image', id)
            const user = await this.userModel.findByIdAndUpdate( id , { avatar: avatarURL }).exec()
            return user
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async updateLocation(id: string, location: { lat: number, long: number }): Promise<UserDocument>  {
        const user = await this.userModel.findByIdAndUpdate(id, {location : location}, { new: true }).exec()

        return user
    }

    async remove(id: string):  Promise<UserDocument> {
        const user = await this.userModel.findByIdAndDelete(id).exec()

        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)

        return user
    }

}
