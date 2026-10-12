import { 
    IsEmail, 
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsIn
} from "class-validator";
import { Transform } from "class-transformer";
import {
    ITALIAN_LEVELS,
    SUPPORT_LANGUAGES,
    MAX_NAME_LENGTH,
    MAX_EMAIL_LENGTH,
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH
} from "../../common/constants";
import { trim } from "../../common/trim.transform";

export class RegisterDto {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_NAME_LENGTH)
    name: string;

    @Transform(trim)
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(MAX_EMAIL_LENGTH)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` })
    @MaxLength(MAX_PASSWORD_LENGTH, { message: `Password must be at most ${MAX_PASSWORD_LENGTH} characters long` })
    password: string;

    @IsIn(ITALIAN_LEVELS)
    @IsOptional()
    italian_level?: string

    @IsIn(SUPPORT_LANGUAGES)
    @IsOptional()
    supportLanguage?: string
}
