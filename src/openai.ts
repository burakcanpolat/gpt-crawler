import OpenAI from 'openai';
import { Config } from './config.js';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function processHtmlWithOpenAI(html: string, config: Config): Promise<string> {
    if (!config.openai?.enabled) {
        return html;
    }

    try {
        const response = await openai.chat.completions.create({
            model: config.openai.model,
            messages: [
                {
                    role: "system",
                    content: config.openai.prompt.system
                },
                {
                    role: "user",
                    content: `Process this HTML content and return a clean, structured version:\n\n${html}`
                }
            ],
            max_tokens: config.openai.prompt.maxTokens,
            temperature: config.openai.prompt.temperature
        });

        return response.choices[0]?.message?.content?.trim() || html;
    } catch (error) {
        console.error('Error processing content with OpenAI:', error);
        return html;
    }
}
