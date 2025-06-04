// AI Agent驱动的智能数据源处理系统
import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ragEngine } from './rag-engine'

export interface DataSource {
  id: string
  name: string
  url: string
  type: 'rss' | 'api' | 'scraping' | 'webhook'
  category: string
  priority: number
  updateFrequency: number // 小时
  lastUpdated: Date
  isActive: boolean
  metadata: {
    language: string
    region: string
    contentType: string[]
    qualityScore: number
    reliability: number
  }
}

export interface RawContent {
  id: string
  sourceId: string
  title: string
  content: string
  url: string
  publishedAt: Date
  author?: string
  metadata: Record<string, any>
}

export interface ProcessedContent {
  id: string
  title: string
  summary: string
  content: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  readingTime: number
  qualityScore: number
  sentiment: 'positive' | 'neutral' | 'negative'
  keyInsights: string[]
  relatedTopics: string[]
  actionableItems: string[]
  sourceId: string
  publishedAt: Date
  processedAt: Date
}

// 内容抓取Agent
class ContentFetchAgent {
  private openai: OpenAI
  private name = 'ContentFetchAgent'

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async fetchFromSource(source: DataSource): Promise<RawContent[]> {
    console.log(`🕷️ ${this.name} 开始抓取: ${source.name}`)

    try {
      switch (source.type) {
        case 'rss':
          return await this.fetchRSS(source)
        case 'api':
          return await this.fetchAPI(source)
        case 'scraping':
          return await this.fetchScraping(source)
        default:
          console.warn(`不支持的数据源类型: ${source.type}`)
          return []
      }
    } catch (error) {
      console.error(`${this.name} 抓取失败:`, error)
      return []
    }
  }

  private async fetchRSS(source: DataSource): Promise<RawContent[]> {
    // 模拟RSS抓取
    const mockContent: RawContent[] = [
      {
        id: `${source.id}_${Date.now()}_1`,
        sourceId: source.id,
        title: `${source.name}最新文章：AI技术发展趋势`,
        content: '人工智能技术正在快速发展，特别是在大语言模型、计算机视觉和自动化领域...',
        url: `${source.url}/article-1`,
        publishedAt: new Date(),
        author: '技术专家',
        metadata: { type: 'article', language: 'zh' }
      },
      {
        id: `${source.id}_${Date.now()}_2`,
        sourceId: source.id,
        title: `${source.name}深度分析：机器学习在实际应用中的挑战`,
        content: '机器学习技术虽然发展迅速，但在实际应用中仍面临数据质量、模型解释性等挑战...',
        url: `${source.url}/article-2`,
        publishedAt: new Date(Date.now() - 3600000),
        author: 'ML研究员',
        metadata: { type: 'analysis', language: 'zh' }
      }
    ]

    return mockContent
  }

  private async fetchAPI(source: DataSource): Promise<RawContent[]> {
    // 模拟API抓取
    return []
  }

  private async fetchScraping(source: DataSource): Promise<RawContent[]> {
    // 模拟网页抓取
    return []
  }
}

