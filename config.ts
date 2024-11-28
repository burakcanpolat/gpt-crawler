import { Config } from "./src/config";

export const defaultConfig: Config = {
  url: "https://developer-docs.amazon.com/sp-api/docs/welcome",
  match: "https://developer-docs.amazon.com/sp-api/docs/**",
  maxPagesToCrawl: 5,
  outputFileName: "amazon.json",
  maxTokens: 2000000,
  openai: {
    enabled: true,
    model: "gpt-4o-mini-2024-07-18",
    prompt: {
      system: "You are a helpful assistant that processes HTML content. Extract the main content and structure it in a clean, readable format. Remove navigation elements, headers, and other unnecessary UI elements. Return only the main content in a clear, structured format.",
      temperature: 0.3,
      maxTokens: 1000
    }
  }
};
