import { 
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength
} from "class-validator";
import { Transform } from "class-transformer";
import { MAX_EMAIL_LENGTH } from "../../common/constants";

// Looser than signup so accounts created before the signup limit still log in
const MAX_LOGIN_PASSWORD_LENGTH = 128;
import { trim } from "../../common/trim.transform";

export class LoginDto {
    @Transform(trim)
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(MAX_EMAIL_LENGTH)
    email: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_LOGIN_PASSWORD_LENGTH)
    password: string
}
