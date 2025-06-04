import { BaseAgent, AgentTask, AgentResult } from './base-agent'
import { ContentScraper } from '../content-scraper'

// 内容抓取Agent
export class ContentScraperAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ContentScraperAgent',
      description: '专门负责网页内容抓取和预处理',
      capabilities: ['scrape-content', 'validate-url', 'extract-metadata'],
      priority: 1,
      timeout: 15000
    })
  }

  protected async performTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'scrape-content':
        return await this.scrapeContent(task.input.url)
      
      case 'validate-url':
        return await this.validateUrl(task.input.url)
      
      case 'extract-metadata':
        return await this.extractMetadata(task.input.url)
      
      default:
        throw new Error(`Unsupported task type: ${task.type}`)
    }
  }

  private async scrapeContent(url: string): Promise<AgentResult> {
    try {
      const scrapedContent = await ContentScraper.scrapeUrl(url)
      
      return {
        success: true,
        data: scrapedContent,
        metadata: {
          contentLength: scrapedContent.content.length,
          domain: scrapedContent.domain,
          hasAuthor: !!scrapedContent.author,
          hasDate: !!scrapedContent.publishDate
        },
        nextTasks: [
          {
            type: 'analyze-content',
            input: { content: scrapedContent.content, url }
          },
          {
            type: 'extract-keywords',
            input: { content: scrapedContent.content }
          }
        ]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content scraping failed'
      }
    }
  }

  private async validateUrl(url: string): Promise<AgentResult> {
    try {
      const isValid = await ContentScraper.validateUrl(url)
      
      return {
        success: true,
        data: { isValid, url },
        nextTasks: isValid ? [
          {
            type: 'scrape-content',
            input: { url }
          }
        ] : []
      }
    } catch (error) {
      return {
        success: false,
        error: 'URL validation failed'
      }
    }
  }

  private async extractMetadata(url: string): Promise<AgentResult> {
    try {
      const favicon = await ContentScraper.getFavicon(url)
      const urlObj = new URL(url)
      
      return {
        success: true,
        data: {
          domain: urlObj.hostname,
          protocol: urlObj.protocol,
          favicon,
          extractedAt: new Date()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Metadata extraction failed'
      }
    }
  }
}
