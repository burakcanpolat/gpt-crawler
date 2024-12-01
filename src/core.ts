// For more information, see https://crawlee.dev/
import { Configuration, PlaywrightCrawler, downloadListOfUrls } from "crawlee";
import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { Config, configSchema } from "./config.js";
import { Page } from "playwright";
import { isWithinTokenLimit } from "gpt-tokenizer";
import { PathLike } from "fs";
import { processHtmlWithOpenAI } from "./openai.js";
import { clearConfigCache } from "prettier";

let pageCounter = 0;
let crawler: PlaywrightCrawler;
let totalPromptTokens = 0;
let totalCompletionTokens = 0;

interface CrawlResult {
  title: string;
  url: string;
  html: string;
  video_id?: string;
  channel_name?: string;
  publishedAt?: string;
  style?: string;
  summary?: string;
  tags?: string[];
  key_points?: string[];
  formatted_text?: string;
  research_implications?: string[];
  code_snippets?: string[];
  technical_concepts?: string[];
  market_insights?: string[];
  strategic_implications?: string[];
  success?: boolean;
  error?: string;
}

export function getPageHtml(page: Page, selector = "body") {
  return page.evaluate((selector) => {
    // Check if the selector is an XPath
    if (selector.startsWith("/")) {
      const elements = document.evaluate(
        selector,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );
      let result = elements.iterateNext();
      return result ? result.textContent || "" : "";
    } else {
      // Handle as a CSS selector
      const el = document.querySelector(selector) as HTMLElement | null;
      return el?.innerText || "";
    }
  }, selector);
}

export async function waitForXPath(page: Page, xpath: string, timeout: number) {
  await page.waitForFunction(
    (xpath) => {
      const elements = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );
      return elements.iterateNext() !== null;
    },
    xpath,
    { timeout },
  );
}

export async function crawl(config: Config) {
  configSchema.parse(config);

  const crawlResults: CrawlResult[] = [];

  if (process.env.NO_CRAWL !== "true") {
    crawler = new PlaywrightCrawler(
      {
        async requestHandler({ request, page, enqueueLinks, log, pushData }) {
          const title = await page.title();
          pageCounter++;
          log.info(
            `Crawling: Page ${pageCounter} / ${config.maxPagesToCrawl} - URL: ${request.loadedUrl}...`,
          );

          if (config.selector) {
            if (config.selector.startsWith("/")) {
              await waitForXPath(
                page,
                config.selector,
                config.waitForSelectorTimeout ?? 1000,
              );
            } else {
              await page.waitForSelector(config.selector, {
                timeout: config.waitForSelectorTimeout ?? 1000,
              });
            }
          }

          const html = await getPageHtml(page, config.selector);
          
          // Process with OpenAI immediately after getting the page content
          let processedHtml = html;
          if (config.openai?.enabled) {
            log.info("Processing page content with OpenAI...");
            const { result, promptTokens, completionTokens } = await processHtmlWithOpenAI(html, config);
            totalPromptTokens += promptTokens;
            totalCompletionTokens += completionTokens;
            processedHtml = result;
          }

          // Store processed HTML
          if (request.loadedUrl) {
            const result = { 
              title, 
              url: request.loadedUrl, 
              html: processedHtml 
            };
            crawlResults.push(result);
            await pushData(result);
          }

          if (config.onVisitPage) {
            await config.onVisitPage({ page, pushData });
          }

          await enqueueLinks({
            globs:
              typeof config.match === "string" ? [config.match] : config.match,
            exclude:
              typeof config.exclude === "string"
                ? [config.exclude]
                : config.exclude ?? [],
          });
        },
        maxRequestsPerCrawl: config.maxPagesToCrawl,
        preNavigationHooks: [
          async ({ request, page, log }) => {
            const RESOURCE_EXCLUSTIONS = config.resourceExclusions ?? [];
            if (RESOURCE_EXCLUSTIONS.length === 0) {
              return;
            }
            if (config.cookie) {
              const cookies = (
                Array.isArray(config.cookie) ? config.cookie : [config.cookie]
              ).map((cookie) => {
                return {
                  name: cookie.name,
                  value: cookie.value,
                  url: request.loadedUrl,
                };
              });
              await page.context().addCookies(cookies);
            }
            await page.route(
              `**\/*.{${RESOURCE_EXCLUSTIONS.join()}}`,
              (route) => route.abort("aborted"),
            );
            log.info(
              `Aborting requests for as this is a resource excluded route`,
            );
          },
        ],
      },
      new Configuration({
        purgeOnStart: true,
      }),
    );

    const isUrlASitemap = /sitemap.*\.xml$/.test(config.url);

    if (isUrlASitemap) {
      const listOfUrls = await downloadListOfUrls({ url: config.url });
      await crawler.addRequests(listOfUrls);
    } else {
      await crawler.addRequests([config.url]);
    }

    await crawler.run();
  }

  return crawlResults;
}

