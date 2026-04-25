import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { encrypt, decrypt } from '../common/utils/encryption.util';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private configService: ConfigService
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
        const newUser = new this.userModel(createUserDto);
        return await newUser.save()
    }

    async findOneByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec()
    }

    async findOneById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec()
    }

    async findByVerificationToken(token: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ verificationToken: token }).exec()
    }

    async verifyUser(id: string): Promise<UserDocument | null> {
        return this.userModel.findByIdAndUpdate(id, {
            isVerified: true,
            verificationToken: null
        }, { new: true }).exec()
    }

    async updateApiKey(userId: string, apiKey: string): Promise<UserDocument | null> {
        const encryptionKey = this.configService.getOrThrow<string>('ENCRYPTION_KEY');
        const encryptedKey = encrypt(apiKey, encryptionKey);

        return this.userModel.findByIdAndUpdate(userId, {
            geminiApiKey: encryptedKey
        }, { new: true }).exec()
    }

    async incrementFallbackCount(userId: string): Promise<UserDocument | null> {
        return this.userModel.findByIdAndUpdate(userId, {
            $inc: { fallbackCount: 1 }
        }, { new: true }).exec()
    }

    decryptApiKey(encryptedKey: string): string {
        const encryptionKey = this.configService.getOrThrow<string>('ENCRYPTION_KEY');
        return decrypt(encryptedKey, encryptionKey);
    }
    }

