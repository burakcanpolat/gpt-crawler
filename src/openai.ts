import OpenAI from "openai";
import { Config } from "./config.js";
import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processHtmlWithOpenAI(
  html: string,
  config: Config,
): Promise<{ result: string; promptTokens: number; completionTokens: number }> {
  if (!config.openai?.enabled) {
    return { result: html, promptTokens: 0, completionTokens: 0 };
  }

  try {
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: "system",
          content: config.openai.prompt.system,
        },
        {
          role: "user",
          content: `Process this HTML content and return a clean, structured version:\n\n${html}`,
        },
      ],
      max_tokens: config.openai.prompt.maxTokens,
      temperature: config.openai.prompt.temperature,
    });

    return {
      result: response.choices[0]?.message?.content?.trim() || html,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0
    };
  } catch (error) {
    console.error("Error processing content with OpenAI:", error);
    return { result: html, promptTokens: 0, completionTokens: 0 };
  }
}