// 内容质量评估Agent
class ContentQualityAgent {
  private openai: OpenAI
  private name = 'ContentQualityAgent'

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async assessQuality(content: RawContent): Promise<number> {
    console.log(`📊 ${this.name} 评估质量: ${content.title}`)

    try {
      const prompt = `
作为内容质量评估专家，请评估以下内容的质量：

标题: ${content.title}
内容: ${content.content.substring(0, 1000)}
作者: ${content.author || '未知'}

请从以下维度评估质量（0-10分）：
1. 内容原创性和深度
2. 信息准确性和可信度
3. 写作质量和逻辑性
4. 实用性和价值
5. 时效性和相关性

返回JSON格式：
{
  "overallScore": 8.5,
  "dimensions": {
    "originality": 8,
    "accuracy": 9,
    "writing": 8,
    "utility": 9,
    "relevance": 8
  },
  "reasoning": "评估理由",
  "recommendation": "accept|review|reject"
}
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      const assessment = JSON.parse(response.choices[0].message.content || '{"overallScore": 5}')
      return assessment.overallScore / 10 // 转换为0-1范围

    } catch (error) {
      console.error(`${this.name} 质量评估失败:`, error)
      return 0.5 // 默认中等质量
    }
  }

  async detectDuplicates(content: RawContent, existingContent: ProcessedContent[]): Promise<boolean> {
    try {
      // 使用RAG引擎检测重复内容
      const ragResponse = await ragEngine.search({
        query: content.title,
        options: { topK: 5, threshold: 0.8 }
      })

      // 如果找到高相似度的内容，认为是重复
      return ragResponse.results.length > 0 && ragResponse.confidence > 0.8

    } catch (error) {
      console.error('重复检测失败:', error)
      return false
    }
  }
}

// 内容处理和增强Agent
class ContentProcessingAgent {
  private openai: OpenAI
  private gemini: GoogleGenerativeAI
  private name = 'ContentProcessingAgent'

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  }

  async processContent(rawContent: RawContent): Promise<ProcessedContent> {
    console.log(`⚙️ ${this.name} 处理内容: ${rawContent.title}`)

    try {
      // 并行处理多个任务
      const [
        summary,
        categoryAndTags,
        difficulty,
        readingTime,
        sentiment,
        insights,
        relatedTopics,
        actionableItems
      ] = await Promise.all([
        this.generateSummary(rawContent),
        this.categorizeAndTag(rawContent),
        this.assessDifficulty(rawContent),
        this.calculateReadingTime(rawContent),
        this.analyzeSentiment(rawContent),
        this.extractKeyInsights(rawContent),
        this.findRelatedTopics(rawContent),
        this.extractActionableItems(rawContent)
      ])

      const processedContent: ProcessedContent = {
        id: rawContent.id,
        title: rawContent.title,
        summary,
        content: rawContent.content,
        category: categoryAndTags.category,
        tags: categoryAndTags.tags,
        difficulty,
        readingTime,
        qualityScore: 0.8, // 将由质量评估Agent设置
        sentiment,
        keyInsights,
        relatedTopics,
        actionableItems,
        sourceId: rawContent.sourceId,
        publishedAt: rawContent.publishedAt,
        processedAt: new Date()
      }

      return processedContent

    } catch (error) {
      console.error(`${this.name} 内容处理失败:`, error)
      throw error
    }
  }

  private async generateSummary(content: RawContent): Promise<string> {
    try {
      const prompt = `
请为以下内容生成一个简洁而全面的摘要（100-150字）：

标题: ${content.title}
内容: ${content.content}

要求：
1. 突出核心观点和关键信息
2. 保持客观和准确
3. 适合快速阅读
4. 吸引读者兴趣
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      })

      return response.choices[0].message.content || '内容摘要生成失败'

    } catch (error) {
      console.error('摘要生成失败:', error)
      return content.content.substring(0, 150) + '...'
    }
  }

  private async categorizeAndTag(content: RawContent): Promise<{ category: string; tags: string[] }> {
    try {
      const prompt = `
请为以下内容进行分类和标签提取：

标题: ${content.title}
内容: ${content.content.substring(0, 1000)}

返回JSON格式：
{
  "category": "主要分类（tech/ai/business/design/science/programming等）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"]
}

要求：
1. 分类要准确且具体
2. 标签要相关且有用
3. 包含技术术语和概念
4. 5-8个标签
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content || '{"category": "tech", "tags": []}')
      return {
        category: result.category || 'tech',
        tags: Array.isArray(result.tags) ? result.tags : []
      }

    } catch (error) {
      console.error('分类标签失败:', error)
      return { category: 'tech', tags: [] }
    }
  }

  private async assessDifficulty(content: RawContent): Promise<'beginner' | 'intermediate' | 'advanced' | 'expert'> {
    try {
      const prompt = `
评估以下内容的难度级别：

标题: ${content.title}
内容: ${content.content.substring(0, 800)}

请根据以下标准评估：
- beginner: 基础概念，无需专业背景
- intermediate: 需要一定基础知识
- advanced: 需要深入的专业知识
- expert: 需要专家级别的理解

只返回难度级别，不要其他内容。
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })

      const difficulty = response.choices[0].message.content?.trim().toLowerCase()
      
      if (['beginner', 'intermediate', 'advanced', 'expert'].includes(difficulty || '')) {
        return difficulty as any
      }
      
      return 'intermediate'

    } catch (error) {
      console.error('难度评估失败:', error)
      return 'intermediate'
    }
  }

  private calculateReadingTime(content: RawContent): number {
    // 基于字数估算阅读时间（中文约300字/分钟）
    const wordCount = content.content.length
    return Math.ceil(wordCount / 300)
  }

  private async analyzeSentiment(content: RawContent): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      const prompt = `
分析以下内容的情感倾向：

标题: ${content.title}
内容: ${content.content.substring(0, 500)}

返回以下之一：
- positive: 积极、乐观、正面
- neutral: 中性、客观
- negative: 消极、悲观、负面

只返回情感类型，不要其他内容。
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })

      const sentiment = response.choices[0].message.content?.trim().toLowerCase()
      
      if (['positive', 'neutral', 'negative'].includes(sentiment || '')) {
        return sentiment as any
      }
      
      return 'neutral'

    } catch (error) {
      console.error('情感分析失败:', error)
      return 'neutral'
    }
  }

  private async extractKeyInsights(content: RawContent): Promise<string[]> {
    try {
      const prompt = `
