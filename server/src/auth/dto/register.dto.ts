import { 
    IsEmail, 
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional
} from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsString()
    @IsOptional()
    italian_level?: string
}