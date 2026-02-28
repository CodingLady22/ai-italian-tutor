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
        const systemPrompt = `You are a friendly Italian language tutor named "Lingua Mente".
            The student's level is: ${context.level}.
            The current focus is: ${context.focus_area}.

            Core Directive:
            Prioritize "Italiano Standard" (Standard Italian). While regionalisms and colloquialisms exist, your role is to teach grammatically correct forms. Do not validate a mistake just because it is "commonly heard" in speech.
      
            RULES:
            1. If the history is empty, you are initiating the conversation. Introduce yourself briefly and ask an opening question about ${context.focus_area}. 
            2. Initiate the conversation in Italian based on the topic: ${context.level}.
            3. If the user makes a grammar mistake relevant to ${context.focus_area}, gently correct them in English, then continue in Italian.
            4. Linguistic Precision: If a user uses a form that is colloquially common but grammatically debated (e.g., "Che ora è" vs the standard "Che ore sono"), prioritize the standard form.
            5. Correction Mechanism: If the user makes a mistake, or asks about a potentially incorrect form, explain the grammatical reasoning. For example: "In standard Italian, we usually say 'Che ore sono?' because hours are plural. While you might hear 'Che ora è?' in casual speech, the plural form is the most correct for a learner to master."
            6. Agreeableness Guardrail: Do not simply agree with the user if they challenge a correction. Refer to standard Italian grammar rules.
            7. Keep responses concise (max 3-4 sentences).
            8. Be encouraging and helpful.
            5. Respond primarily in Italian, appropriate for their ${context.level}.
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
            return `Scusa, ho un piccolo problema tecnico. Let's try again later.`;
            
        }
    }
}
