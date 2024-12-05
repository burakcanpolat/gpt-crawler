// For more information, see https://crawlee.dev/
import {
  PlaywrightCrawler,
  downloadListOfUrls,
  log,
  PlaywrightCrawlingContext,
  Dictionary,
} from "crawlee";
import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { Config, configSchema } from "./config.js";
import { Page } from "playwright";
import { isWithinTokenLimit } from "gpt-tokenizer";
import { PathLike } from "fs";
import { processHtmlWithOpenAI } from "./openai.js";
import { mkdir } from "fs/promises";
import { join } from "path";

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

  const threshold = config.pagesPerFile || 5;
  const crawlResults: CrawlResult[][] = [[]];

  if (process.env.NO_CRAWL !== "true") {
    // Ensure storage directories exist
    try {
      await mkdir(join(process.cwd(), "storage", "request_queues", "default"), { recursive: true });
      await mkdir(join(process.cwd(), "storage", "datasets", "default"), { recursive: true });
    } catch (error) {
      // Ignore if directories already exist
    }

    crawler = new PlaywrightCrawler({
      async requestHandler({ request, page, enqueueLinks, log, pushData, crawler }: PlaywrightCrawlingContext): Promise<void> {
        // Early check for page limit
        if (pageCounter >= config.maxPagesToCrawl) {
          log.info('Reached maximum page limit. Stopping crawler...');
          if (crawler.autoscaledPool) {
            await crawler.autoscaledPool.abort();
          }
          return;
        }

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
            title: await page.title(),
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

        // Only enqueue new links if we haven't reached the limit
        if (pageCounter < config.maxPagesToCrawl) {
          await enqueueLinks({
            globs: typeof config.match === "string" ? [config.match] : config.match,
            exclude: typeof config.exclude === "string" ? [config.exclude] : config.exclude ?? [],
          }).then((result) => {
            log.info(
              `Found and enqueued ${result.processedRequests.length} new URLs to crawl`,
            );
          });
        }
      },
      maxConcurrency: config.maxConcurrency || 8,
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
    });

    // Clear storage before starting
    await crawler.getRequestQueue();

    const isUrlASitemap = /sitemap.*\.xml$/.test(config.url);

    if (isUrlASitemap) {
      const listOfUrls = await downloadListOfUrls({ url: config.url });
      log.info(`Found ${listOfUrls.length} URLs in sitemap...`);

      // Filter URLs based on match and exclude patterns
      const filteredUrls = listOfUrls.filter(url => {
        const matchPatterns = Array.isArray(config.match) ? config.match : [config.match];
        const excludePatterns = config.exclude 
          ? (Array.isArray(config.exclude) ? config.exclude : [config.exclude]) 
          : [];

        const matchesPattern = matchPatterns.some(pattern => 
          new RegExp(pattern.replace(/\*\*/g, '.*')).test(url)
        );

        const isExcluded = excludePatterns.length > 0 && excludePatterns.some(pattern => 
          pattern && new RegExp(pattern.replace(/\*\*/g, '.*')).test(url)
        );

        return matchesPattern && !isExcluded;
      });

      log.info(`Filtered to ${filteredUrls.length} URLs after applying patterns`);
      
      // Only add URLs up to the maxPagesToCrawl limit
      const urlsToAdd = filteredUrls.slice(0, config.maxPagesToCrawl);
      log.info(`Adding ${urlsToAdd.length} URLs to crawler queue (limited by maxPagesToCrawl)...`);
      
      await crawler.addRequests(urlsToAdd);
    } else {
      await crawler.addRequests([config.url]);
    }

    await crawler.run();
  }

  return crawlResults;
}

interface ProcessedBatch {
  content: string[];
  error?: string;
}