从以下内容中提取3-5个关键洞察：

标题: ${content.title}
内容: ${content.content}

返回JSON数组格式：["洞察1", "洞察2", "洞察3"]

要求：
1. 每个洞察都是独立的要点
2. 突出重要发现或观点
3. 简洁明了，易于理解
4. 具有实际价值
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      })

      const insights = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(insights) ? insights : []

    } catch (error) {
      console.error('关键洞察提取失败:', error)
      return []
    }
  }

  private async findRelatedTopics(content: RawContent): Promise<string[]> {
    try {
      const prompt = `
基于以下内容，识别相关主题：

标题: ${content.title}
内容: ${content.content.substring(0, 800)}

返回JSON数组格式：["相关主题1", "相关主题2", "相关主题3"]

要求：
1. 3-5个相关主题
2. 包含技术概念和领域
3. 有助于扩展阅读
4. 与原内容相关但不重复
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      })

      const topics = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(topics) ? topics : []

    } catch (error) {
      console.error('相关主题提取失败:', error)
      return []
    }
  }

  private async extractActionableItems(content: RawContent): Promise<string[]> {
    try {
      const prompt = `
从以下内容中提取可执行的行动项：

标题: ${content.title}
内容: ${content.content}

返回JSON数组格式：["行动项1", "行动项2", "行动项3"]

要求：
1. 具体可执行的建议或步骤
2. 对读者有实际价值
3. 简洁明了
4. 2-4个行动项
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      })

      const actions = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(actions) ? actions : []

    } catch (error) {
      console.error('行动项提取失败:', error)
      return []
    }
  }
}

// 智能数据源管理系统
export class AIDataSourceManager {
  private static instance: AIDataSourceManager
  private fetchAgent: ContentFetchAgent
  private qualityAgent: ContentQualityAgent
  private processingAgent: ContentProcessingAgent
  private dataSources = new Map<string, DataSource>()
  private processedContent: ProcessedContent[] = []

  private constructor() {
    this.fetchAgent = new ContentFetchAgent()
    this.qualityAgent = new ContentQualityAgent()
    this.processingAgent = new ContentProcessingAgent()
    this.initializeDataSources()
  }

  public static getInstance(): AIDataSourceManager {
    if (!AIDataSourceManager.instance) {
      AIDataSourceManager.instance = new AIDataSourceManager()
    }
    return AIDataSourceManager.instance
  }

  private initializeDataSources() {
    const sources: DataSource[] = [
      {
        id: 'techcrunch',
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        type: 'rss',
        category: 'tech',
        priority: 9,
        updateFrequency: 2,
        lastUpdated: new Date(),
        isActive: true,
        metadata: {
          language: 'en',
          region: 'global',
          contentType: ['news', 'analysis'],
          qualityScore: 0.9,
          reliability: 0.95
        }
      },
      {
        id: 'arxiv_ai',
        name: 'arXiv AI Papers',
        url: 'https://arxiv.org/rss/cs.AI',
        type: 'rss',
        category: 'ai',
        priority: 8,
        updateFrequency: 6,
        lastUpdated: new Date(),
        isActive: true,
        metadata: {
          language: 'en',
          region: 'global',
          contentType: ['research', 'paper'],
          qualityScore: 0.95,
          reliability: 0.98
        }
      },
      {
        id: 'mit_tech_review',
        name: 'MIT Technology Review',
        url: 'https://www.technologyreview.com/feed/',
        type: 'rss',
        category: 'tech',
        priority: 9,
        updateFrequency: 4,
        lastUpdated: new Date(),
        isActive: true,
        metadata: {
          language: 'en',
          region: 'global',
          contentType: ['analysis', 'feature'],
          qualityScore: 0.92,
          reliability: 0.96
        }
      }
    ]

    sources.forEach(source => {
      this.dataSources.set(source.id, source)
    })

    console.log(`📚 初始化了 ${sources.length} 个数据源`)
  }

