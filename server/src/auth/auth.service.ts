import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signup(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findOneByEmail(registerDto.email);
        if(existingUser) {
            throw new ConflictException('Email already in use')
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(registerDto.password, salt);

        const user = await this.usersService.createUser({
            name: registerDto.name,
            email: registerDto.email,
            password: hashPassword,
            italian_level: registerDto.italian_level || 'A1',
        })

        const payload = { name: user.name, email: user.email, sub: user._id}

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findOneByEmail(loginDto.email)
        if(!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.password)
        if(!isMatch) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const payload = { name: user.name, email: user.email, sub: user._id}
        return { access_token: this.jwtService.sign(payload) }
    }
}
