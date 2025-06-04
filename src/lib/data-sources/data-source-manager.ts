import { nanoid } from 'nanoid'

// 数据源配置
export interface DataSource {
  id: string
  name: string
  url: string
  category: 'tech' | 'ai' | 'business' | 'design' | 'science'
  priority: number
  lastFetched?: Date
  isActive: boolean
  fetchInterval: number // 小时
  description: string
}

// 获取的内容项
export interface ContentItem {
  id: string
  title: string
  url: string
  summary: string
  publishDate: Date
  author?: string
  category: string
  sourceId: string
  sourceName: string
  imageUrl?: string
  tags: string[]
  readingTime: number
  quality: number
  trending: boolean
  fetchedAt: Date
}

// 数据源管理器
export class DataSourceManager {
  private static instance: DataSourceManager | null = null
  private dataSources: Map<string, DataSource> = new Map()
  private contentItems: Map<string, ContentItem> = new Map()
  private fetchTimer: NodeJS.Timeout | null = null

  static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager()
    }
    return DataSourceManager.instance
  }

  constructor() {
    this.initializeDefaultSources()
    this.startPeriodicFetch()
  }

  // 初始化默认数据源
  private initializeDefaultSources() {
    const defaultSources: Omit<DataSource, 'id'>[] = [
      // 原有数据源
      {
        name: 'Hacker News',
        url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
        category: 'tech',
        priority: 1,
        isActive: true,
        fetchInterval: 1,
        description: '技术社区热门内容'
      },
      {
        name: 'Product Hunt',
        url: 'https://api.producthunt.com/v2/api/graphql',
        category: 'tech',
        priority: 2,
        isActive: true,
        fetchInterval: 2,
        description: '最新产品和创新'
      },
      {
        name: 'AI News',
        url: 'https://feeds.feedburner.com/oreilly/radar',
        category: 'ai',
        priority: 1,
        isActive: true,
        fetchInterval: 1,
        description: 'AI和机器学习最新动态'
      },
      {
        name: 'Design Inspiration',
        url: 'https://dribbble.com/shots/popular.rss',
        category: 'design',
        priority: 3,
        isActive: true,
        fetchInterval: 3,
        description: '设计灵感和趋势'
      },
      {
        name: 'Business Insights',
        url: 'https://hbr.org/feed',
        category: 'business',
        priority: 2,
        isActive: true,
        fetchInterval: 2,
        description: '商业洞察和管理思维'
      },

      // 新增技术媒体数据源
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        category: 'tech',
        priority: 1,
        isActive: true,
        fetchInterval: 1,
        description: '全球科技创业和投资资讯'
      },
      {
        name: 'Wired',
        url: 'https://www.wired.com/feed/rss',
        category: 'tech',
        priority: 2,
        isActive: true,
        fetchInterval: 2,
        description: '科技文化和未来趋势'
      },
      {
        name: 'MIT Technology Review',
        url: 'https://www.technologyreview.com/feed/',
        category: 'tech',
        priority: 1,
        isActive: true,
        fetchInterval: 2,
        description: 'MIT技术评论和深度分析'
      },

      // 新增AI专业数据源
      {
        name: 'AI Research',
        url: 'https://arxiv.org/rss/cs.AI',
        category: 'ai',
        priority: 1,
        isActive: true,
        fetchInterval: 3,
        description: 'arXiv AI研究论文'
      },
      {
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss.xml',
        category: 'ai',
        priority: 1,
        isActive: true,
        fetchInterval: 6,
        description: 'OpenAI官方博客和研究'
      },
      {
        name: 'Google AI Blog',
        url: 'https://ai.googleblog.com/feeds/posts/default',
        category: 'ai',
        priority: 1,
        isActive: true,
        fetchInterval: 6,
        description: 'Google AI研究和产品'
      },

      // 新增设计数据源
      {
        name: 'Behance',
        url: 'https://www.behance.net/feeds/projects',
        category: 'design',
        priority: 2,
        isActive: true,
        fetchInterval: 4,
        description: 'Adobe Behance创意作品'
      },
      {
        name: 'Awwwards',
        url: 'https://www.awwwards.com/rss-feed/',
        category: 'design',
        priority: 2,
        isActive: true,
        fetchInterval: 6,
        description: '优秀网页设计奖项'
      },

      // 新增商业数据源
      {
        name: 'McKinsey Insights',
        url: 'https://www.mckinsey.com/featured-insights/rss',
        category: 'business',
        priority: 1,
        isActive: true,
        fetchInterval: 6,
        description: '麦肯锡商业洞察'
      },
      {
        name: 'Fast Company',
        url: 'https://www.fastcompany.com/rss.xml',
        category: 'business',
        priority: 2,
        isActive: true,
        fetchInterval: 3,
        description: '创新商业和设计思维'
      },

      // 新增科学数据源
      {
        name: 'Nature News',
        url: 'https://www.nature.com/nature.rss',
        category: 'science',
        priority: 1,
        isActive: true,
        fetchInterval: 6,
        description: 'Nature科学期刊新闻'
      },
      {
        name: 'Science Daily',
        url: 'https://www.sciencedaily.com/rss/all.xml',
        category: 'science',
        priority: 2,
        isActive: true,
        fetchInterval: 4,
        description: '最新科学研究发现'
      }
    ]

    defaultSources.forEach(source => {
      const id = nanoid()
      this.dataSources.set(id, { ...source, id })
    })

    console.log(`📊 初始化 ${this.dataSources.size} 个数据源`)
  }

  // 开始定期获取
  private startPeriodicFetch() {
    // 立即执行一次
    this.fetchAllSources()

    // 每小时检查一次
    this.fetchTimer = setInterval(() => {
      this.fetchAllSources()
    }, 60 * 60 * 1000) // 1小时

    console.log('🔄 启动定期数据获取 (每小时)')
  }

  // 获取所有数据源
  private async fetchAllSources() {
    console.log('🔄 开始获取最新数据源内容')
    
    const now = new Date()
    const promises = []

    for (const [, source] of this.dataSources) {
      if (!source.isActive) continue

      // 检查是否需要更新
      const shouldFetch = !source.lastFetched || 
        (now.getTime() - source.lastFetched.getTime()) >= (source.fetchInterval * 60 * 60 * 1000)

      if (shouldFetch) {
        promises.push(this.fetchSourceContent(source))
      }
    }

    try {
      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      console.log(`✅ 数据源更新完成: ${successful} 成功, ${failed} 失败`)
    } catch (error) {
      console.error('❌ 数据源批量更新失败:', error)
    }
  }

  // 获取单个数据源内容
  private async fetchSourceContent(source: DataSource): Promise<void> {
    try {
      console.log(`📡 获取数据源: ${source.name}`)

      let items: ContentItem[] = []

      switch (source.category) {
        case 'tech':
          items = await this.fetchTechContent(source)
          break
        case 'ai':
          items = await this.fetchAIContent(source)
          break
        case 'business':
          items = await this.fetchBusinessContent(source)
          break
        case 'design':
          items = await this.fetchDesignContent(source)
          break
        default:
          items = await this.fetchGenericContent(source)
      }

      // 存储内容项
      items.forEach(item => {
        this.contentItems.set(item.id, item)
      })

      // 更新数据源状态
      source.lastFetched = new Date()
      
      console.log(`✅ ${source.name}: 获取 ${items.length} 个内容项`)

    } catch (error) {
      console.error(`❌ 获取数据源失败 ${source.name}:`, error)
    }
  }

  // 获取技术内容
  private async fetchTechContent(source: DataSource): Promise<ContentItem[]> {
    // 模拟技术内容获取
    return this.generateMockContent(source, [
      'AI驱动的代码生成工具革命',
      '云原生架构的最佳实践',
      '前端框架性能优化指南',
      '微服务架构设计模式',
      '区块链技术在金融领域的应用'
    ])
  }

  // 获取AI内容
  private async fetchAIContent(source: DataSource): Promise<ContentItem[]> {
    return this.generateMockContent(source, [
      'GPT-4在企业级应用中的实践',
      '多模态AI模型的突破性进展',
      'AI Agent协作系统设计',
      '机器学习模型的可解释性',
      '自然语言处理的最新突破'
    ])
  }

  // 获取商业内容
  private async fetchBusinessContent(source: DataSource): Promise<ContentItem[]> {
    return this.generateMockContent(source, [
      '数字化转型的成功策略',
      '远程工作时代的管理创新',
      '可持续发展的商业模式',
      '客户体验优化的关键要素',
      '创新文化的构建与维护'
    ])
  }

  // 获取设计内容
  private async fetchDesignContent(source: DataSource): Promise<ContentItem[]> {
    return this.generateMockContent(source, [
      '2024年UI设计趋势预测',
      '用户体验设计的心理学原理',
      '无障碍设计的最佳实践',
      '品牌视觉识别系统设计',
      '交互设计中的微动效应用'
    ])
  }

  // 获取通用内容
  private async fetchGenericContent(source: DataSource): Promise<ContentItem[]> {
    return this.generateMockContent(source, [
      '科技创新改变生活方式',
      '未来工作模式的演变',
      '可持续发展的全球趋势',
      '教育技术的创新应用',
      '健康科技的最新进展'
    ])
  }

  // 生成模拟内容
  private generateMockContent(source: DataSource, titles: string[]): ContentItem[] {
    return titles.map(title => ({
      id: nanoid(),
      title,
      url: `https://example.com/${nanoid()}`,
      summary: `${title}的深度分析和实践指南，探讨其在当前技术环境下的应用价值和发展前景。`,
      publishDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 最近7天
      author: this.getRandomAuthor(),
      category: source.category,
      sourceId: source.id,
      sourceName: source.name,
      imageUrl: this.generateImageUrl(),
      tags: this.generateTags(source.category),
      readingTime: Math.ceil(Math.random() * 10) + 3, // 3-13分钟
      quality: Math.random() * 0.3 + 0.7, // 0.7-1.0
      trending: Math.random() > 0.7,
      fetchedAt: new Date()
    }))
  }

  // 获取随机作者
  private getRandomAuthor(): string {
    const authors = [
      'Alex Chen', 'Sarah Johnson', 'Michael Zhang', 'Emily Davis',
      'David Kim', 'Lisa Wang', 'James Wilson', 'Anna Liu',
      'Robert Brown', 'Maria Garcia', 'Kevin Lee', 'Jennifer Taylor'
    ]
    return authors[Math.floor(Math.random() * authors.length)]
  }

  // 生成图片URL
  private generateImageUrl(): string {
    const imageIds = [
      'tech-innovation', 'ai-future', 'business-growth', 'design-trends',
      'digital-transformation', 'user-experience', 'data-science', 'cloud-computing'
    ]
    const imageId = imageIds[Math.floor(Math.random() * imageIds.length)]
    return `https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop&crop=center&auto=format&q=80&sig=${imageId}`
  }

  // 生成标签
  private generateTags(category: string): string[] {
    const tagMap: Record<string, string[]> = {
      tech: ['技术', '创新', '开发', '架构', '性能'],
      ai: ['人工智能', '机器学习', '深度学习', '自然语言处理', 'AI应用'],
      business: ['商业策略', '管理', '创新', '数字化', '增长'],
      design: ['设计', '用户体验', '界面', '视觉', '交互'],
      science: ['科学', '研究', '技术', '创新', '发现']
    }

    const baseTags = tagMap[category] || tagMap.tech
    const selectedTags = baseTags.slice(0, Math.floor(Math.random() * 3) + 2)
    return selectedTags
  }

  // 公共方法
  
  // 获取最新内容
  getLatestContent(limit: number = 20): ContentItem[] {
    const items = Array.from(this.contentItems.values())
    return items
      .sort((a, b) => b.fetchedAt.getTime() - a.fetchedAt.getTime())
      .slice(0, limit)
  }

  // 获取热门内容
  getTrendingContent(limit: number = 10): ContentItem[] {
    const items = Array.from(this.contentItems.values())
    return items
      .filter(item => item.trending)
      .sort((a, b) => b.quality - a.quality)
      .slice(0, limit)
  }

  // 按分类获取内容
  getContentByCategory(category: string, limit: number = 10): ContentItem[] {
    const items = Array.from(this.contentItems.values())
    return items
      .filter(item => item.category === category)
      .sort((a, b) => b.fetchedAt.getTime() - a.fetchedAt.getTime())
      .slice(0, limit)
  }

  // 获取数据源状态
  getDataSourceStatus() {
    const sources = Array.from(this.dataSources.values())
    return {
      total: sources.length,
      active: sources.filter(s => s.isActive).length,
      lastUpdate: Math.max(...sources.map(s => s.lastFetched?.getTime() || 0)),
      contentCount: this.contentItems.size
    }
  }

  // 手动刷新
  async refreshAll(): Promise<void> {
    await this.fetchAllSources()
  }

  // 清理
  cleanup() {
    if (this.fetchTimer) {
      clearInterval(this.fetchTimer)
      this.fetchTimer = null
    }
  }
}
