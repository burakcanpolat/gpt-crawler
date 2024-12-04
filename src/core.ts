// For more information, see https://crawlee.dev/
import {
  Configuration,
  PlaywrightCrawler,
  downloadListOfUrls,
  log,
} from "crawlee";
import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { Config, configSchema } from "./config.js";
import { Page } from "playwright";
import { isWithinTokenLimit } from "gpt-tokenizer";
import { PathLike } from "fs";
import { processHtmlWithOpenAI } from "./openai.js";

let pageCounter = 0;
let batchCounter = 0;
let crawler: PlaywrightCrawler;
let totalPromptTokens = 0;
let totalCompletionTokens = 0;

// Helper function to add delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const threshold = config.pagesPerFile || 2; // Default threshold of 2 pages per file
  const crawlResults: CrawlResult[][] = [[]]; // Array of batches, starting with first empty batch

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
            const { result, promptTokens, completionTokens } =
              await processHtmlWithOpenAI(html, config);
            totalPromptTokens += promptTokens;
            totalCompletionTokens += completionTokens;
            processedHtml = result;
          }

          // Store processed HTML
          if (request.loadedUrl) {
            const result = {
              title,
              url: request.loadedUrl,
              html: processedHtml,
            };

            // Get current batch
            const currentBatch = crawlResults[batchCounter];
            currentBatch.push(result);

            // If current batch reaches threshold, prepare new batch
            if (
              currentBatch.length >= threshold &&
              pageCounter < config.maxPagesToCrawl
            ) {
              // Add delay before starting new batch if specified
              if (config.batchDelay) {
                await delay(config.batchDelay);
              }
              batchCounter++;
              crawlResults.push([]);
            }

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
          }).then((result) => {
            log.info(
              `Found and enqueued ${result.processedRequests.length} new URLs to crawl`,
            );
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
      log.info(`Downloading ${listOfUrls.length} URLs from sitemap...`);
      await crawler.addRequests(listOfUrls);
    } else {
      await crawler.addRequests([config.url]);
    }

    await crawler.run();
  }

  return crawlResults;
}

export async function write(config: Config) {
  const jsonFiles = await glob("storage/datasets/default/*.json", {
    absolute: true,
  });

  const results = [];
  for (const file of jsonFiles) {
    const content = await readFile(file, "utf-8");
    const json = JSON.parse(content);
    results.push(json);
  }

  // Combine all the results and split into batches
  const combined = results.flat();
  const threshold = config.pagesPerFile || 2;
  const batches: any[][] = [];

  for (let i = 0; i < combined.length; i += threshold) {
    batches.push(combined.slice(i, i + threshold));
  }

  const writtenFiles: string[] = [];

  // Process each batch separately
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const output: string[] = [];

    // Add token usage and cost information at the top of each file
    // write the token usage and cost information for first batch
    if (i === 0) {
      output.push(
        "# Token Usage and Cost Summary\n",
        `Total Prompt Tokens: ${totalPromptTokens.toLocaleString()}`,
        `Total Completion Tokens: ${totalCompletionTokens.toLocaleString()}`,
        `Total Tokens: ${(
          totalPromptTokens + totalCompletionTokens
        ).toLocaleString()}\n`,
        `Estimated Cost:`,
        `- Input Cost: $${(
          (totalPromptTokens / 1000000) *
          (config.openai?.costPerInputToken || 0.3)
        ).toFixed(4)}`,
        `- Output Cost: $${(
          (totalCompletionTokens / 1000000) *
          (config.openai?.costPerOutputToken || 0.6)
        ).toFixed(4)}`,
        `- Total Cost: $${(
          (totalPromptTokens / 1000000) *
            (config.openai?.costPerInputToken || 0.3) +
          (totalCompletionTokens / 1000000) *
            (config.openai?.costPerOutputToken || 0.6)
        ).toFixed(4)}\n`,
        "---\n",
      );
    }

    // Process each result
    for (const result of batch) {
      if (result.success !== false) {
        let content = result.html;
        if (typeof content === "object" && content.content) {
          content = content.content;
        }

        const lines = content.split("\n");
        const processedContent: string[] = [];

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.includes("Title:")) processedContent.push(line);
          else if (line.includes("ID:")) processedContent.push(line);
          else if (line.includes("Channel Name:")) processedContent.push(line);
          else if (line.includes("Published At:")) processedContent.push(line);
          else if (line.includes("Processing Style:"))
            processedContent.push(line);
          else if (line.includes("----------------"))
            processedContent.push(line);
          else if (line.includes("Summary:")) {
            processedContent.push("Summary:");
            continue;
          } else if (line.includes("Tags:")) {
            processedContent.push("\nTags:");
            continue;
          } else if (line.includes("Key Points:")) {
            processedContent.push("\nKey Points:");
            continue;
          } else if (line.includes("Formatted Text:")) {
            processedContent.push("\nFormatted Text:");
            continue;
          } else if (line.includes("================")) {
            processedContent.push("\n" + line);
            processedContent.push("");
          } else {
            processedContent.push(line);
          }
        }

        output.push(processedContent.join("\n"));
      } else {
        output.push(
          `Error processing content: ${result.error || "Unknown error"}`,
          "=".repeat(80),
          "",
        );
      }
    }

    // Generate output filename for this batch
    const baseFileName = config.outputFileName || "output.md";
    const extension = baseFileName.split(".").pop();
    const fileName = baseFileName.replace(
      `.${extension}`,
      `_${i + 1}.${extension}`,
    );

    await writeFile(fileName, output.join("\n"));
    writtenFiles.push(fileName);
  }

  return writtenFiles;
}

class GPTCrawlerCore {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async crawl() {
    await crawl(this.config);
  }

  async write(): Promise<PathLike[]> {
    // we need to wait for the file path as the path can change
    return new Promise((resolve, reject) => {
      write(this.config)
        .then((outputFilePaths) => {
          resolve(outputFilePaths);
        })
        .catch(reject);
    });
  }
}

export default GPTCrawlerCore;
