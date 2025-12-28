import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
    private client: GoogleGenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.getOrThrow<string>('GOOGLE_API_KEY');
        this.client = new GoogleGenAI({ apiKey });
    }

    async generateResponse(
        history: { role: string; parts: { text: string }[] }[],
        currentMessage: string,
        context: { level: string, focus_area: string }
    ): Promise<string> {
        const systemPrompt = `You are a friendly Italian language tutor.
            The student's level is: ${context.level}.
            The current focus is: ${context.focus_area}.
      
            Rules:
            1. Respond primarily in Italian, appropriate for their level.
            2. If the user makes a grammar mistake relevant to ${context.focus_area}, gently correct them in English, then continue in Italian.
            3. Keep responses concise (max 2-3 sentences).
            4. Be encouraging and helpful.
        `;

            // Start a chat session with the history
        const chat = this.client.chats.create({
            model: 'gemini-2.5-flash-lite',
            config: {
                systemInstruction: systemPrompt,
            },
            history: history,
        });

        try {
            const result = await chat.sendMessage({
                message: currentMessage ,
            })

            return result.text || '';
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return `Scusa, I am having trouble responding right now. Let's try again later.`;
            
        }
    }
}
