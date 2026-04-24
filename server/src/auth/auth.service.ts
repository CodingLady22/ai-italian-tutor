import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService
    ) {}

    async signup(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findOneByEmail(registerDto.email);
        if(existingUser) {
            throw new ConflictException('Email already in use')
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(registerDto.password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await this.usersService.createUser({
            name: registerDto.name,
            email: registerDto.email,
            password: hashPassword,
            italian_level: registerDto.italian_level || 'A1',
            verificationToken
        })

        await this.emailService.sendVerificationEmail(user.email, verificationToken);

        return {
            message: 'Registration successful. Please check your email to verify your account.',
            user: {
                _id: user._id,
                email: user.email,
                name: user.name.split(' ')[0],
                italian_level: user.italian_level,
                hasApiKey: !!user.geminiApiKey
            }
        };
    }

    async verifyEmail(token: string) {
        const user = await this.usersService.findByVerificationToken(token);
        if (!user) {
          throw new BadRequestException('Invalid or expired verification token');
        }
    
        await this.usersService.verifyUser(user._id as string);
        return { message: 'Email verified successfully. You can now log in.' };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findOneByEmail(loginDto.email)
        if(!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email address before logging in')
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.password)
        if(!isMatch) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const payload = { name: user.name, email: user.email, sub: user._id}
        return { 
            access_token: this.jwtService.sign(payload), 
            
            user: {
                _id: user._id,
                email: user.email,
                name: user.name.split(' ')[0],
                italian_level: user.italian_level,
                hasApiKey: !!user.geminiApiKey
            }
        }
    }
}