export async function write(config: Config) {
  let nextFileNameString: PathLike = "";
  const jsonFiles = await glob("storage/datasets/default/*.json", {
    absolute: true,
  });

  const results = [];
  for (const file of jsonFiles) {
    const content = await readFile(file, "utf-8");
    const json = JSON.parse(content);
    results.push(json);
  }

  // Combine all the results
  const combined = results.flat();
  console.log("Combined results:", combined);
  
  // Calculate costs using config values
  const promptCost = (totalPromptTokens / 1000000) * (config.openai?.costPerInputToken || 0.30); // Use config value or default
  const completionCost = (totalCompletionTokens / 1000000) * (config.openai?.costPerOutputToken || 0.60); // Use config value or default
  const totalCost = promptCost + completionCost;

  // Format the results in markdown
  const output: string[] = [];
  
  // Add token usage and cost information at the top
  output.push(
    "# Token Usage and Cost Summary\n",
    `Total Prompt Tokens: ${totalPromptTokens.toLocaleString()}`,
    `Total Completion Tokens: ${totalCompletionTokens.toLocaleString()}`,
    `Total Tokens: ${(totalPromptTokens + totalCompletionTokens).toLocaleString()}\n`,
    `Estimated Cost:`,
    `- Input Cost: $${promptCost.toFixed(4)}`,
    `- Output Cost: $${completionCost.toFixed(4)}`,
    `- Total Cost: $${totalCost.toFixed(4)}\n`,
    "---\n"
  );
  
  for (const result of combined) {
    if (result.success !== false) {
      // Parse the OpenAI response content if it exists
      let content = result.html;
      if (typeof content === 'object' && content.content) {
        content = content.content;
      }

      // Split content by newlines and process each line
      const lines = content.split('\n');
      const processedContent: string[] = [];
      
      for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Process each line based on its content
        if (line.includes('Title:')) processedContent.push(line);
        else if (line.includes('ID:')) processedContent.push(line);
        else if (line.includes('Channel Name:')) processedContent.push(line);
        else if (line.includes('Published At:')) processedContent.push(line);
        else if (line.includes('Processing Style:')) processedContent.push(line);
        else if (line.includes('----------------')) processedContent.push(line);
        else if (line.includes('Summary:')) {
          processedContent.push('Summary:');
          continue;
        }
        else if (line.includes('Tags:')) {
          processedContent.push('\nTags:');
          continue;
        }
        else if (line.includes('Key Points:')) {
          processedContent.push('\nKey Points:');
          continue;
        }
        else if (line.includes('Formatted Text:')) {
          processedContent.push('\nFormatted Text:');
          continue;
        }
        else if (line.includes('================')) {
          processedContent.push('\n' + line);
          processedContent.push('');
        }
        else {
          processedContent.push(line);
        }
      }
      
      output.push(processedContent.join('\n'));
    } else {
      output.push(
        `Error processing content: ${result.error || "Unknown error"}`,
        "=".repeat(80),
        ""
      );
    }
  }

  // Write the formatted output to the specified file
  const outputFileName = config.outputFileName || "output.md";
  await writeFile(outputFileName, output.join('\n'));
  nextFileNameString = outputFileName;

  return nextFileNameString;
}

class GPTCrawlerCore {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async crawl() {
    await crawl(this.config);
  }

  async write(): Promise<PathLike> {
    // we need to wait for the file path as the path can change
    return new Promise((resolve, reject) => {
      write(this.config)
        .then((outputFilePath) => {
          resolve(outputFilePath);
        })
        .catch(reject);
    });
  }
}

export default GPTCrawlerCore;
