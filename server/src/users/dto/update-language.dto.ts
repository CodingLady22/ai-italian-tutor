import { IsIn } from 'class-validator';
import { SUPPORT_LANGUAGES } from '../../common/constants';

export class UpdateLanguageDto {
    @IsIn(SUPPORT_LANGUAGES)
    supportLanguage: string;
}