async function processResult(result: any): Promise<string> {
  const processedContent: string[] = [];
  
  try {
    let content = result.html;
    const lines = content.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;
      
      if (line.includes("Title:")) {
        const title = line.replace("Title:", "").trim();
        processedContent.push(`# ${title}\n`);
      }
      else if (line.includes("ID:")) processedContent.push(line + "\n");
      else if (line.includes("Channel Name:")) processedContent.push(line + "\n");
      else if (line.includes("Published At:")) processedContent.push(line + "\n");
      else if (line.includes("Processing Style:")) processedContent.push(line + "\n\n");
      else if (line.includes("----------------")) processedContent.push(line + "\n");
      else if (line.includes("Summary:")) processedContent.push("\n## Summary\n");
      else if (line.includes("Tags:")) processedContent.push("\n## Tags\n");
      else if (line.includes("Key Points:")) processedContent.push("\n## Key Points\n");
      else if (line.includes("Formatted Text:")) processedContent.push("\n## Formatted Text\n");
      else if (line.includes("================")) processedContent.push("\n" + line + "\n\n");
      else processedContent.push(line + "\n");
    }

    return processedContent.join("");
  } catch (error: any) {
    console.error("Error processing result:", error);
    throw new Error(`Failed to process result: ${error.message || 'Unknown error'}`);
  }
}

async function processBatch(
  batch: any[],
  batchIndex: number,
  tokenInfo: string[],
): Promise<ProcessedBatch> {
  try {
    const output: string[] = batchIndex === 0 ? [...tokenInfo] : [];
    
    for (const item of batch) {
      if (item.success !== false) {
        const processedContent = await processResult(item);
        output.push(processedContent);
      }
    }

    return { content: output };
  } catch (error: any) {
    return { 
      content: [], 
      error: `Error processing batch ${batchIndex}: ${error.message || 'Unknown error'}` 
    };
  }
}

export async function write(config: Config) {
  const jsonFiles = await glob("storage/datasets/default/*.json", {
    absolute: true,
  });

  const threshold = config.pagesPerFile || 5;
  const writtenFiles: string[] = [];
  let batchIndex = 0;

  // Token bilgilerini hazırla
  const tokenInfo = [
    "# Token Usage and Cost Summary\n",
    `Total Prompt Tokens: ${totalPromptTokens.toLocaleString()}`,
    `Total Completion Tokens: ${totalCompletionTokens.toLocaleString()}`,
    `Total Tokens: ${(totalPromptTokens + totalCompletionTokens).toLocaleString()}\n`,
    `Estimated Cost:`,
    `- Input Cost: $${((totalPromptTokens / 1000000) * (config.openai?.costPerInputToken || 0.3)).toFixed(4)}`,
    `- Output Cost: $${((totalCompletionTokens / 1000000) * (config.openai?.costPerOutputToken || 0.6)).toFixed(4)}`,
    `- Total Cost: $${((totalPromptTokens / 1000000) * (config.openai?.costPerInputToken || 0.3) + (totalCompletionTokens / 1000000) * (config.openai?.costPerOutputToken || 0.6)).toFixed(4)}\n`,
    "---\n",
  ];

  try {
    let currentBatch: any[] = [];
    
    for (const file of jsonFiles) {
      const fileContent = await readFile(file, "utf-8");
      let results;
      try {
        results = JSON.parse(fileContent);
        // Eğer results bir array değilse, array'e çevir
        if (!Array.isArray(results)) {
          results = [results];
        }
      } catch (parseError) {
        console.error(`Error parsing JSON file ${file}:`, parseError);
        continue; // Bu dosyayı atla ve diğerine geç
      }

      for (const result of results) {
        currentBatch.push(result);

        if (currentBatch.length >= threshold) {
          const { content, error } = await processBatch(currentBatch, batchIndex, tokenInfo);
          
          if (error) {
            console.error(error);
          }

          if (content.length > 0) {
            const fileName = config.outputFileName || "output.md";
            const extension = fileName.split(".").pop();
            const outputPath = fileName.replace(
              `.${extension}`,
              `_${batchIndex + 1}.${extension}`,
            );

            await writeFile(outputPath, content.join("\n"));
            writtenFiles.push(outputPath);
          }

          currentBatch = [];
          batchIndex++;
        }
      }
    }

    // Kalan batch'i işle
    if (currentBatch.length > 0) {
      const { content, error } = await processBatch(currentBatch, batchIndex, tokenInfo);
      
      if (error) {
        console.error(error);
      }

      if (content.length > 0) {
        const fileName = config.outputFileName || "output.md";
        const extension = fileName.split(".").pop();
        const outputPath = fileName.replace(
          `.${extension}`,
          `_${batchIndex + 1}.${extension}`,
        );

        await writeFile(outputPath, content.join("\n"));
        writtenFiles.push(outputPath);
      }
    }

  } catch (error) {
    console.error("Error during file processing:", error);
    throw error;
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
