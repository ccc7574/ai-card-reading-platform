import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { ContentScraper } from '../content-scraper'
import { AIServiceFactory, AIProvider } from '../ai-services'

// 网页内容抓取工具
export class WebScrapingTool extends StructuredTool {
  name = 'web_scraping'
  description = '抓取网页内容，提取标题、正文、作者等信息'
  
  schema = z.object({
    url: z.string().describe('要抓取的网页URL'),
    extractMetadata: z.boolean().optional().describe('是否提取元数据，默认true')
  })

  async _call({ url, extractMetadata = true }: z.infer<typeof this.schema>): Promise<string> {
    try {
      const content = await ContentScraper.scrapeUrl(url)
      
      const result = {
        title: content.title,
        content: content.content.slice(0, 2000), // 限制长度
        author: content.author,
        domain: content.domain,
        wordCount: content.content.split(' ').length
      }

      if (extractMetadata) {
        const favicon = await ContentScraper.getFavicon(url)
        Object.assign(result, { favicon })
      }

      return JSON.stringify(result, null, 2)
    } catch (error) {
      return `抓取失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

// AI内容分析工具
export class ContentAnalysisTool extends StructuredTool {
  name = 'content_analysis'
  description = '使用AI分析内容，提取关键信息、标签、分类等'
  
  schema = z.object({
    content: z.string().describe('要分析的内容'),
    url: z.string().optional().describe('内容来源URL'),
    provider: z.enum(['openai', 'gemini']).optional().describe('AI服务提供商，默认openai')
  })

  async _call({ content, url = '', provider = 'openai' }: z.infer<typeof this.schema>): Promise<string> {
    try {
      const aiProvider = provider === 'gemini' ? AIProvider.GEMINI : AIProvider.OPENAI
      const analysis = await AIServiceFactory.analyzeContent(aiProvider, url, content)
      
      return JSON.stringify({
        title: analysis.title,
        summary: analysis.summary,
        tags: analysis.tags,
        category: analysis.category,
        difficulty: analysis.difficulty,
        keyPoints: analysis.keyPoints,
        readingTime: analysis.readingTime
      }, null, 2)
    } catch (error) {
      // 降级到基础分析
      const words = content.split(/\s+/).length
      const readingTime = Math.ceil(words / 200)
      
      return JSON.stringify({
        title: '内容分析',
        summary: content.slice(0, 100) + '...',
        tags: ['AI', '分析', '内容'],
        category: 'article',
        difficulty: 'intermediate',
        keyPoints: ['基础分析', '自动处理'],
        readingTime,
        fallback: true
      }, null, 2)
    }
  }
}

// 图像生成工具
export class ImageGenerationTool extends StructuredTool {
  name = 'image_generation'
  description = '生成AI图像，支持多种风格和模式'
  
  schema = z.object({
    prompt: z.string().describe('图像生成提示词'),
    style: z.enum(['sketch', 'diagram', 'thumbnail', 'realistic']).optional().describe('图像风格'),
    provider: z.enum(['openai', 'gemini']).optional().describe('AI服务提供商'),
    mode: z.enum(['standard', 'premium']).optional().describe('生成模式')
  })

  async _call({ prompt, style = 'sketch', provider = 'openai', mode = 'standard' }: z.infer<typeof this.schema>): Promise<string> {
    try {
      const aiProvider = provider === 'gemini' ? AIProvider.GEMINI : AIProvider.OPENAI
      
      let result
      if (provider === 'gemini' && mode === 'premium') {
        try {
          result = await AIServiceFactory.generateImageWithImagen(prompt)
        } catch {
          result = await AIServiceFactory.generateSketch(aiProvider, prompt)
        }
      } else {
        result = await AIServiceFactory.generateSketch(aiProvider, prompt)
      }
      
      return JSON.stringify({
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        description: result.description,
        style,
        provider,
        mode
      }, null, 2)
    } catch (error) {
      return JSON.stringify({
        error: `图像生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
        fallback: true
      }, null, 2)
    }
  }
}

// 知识关联工具
export class KnowledgeConnectionTool extends StructuredTool {
  name = 'knowledge_connection'
  description = '分析内容并找到相关的知识点和关联'
  
  schema = z.object({
    content: z.string().describe('要分析关联的内容'),
    tags: z.array(z.string()).optional().describe('内容标签'),
    category: z.string().optional().describe('内容分类')
  })