  // 智能内容更新
  public async updateAllSources(): Promise<ProcessedContent[]> {
    console.log('🔄 开始智能内容更新...')
    
    const newContent: ProcessedContent[] = []

    for (const [sourceId, source] of this.dataSources) {
      if (!source.isActive) continue

      try {
        // 检查是否需要更新
        const hoursSinceUpdate = (Date.now() - source.lastUpdated.getTime()) / (1000 * 60 * 60)
        if (hoursSinceUpdate < source.updateFrequency) {
          continue
        }

        console.log(`📡 更新数据源: ${source.name}`)

        // 1. 抓取原始内容
        const rawContents = await this.fetchAgent.fetchFromSource(source)

        for (const rawContent of rawContents) {
          // 2. 质量评估
          const qualityScore = await this.qualityAgent.assessQuality(rawContent)
          
          // 3. 重复检测
          const isDuplicate = await this.qualityAgent.detectDuplicates(rawContent, this.processedContent)
          
          if (qualityScore > 0.6 && !isDuplicate) {
            // 4. 内容处理和增强
            const processedContent = await this.processingAgent.processContent(rawContent)
            processedContent.qualityScore = qualityScore

            // 5. 向量化并存储到RAG引擎
            await ragEngine.processDocument(processedContent)

            newContent.push(processedContent)
            this.processedContent.push(processedContent)
          }
        }

        // 更新数据源的最后更新时间
        source.lastUpdated = new Date()

      } catch (error) {
        console.error(`数据源 ${source.name} 更新失败:`, error)
      }
    }

    console.log(`✅ 内容更新完成，新增 ${newContent.length} 篇内容`)
    return newContent
  }

  // 获取数据源状态
  public getDataSourceStatus() {
    const sources = Array.from(this.dataSources.values())
    
    return {
      total: sources.length,
      active: sources.filter(s => s.isActive).length,
      byCategory: sources.reduce((acc, source) => {
        acc[source.category] = (acc[source.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averageQuality: sources.reduce((sum, s) => sum + s.metadata.qualityScore, 0) / sources.length,
      lastUpdated: Math.max(...sources.map(s => s.lastUpdated.getTime())),
      totalContent: this.processedContent.length
    }
  }

  // 添加新数据源
  public addDataSource(source: Omit<DataSource, 'id' | 'lastUpdated'>): string {
    const id = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSource: DataSource = {
      ...source,
      id,
      lastUpdated: new Date()
    }
    
    this.dataSources.set(id, newSource)
    console.log(`➕ 添加新数据源: ${source.name}`)
    
    return id
  }

  // 获取处理后的内容
  public getProcessedContent(limit?: number): ProcessedContent[] {
    const sorted = this.processedContent
      .sort((a, b) => b.processedAt.getTime() - a.processedAt.getTime())
    
    return limit ? sorted.slice(0, limit) : sorted
  }

  // 获取统计信息
  public getStats() {
    return {
      dataSources: this.getDataSourceStatus(),
      ragEngine: ragEngine.getStats(),
      processing: {
        totalProcessed: this.processedContent.length,
        averageQuality: this.processedContent.reduce((sum, c) => sum + c.qualityScore, 0) / this.processedContent.length,
        categoryDistribution: this.processedContent.reduce((acc, content) => {
          acc[content.category] = (acc[content.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      lastUpdated: new Date().toISOString()
    }
  }
}

// 导出单例实例
export const aiDataSourceManager = AIDataSourceManager.getInstance()
