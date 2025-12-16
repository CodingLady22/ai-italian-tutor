import {
    IsString,
    IsNotEmpty,
    IsMongoId,
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
    sessionId: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}
