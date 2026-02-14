import {
    IsString,
    IsNotEmpty,
    IsMongoId,
    MaxLength,
    MinLength
} from 'class-validator';

export class CreateChatDto {
    @IsString()
    @IsNotEmpty()
    level: string;

    @IsString()
    @IsNotEmpty()
    mode: string;

    @IsString()
    @IsNotEmpty()
    focus_area: string;
}

export class sendMessageDto {
    @IsMongoId()
    @IsNotEmpty()
    @MaxLength(1000)
    @MinLength(1)
    sessionId: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}