  async _call({ content, tags = [], category }: z.infer<typeof this.schema>): Promise<string> {
    try {
      // 简化的知识关联分析
      const connections = this.analyzeConnections(content, tags, category)
      
      return JSON.stringify({
        connections,
        relatedTopics: this.extractRelatedTopics(content),
        suggestedTags: this.suggestAdditionalTags(content, tags),
        knowledgeGraph: this.buildSimpleGraph(content, tags)
      }, null, 2)
    } catch (error) {
      return `知识关联分析失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  private analyzeConnections(content: string, tags: string[], category?: string) {
    const connections = []
    
    // 基于关键词的简单关联分析
    const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || []
    const keywordFreq = new Map<string, number>()
    
    keywords.forEach(word => {
      keywordFreq.set(word, (keywordFreq.get(word) || 0) + 1)
    })
    
    // 找出高频关键词
    const topKeywords = Array.from(keywordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)
    
    topKeywords.forEach(keyword => {
      connections.push({
        type: 'keyword',
        value: keyword,
        strength: keywordFreq.get(keyword) || 0,
        description: `高频关键词: ${keyword}`
      })
    })
    
    return connections
  }

  private extractRelatedTopics(content: string): string[] {
    // 简单的主题提取
    const topics = []
    const lowerContent = content.toLowerCase()
    
    const topicPatterns = [
      { pattern: /ai|artificial intelligence|人工智能/, topic: 'AI人工智能' },
      { pattern: /machine learning|机器学习/, topic: '机器学习' },
      { pattern: /deep learning|深度学习/, topic: '深度学习' },
      { pattern: /neural network|神经网络/, topic: '神经网络' },
      { pattern: /algorithm|算法/, topic: '算法' },
      { pattern: /data|数据/, topic: '数据科学' }
    ]
    
    topicPatterns.forEach(({ pattern, topic }) => {
      if (pattern.test(lowerContent)) {
        topics.push(topic)
      }
    })
    
    return topics
  }

  private suggestAdditionalTags(content: string, existingTags: string[]): string[] {
    const suggestions = []
    const lowerContent = content.toLowerCase()
    
    const tagSuggestions = [
      { keywords: ['技术', 'technology', 'tech'], tag: '技术' },
      { keywords: ['创新', 'innovation', 'innovative'], tag: '创新' },
      { keywords: ['未来', 'future', 'trend'], tag: '未来趋势' },
      { keywords: ['分析', 'analysis', 'analyze'], tag: '分析' },
      { keywords: ['研究', 'research', 'study'], tag: '研究' }
    ]
    
    tagSuggestions.forEach(({ keywords, tag }) => {
      if (keywords.some(keyword => lowerContent.includes(keyword)) && 
          !existingTags.includes(tag)) {
        suggestions.push(tag)
      }
    })
    
    return suggestions.slice(0, 3) // 限制建议数量
  }

  private buildSimpleGraph(content: string, tags: string[]) {
    return {
      nodes: [
        { id: 'content', type: 'content', label: '主要内容' },
        ...tags.map(tag => ({ id: tag, type: 'tag', label: tag }))
      ],
      edges: tags.map(tag => ({
        from: 'content',
        to: tag,
        type: 'tagged_with'
      }))
    }
  }
}

// URL验证工具
export class URLValidationTool extends StructuredTool {
  name = 'url_validation'
  description = '验证URL的有效性和可访问性'
  
  schema = z.object({
    url: z.string().describe('要验证的URL')
  })

  async _call({ url }: z.infer<typeof this.schema>): Promise<string> {
    try {
      const isValid = await ContentScraper.validateUrl(url)
      const urlObj = new URL(url)
      
      return JSON.stringify({
        isValid,
        url,
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        validatedAt: new Date().toISOString()
      }, null, 2)
    } catch (error) {
      return JSON.stringify({
        isValid: false,
        url,
        error: error instanceof Error ? error.message : '验证失败'
      }, null, 2)
    }
  }
}

// 导出所有工具
export const createDefaultTools = (): StructuredTool[] => [
  new WebScrapingTool(),
  new ContentAnalysisTool(),
  new ImageGenerationTool(),
  new KnowledgeConnectionTool(),
  new URLValidationTool()
]
