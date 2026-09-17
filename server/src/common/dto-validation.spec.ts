import { ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateChatDto, sendMessageDto, SessionIdParamDto } from '../chat/dto/create-chat.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateApiKeyDto } from '../users/dto/update-api-key.dto';
import { UpdateLanguageDto } from '../users/dto/update-language.dto';
import { MAX_FOCUS_AREA_LENGTH, MAX_MESSAGE_LENGTH } from './constants';

// Same options as main.ts
const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
const check = (metatype: any, value: unknown) =>
  pipe.transform(value, { type: 'body', metatype } as ArgumentMetadata);

const validId = '507f1f77bcf86cd799439011';

describe('request DTOs', () => {
  describe('CreateChatDto', () => {
    const valid = { level: 'A2', mode: 'grammar', focus_area: 'Passato Prossimo' };

    it('accepts a valid body', async () => {
      await expect(check(CreateChatDto, valid)).resolves.toMatchObject(valid);
    });

    it.each([
      ['unknown level', { ...valid, level: 'Z9' }],
      ['unknown mode', { ...valid, mode: 'freestyle' }],
      ['empty focus area', { ...valid, focus_area: '   ' }],
      ['too long focus area', { ...valid, focus_area: 'x'.repeat(MAX_FOCUS_AREA_LENGTH + 1) }],
      ['extra field', { ...valid, isAdmin: true }],
    ])('rejects %s', async (_name, body) => {
      await expect(check(CreateChatDto, body)).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendMessageDto', () => {
    it('accepts a message up to the limit', async () => {
      const message = 'x'.repeat(MAX_MESSAGE_LENGTH);
      await expect(check(sendMessageDto, { sessionId: validId, message })).resolves.toMatchObject({ message });
    });

    it.each([
      ['message over the limit', { sessionId: validId, message: 'x'.repeat(MAX_MESSAGE_LENGTH + 1) }],
      ['whitespace-only message', { sessionId: validId, message: '   ' }],
      ['bad session id', { sessionId: 'nope', message: 'ciao' }],
    ])('rejects %s', async (_name, body) => {
      await expect(check(sendMessageDto, body)).rejects.toThrow(BadRequestException);
    });
  });

  describe('SessionIdParamDto', () => {
    it('rejects ids that are not Mongo ObjectIds', async () => {
      await expect(pipe.transform({ id: 'abc' }, { type: 'param', metatype: SessionIdParamDto } as ArgumentMetadata))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('RegisterDto', () => {
    const valid = { name: 'Ada', email: 'ada@example.com', password: 'longenough1' };

    it('accepts a valid body with optional fields', async () => {
      await expect(
        check(RegisterDto, { ...valid, italian_level: 'B1', supportLanguage: 'French' }),
      ).resolves.toBeDefined();
    });

    it.each([
      ['short password', { ...valid, password: 'short' }],
      ['password over bcrypt limit', { ...valid, password: 'x'.repeat(73) }],
      ['long name', { ...valid, name: 'x'.repeat(51) }],
      ['bad level', { ...valid, italian_level: 'native' }],
      ['bad language', { ...valid, supportLanguage: 'Klingon' }],
    ])('rejects %s', async (_name, body) => {
      await expect(check(RegisterDto, body)).rejects.toThrow(BadRequestException);
    });
  });

  describe('users DTOs', () => {
    it('accepts a plausible API key and rejects junk', async () => {
      await expect(check(UpdateApiKeyDto, { apiKey: 'AIza' + 'x'.repeat(35) })).resolves.toBeDefined();
      await expect(check(UpdateApiKeyDto, { apiKey: 'short' })).rejects.toThrow(BadRequestException);
      await expect(check(UpdateApiKeyDto, { apiKey: 'x'.repeat(201) })).rejects.toThrow(BadRequestException);
      await expect(check(UpdateApiKeyDto, {})).rejects.toThrow(BadRequestException);
    });

    it('only accepts supported languages', async () => {
      await expect(check(UpdateLanguageDto, { supportLanguage: 'Spanish' })).resolves.toBeDefined();
      await expect(check(UpdateLanguageDto, { supportLanguage: 'Elvish' })).rejects.toThrow(BadRequestException);
    });
  });
});
