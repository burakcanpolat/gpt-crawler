#!/usr/bin/env node

import { program } from "commander";
import { Config } from "./config.js";
import { crawl, write } from "./core.js";
import { createRequire } from "node:module";
import inquirer from "inquirer";

const require = createRequire(import.meta.url);
const { version, description } = require("../../package.json");

const messages = {
  url: "What is the first URL of the website you want to crawl?",
  match: "What is the URL pattern you want to match?",
  selector: "What is the CSS selector you want to match?",
  maxPagesToCrawl: "How many pages do you want to crawl?",
  outputFileName: "What is the name of the output file?",
  maxTokens: "What is the maximum number of tokens to generate?",
};

interface CLIOptions extends Omit<Config, 'maxPagesToCrawl' | 'maxTokens'> {
  maxPagesToCrawl: string;
  maxTokens: string;
}

async function handler(options: CLIOptions) {
  try {
    const {
      url,
      match,
      selector,
      maxPagesToCrawl: maxPagesToCrawlStr,
      outputFileName,
      maxTokens: maxTokensStr,
      openai,
    } = options;

    // Parse numeric values
    const maxPagesToCrawl = parseInt(maxPagesToCrawlStr, 10);
    const maxTokens = maxTokensStr ? parseInt(maxTokensStr, 10) : 2000000;

    let config: Config = {
      url,
      match,
      selector,
      maxPagesToCrawl,
      outputFileName,
      maxTokens,
      openai: openai || {
        enabled: true,
        model: "gpt-4o-mini-2024-07-18",
        prompt: {
          system: "You are a helpful assistant that processes HTML content. Extract the main content and structure it in a clean, readable format. Remove navigation elements, headers, and other unnecessary UI elements. Return only the main content in a clear, structured format.",
          temperature: 0.3,
          maxTokens: 1000,
        },
      },
    };

    if (!config.url || !config.match || !config.selector) {
      const questions = [];

      if (!config.url) {
        questions.push({
          type: "input",
          name: "url",
          message: messages.url,
        });
      }

      if (!config.match) {
        questions.push({
          type: "input",
          name: "match",
          message: messages.match,
        });
      }

      if (!config.selector) {
        questions.push({
          type: "input",
          name: "selector",
          message: messages.selector,
        });
      }

      const answers = await inquirer.prompt(questions);
      config = { ...config, ...answers };
    }

    await crawl(config);
    await write(config);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

program.version(version).description(description);

program
  .option("-u, --url <string>", messages.url, "")
  .option("-m, --match <string>", messages.match, "")
  .option("-s, --selector <string>", messages.selector, "")
  .option("-p, --maxPagesToCrawl <number>", messages.maxPagesToCrawl, "10")
  .option(
    "-o, --outputFileName <string>",
    messages.outputFileName,
    "output.json",
  )
  .option("-t, --maxTokens <number>", messages.maxTokens, "2000000")
  .option(
    "--openai-enabled <boolean>",
    "Enable or disable OpenAI integration",
    "true"
  )
  .option("--openai-model <string>", "OpenAI model to use", "gpt-4o-mini-2024-07-18")
  .option(
    "--openai-prompt-system <string>",
    "OpenAI prompt system message",
    "You are a helpful assistant that processes HTML content. Extract the main content and structure it in a clean, readable format. Remove navigation elements, headers, and other unnecessary UI elements. Return only the main content in a clear, structured format."
  )
  .option("--openai-prompt-temperature <number>", "OpenAI prompt temperature", "0.3")
  .option("--openai-prompt-maxTokens <number>", "OpenAI prompt max tokens", "1000")
  .action(handler);

program.parse();
