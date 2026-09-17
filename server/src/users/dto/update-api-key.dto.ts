import { IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { MIN_API_KEY_LENGTH, MAX_API_KEY_LENGTH } from '../../common/constants';
import { trim } from '../../common/trim.transform';

export class UpdateApiKeyDto {
    @Transform(trim)
    @IsString()
    @MinLength(MIN_API_KEY_LENGTH)
    @MaxLength(MAX_API_KEY_LENGTH)
    apiKey: string;
}
