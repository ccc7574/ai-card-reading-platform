import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ScrapedContent {
  title: string
  content: string
  author?: string
  publishDate?: string
  url: string
  domain: string
}

export class ContentScraper {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  
  static async scrapeUrl(url: string): Promise<ScrapedContent> {
    try {
      // 验证URL格式
      const urlObj = new URL(url)
      const domain = urlObj.hostname

      // 发送HTTP请求
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000,
        maxRedirects: 5
      })

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = response.data
      const $ = cheerio.load(html)

      // 提取标题
      const title = this.extractTitle($)
      
      // 提取正文内容
      const content = this.extractContent($, domain)
      
      // 提取作者
      const author = this.extractAuthor($)
      
      // 提取发布日期
      const publishDate = this.extractPublishDate($)

      if (!title || !content) {
        throw new Error('无法提取有效的标题或内容')
      }

      return {
        title: title.trim(),
        content: content.trim(),
        author: author?.trim(),
        publishDate: publishDate?.trim(),
        url,
        domain
      }

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`内容抓取失败: ${error.message}`)
      }
      throw new Error('内容抓取失败: 未知错误')
    }
  }

  private static extractTitle($: cheerio.CheerioAPI): string {
    // 尝试多种标题选择器
    const titleSelectors = [
      'h1',
      'title',
      '[property="og:title"]',
      '[name="twitter:title"]',
      '.article-title',
      '.post-title',
      '.entry-title'
    ]

    for (const selector of titleSelectors) {
      const element = $(selector).first()
      if (element.length) {
        const title = element.attr('content') || element.text()
        if (title && title.trim().length > 0) {
          return title.trim()
        }
      }
    }

    return '未知标题'
  }

  private static extractContent($: cheerio.CheerioAPI, domain: string): string {
    // 移除不需要的元素
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share').remove()

    // 根据不同网站使用不同的内容选择器
    const contentSelectors = this.getContentSelectors(domain)

    for (const selector of contentSelectors) {
      const element = $(selector).first()
      if (element.length) {
        const content = element.text()
        if (content && content.trim().length > 100) {
          return this.cleanContent(content)
        }
      }
    }

    // 如果没有找到特定选择器，尝试通用方法
    const paragraphs = $('p').map((_, el) => $(el).text()).get()
    const content = paragraphs.join('\n\n')
    
    if (content.length > 100) {
      return this.cleanContent(content)
    }

    throw new Error('无法提取有效内容')
  }

  private static getContentSelectors(domain: string): string[] {
    // 针对不同网站的特定选择器
    const siteSelectors: Record<string, string[]> = {
      'medium.com': ['.article-content', '.postArticle-content', '.section-content'],
      'zhihu.com': ['.Post-RichText', '.RichText', '.content'],
      'jianshu.com': ['.article', '.note'],
      'csdn.net': ['.article_content', '.markdown_views'],
      'cnblogs.com': ['.postBody', '.blogpost-body'],
      'segmentfault.com': ['.article-content'],
      'juejin.cn': ['.article-content'],
      'infoq.cn': ['.article-content', '.content'],
      'sspai.com': ['.article-body', '.content'],
      'default': [
        'article',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content',
        '.article-body',
        '.post-body',
        'main',
        '.main-content'
      ]
    }

    return siteSelectors[domain] || siteSelectors['default']
  }

  private static extractAuthor($: cheerio.CheerioAPI): string | undefined {
    const authorSelectors = [
      '[property="article:author"]',
      '[name="author"]',
      '.author',
      '.byline',
      '.post-author',
      '.article-author'
    ]

    for (const selector of authorSelectors) {
      const element = $(selector).first()
      if (element.length) {
        const author = element.attr('content') || element.text()
        if (author && author.trim().length > 0) {
          return author.trim()
        }
      }
    }

    return undefined
  }

  private static extractPublishDate($: cheerio.CheerioAPI): string | undefined {
    const dateSelectors = [
      '[property="article:published_time"]',
      '[property="og:published_time"]',
      '[name="publish_date"]',
      '.publish-date',
      '.post-date',
      '.article-date',
      'time[datetime]'
    ]

    for (const selector of dateSelectors) {
      const element = $(selector).first()
      if (element.length) {
        const date = element.attr('content') || element.attr('datetime') || element.text()
        if (date && date.trim().length > 0) {
          return date.trim()
        }
      }
    }

    return undefined
  }

  private static cleanContent(content: string): string {
    return content
      .replace(/\s+/g, ' ')  // 合并多个空白字符
      .replace(/\n\s*\n/g, '\n\n')  // 合并多个换行
      .trim()
  }

  // 验证URL是否可访问
  static async validateUrl(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        headers: { 'User-Agent': this.USER_AGENT }
      })
      return response.status === 200
    } catch {
      return false
    }
  }

  // 获取网站favicon
  static async getFavicon(url: string): Promise<string | undefined> {
    try {
      const urlObj = new URL(url)
      const faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`
      
      const response = await axios.head(faviconUrl, { timeout: 3000 })
      if (response.status === 200) {
        return faviconUrl
      }
    } catch {
      // 忽略错误，返回undefined
    }
    
    return undefined
  }
}
