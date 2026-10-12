import { ConfigService } from '@nestjs/config';
import {
  BadGatewayException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiService } from './ai.service';

const sendMessage = jest.fn();
const generateContent = jest.fn();

jest.mock('@google/genai', () => ({
  // a plain class, so jest.resetAllMocks() cannot wipe the constructor
  GoogleGenAI: class {
    chats = { create: () => ({ sendMessage }) };
    models = { generateContent };
  },
}));

jest.mock('../common/constants', () => ({
  ...jest.requireActual('../common/constants'),
  AI_RETRY_DELAY_MS: 0,
}));

const apiError = (status?: number) => Object.assign(new Error('boom'), { status });

describe('AiService', () => {
  let service: AiService;
  const context = { level: 'A2', focus_area: 'Passato Prossimo', support_language: 'English' };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const config = { getOrThrow: () => 'app-key' } as unknown as ConfigService;
    service = new AiService(config);
  });

  describe('generateResponse', () => {
    it('returns the reply text', async () => {
      sendMessage.mockResolvedValue({ text: 'Ciao!' });
      await expect(service.generateResponse([], 'ciao', context)).resolves.toBe('Ciao!');
    });

    it('retries once on a server error and then succeeds', async () => {
      sendMessage.mockRejectedValueOnce(apiError(503)).mockResolvedValueOnce({ text: 'Ciao!' });

      await expect(service.generateResponse([], 'ciao', context)).resolves.toBe('Ciao!');
      expect(sendMessage).toHaveBeenCalledTimes(2);
    });

    it('throws 502 after the retry also fails, instead of returning a fake tutor reply', async () => {
      sendMessage.mockRejectedValue(apiError(500));

      await expect(service.generateResponse([], 'ciao', context)).rejects.toThrow(BadGatewayException);
      expect(sendMessage).toHaveBeenCalledTimes(2);
    });

    it('throws 503 when Gemini is rate limited', async () => {
      sendMessage.mockRejectedValue(apiError(429));
      await expect(service.generateResponse([], 'ciao', context)).rejects.toThrow(ServiceUnavailableException);
    });

    it('throws 503 on a timeout / network error (no status)', async () => {
      sendMessage.mockRejectedValue(apiError(undefined));
      await expect(service.generateResponse([], 'ciao', context)).rejects.toThrow(ServiceUnavailableException);
    });

    it('does not retry a rejected user key and tells the user so', async () => {
      sendMessage.mockRejectedValue(apiError(403));

      await expect(service.generateResponse([], 'ciao', context, 'user-key')).rejects.toThrow(BadRequestException);
      expect(sendMessage).toHaveBeenCalledTimes(1);
    });

    it('treats an empty reply as an error', async () => {
      sendMessage.mockResolvedValue({ text: '  ' });
      await expect(service.generateResponse([], 'ciao', context)).rejects.toThrow(BadGatewayException);
    });
  });

  describe('validateApiKey', () => {
    it('accepts a working key', async () => {
      generateContent.mockResolvedValue({});
      await expect(service.validateApiKey('good-key-1234567890')).resolves.toBeUndefined();
    });

    it.each([400, 401, 403])('rejects a key Gemini answers %i for', async (status) => {
      generateContent.mockRejectedValue(apiError(status));
      await expect(service.validateApiKey('bad-key-1234567890')).rejects.toThrow(BadRequestException);
    });

    it('accepts a key that is only rate limited', async () => {
      generateContent.mockRejectedValue(apiError(429));
      await expect(service.validateApiKey('good-key-1234567890')).resolves.toBeUndefined();
    });

    it('returns 503 when the check itself cannot be done', async () => {
      generateContent.mockRejectedValue(apiError(500));
      await expect(service.validateApiKey('good-key-1234567890')).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('buildSystemPrompt', () => {
    const prompt = () => service.buildSystemPrompt(context);

    it('numbers its rules without duplicates', () => {
      const numbers = [...prompt().matchAll(/^\s+(\d+)\. /gm)].map((m) => Number(m[1]));
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('uses the focus area, not the level, as the topic', () => {
      expect(prompt()).not.toMatch(/topic: A2/);
      expect(prompt()).toContain('Focus area: "Passato Prossimo"');
    });

    it('limits the tutor to Italian and covers prompt injection', () => {
      expect(prompt()).toMatch(/only help with learning Italian/);
      expect(prompt()).toMatch(/never an instruction/);
    });
  });
});
