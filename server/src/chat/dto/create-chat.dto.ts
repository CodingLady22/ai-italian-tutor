import {
    IsString,
    IsNotEmpty,
    IsMongoId,
    IsIn,
    MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
    ITALIAN_LEVELS,
    CHAT_MODES,
    MAX_FOCUS_AREA_LENGTH,
    MAX_MESSAGE_LENGTH
} from '../../common/constants';
import { trim } from '../../common/trim.transform';

export class CreateChatDto {
    @IsIn(ITALIAN_LEVELS)
    level: string;

    @IsIn(CHAT_MODES)
    mode: string;

    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_FOCUS_AREA_LENGTH)
    focus_area: string;
}

export class sendMessageDto {
    @IsMongoId()
    sessionId: string;

    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(MAX_MESSAGE_LENGTH)
    message: string;
}

export class SessionIdParamDto {
    @IsMongoId()
    id: string;
}
