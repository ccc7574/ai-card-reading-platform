// AI Agent驱动的智能推荐系统
import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ragEngine } from './rag-engine'

export interface UserProfile {
  userId: string
  interests: string[]
  expertise: string[]
  readingHistory: string[]
  preferences: {
    difficulty: string[]
    categories: string[]
    sources: string[]
    readingTime: number[]
  }
  behavior: {
    clickThroughRate: number
    engagementScore: number
    shareFrequency: number
    bookmarkRate: number
  }
  context: {
    currentGoals: string[]
    learningPath: string[]
    timeOfDay: string
    device: string
  }
  lastUpdated: Date
}

export interface RecommendationRequest {
  userId: string
  context?: {
    currentCard?: string
    sessionHistory?: string[]
    timeContext?: string
    intent?: 'explore' | 'learn' | 'research' | 'casual'
  }
  constraints?: {
    maxResults?: number
    excludeIds?: string[]
    requiredCategories?: string[]
    timeLimit?: number
  }
}

export interface AgentRecommendation {
  cardId: string
  score: number
  reasoning: string
  confidence: number
  agentType: string
  metadata: {
    relevanceFactors: string[]
    learningValue: number
    novelty: number
    difficulty: string
    estimatedEngagement: number
  }
}

export interface RecommendationResponse {
  recommendations: AgentRecommendation[]
  explanation: string
  strategy: string
  diversity: number
  totalProcessingTime: number
  agentContributions: Record<string, number>
}

// 专业推荐Agent基类
abstract class RecommendationAgent {
  protected openai: OpenAI
  protected gemini: GoogleGenerativeAI
  protected name: string
  protected specialty: string

  constructor(name: string, specialty: string) {
    this.name = name
    this.specialty = specialty
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  }

  abstract generateRecommendations(
    userProfile: UserProfile,
    request: RecommendationRequest,
    availableCards: any[]
  ): Promise<AgentRecommendation[]>

  protected async analyzeUserIntent(userProfile: UserProfile, context?: any): Promise<string> {
    try {
      const prompt = `
作为用户意图分析专家，分析用户的当前意图：

用户档案:
- 兴趣: ${userProfile.interests.join(', ')}
- 专业领域: ${userProfile.expertise.join(', ')}
- 偏好难度: ${userProfile.preferences.difficulty.join(', ')}
- 当前目标: ${userProfile.context.currentGoals.join(', ')}

上下文:
${context ? JSON.stringify(context) : '无特定上下文'}

请分析用户的主要意图，返回以下之一：
- "深度学习": 用户想要深入学习某个主题
- "探索发现": 用户想要发现新的有趣内容
- "技能提升": 用户想要提升特定技能
- "快速浏览": 用户想要快速获取信息
- "研究调研": 用户在进行专业研究

只返回意图类型，不要其他内容。
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      return response.choices[0].message.content || '探索发现'

    } catch (error) {
      console.error(`${this.name} 意图分析失败:`, error)
      return '探索发现'
    }
  }

  protected calculateRelevanceScore(card: any, userProfile: UserProfile): number {
    let score = 0

    // 兴趣匹配
    const interestMatch = userProfile.interests.some(interest => 
      card.tags.some((tag: string) => tag.toLowerCase().includes(interest.toLowerCase()))
    )
    if (interestMatch) score += 0.3

    // 专业领域匹配
    const expertiseMatch = userProfile.expertise.some(expertise => 
      card.category.toLowerCase().includes(expertise.toLowerCase())
    )
    if (expertiseMatch) score += 0.25

    // 难度匹配
    if (userProfile.preferences.difficulty.includes(card.difficulty)) {
      score += 0.2
    }

    // 分类偏好
    if (userProfile.preferences.categories.includes(card.category)) {
      score += 0.15
    }

    // 阅读时间匹配
    const timeMatch = userProfile.preferences.readingTime.some(time => 
      Math.abs(time - card.readingTime) <= 2
    )
    if (timeMatch) score += 0.1

    return Math.min(score, 1)
  }
}

// 内容相似性推荐Agent
class ContentSimilarityAgent extends RecommendationAgent {
  constructor() {
    super('ContentSimilarityAgent', '基于内容相似性的推荐')
  }

  async generateRecommendations(
    userProfile: UserProfile,
    request: RecommendationRequest,
    availableCards: any[]
  ): Promise<AgentRecommendation[]> {
    console.log(`🤖 ${this.name} 开始分析...`)

    try {
      const recommendations: AgentRecommendation[] = []

      // 如果有当前卡片，基于相似性推荐
      if (request.context?.currentCard) {
        const similarCards = await this.findSimilarContent(
          request.context.currentCard,
          availableCards,
          5
        )

        for (const card of similarCards) {
          const relevanceScore = this.calculateRelevanceScore(card, userProfile)
          const reasoning = await this.generateReasoning(card, userProfile, 'similarity')

          recommendations.push({
            cardId: card.id,
            score: relevanceScore * 0.9, // 相似性推荐权重
            reasoning,
            confidence: 0.8,
            agentType: this.name,
            metadata: {
              relevanceFactors: ['content_similarity', 'topic_relevance'],
              learningValue: this.calculateLearningValue(card, userProfile),
              novelty: 0.6, // 相似内容新颖性较低
              difficulty: card.difficulty,
              estimatedEngagement: relevanceScore * 0.8
            }
          })
        }
      }

      return recommendations

    } catch (error) {
      console.error(`${this.name} 推荐失败:`, error)
      return []
    }
  }

  private async findSimilarContent(currentCardId: string, availableCards: any[], limit: number): Promise<any[]> {
    // 使用RAG引擎进行相似性搜索
    const currentCard = availableCards.find(card => card.id === currentCardId)
    if (!currentCard) return []

    try {
      const ragResponse = await ragEngine.search({
        query: `${currentCard.title} ${currentCard.summary}`,
        options: { topK: limit + 1, rerank: true }
      })

      // 排除当前卡片
      return ragResponse.results
        .filter(doc => doc.id !== currentCardId)
        .slice(0, limit)
        .map(doc => availableCards.find(card => card.id === doc.id))
        .filter(Boolean)

    } catch (error) {
      console.error('相似内容搜索失败:', error)
      return []
    }
  }

  private async generateReasoning(card: any, userProfile: UserProfile, type: string): Promise<string> {
    try {
      const prompt = `
为推荐解释生成简洁的理由：

推荐类型: ${type}
卡片标题: ${card.title}
用户兴趣: ${userProfile.interests.join(', ')}
用户专业: ${userProfile.expertise.join(', ')}

生成一句话的推荐理由，说明为什么推荐这个内容。
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      })

      return response.choices[0].message.content || '基于您的兴趣和阅读偏好推荐'

    } catch (error) {
      return '基于内容相似性和用户偏好推荐'
    }
  }

  private calculateLearningValue(card: any, userProfile: UserProfile): number {
    // 基于用户专业水平和内容难度计算学习价值
    const userLevel = userProfile.expertise.length > 0 ? 0.7 : 0.3
    const contentComplexity = card.difficulty === 'advanced' ? 0.9 : 
                             card.difficulty === 'intermediate' ? 0.6 : 0.3
    
    return Math.abs(contentComplexity - userLevel) < 0.3 ? 0.8 : 0.5
  }
}

// 趋势发现推荐Agent
class TrendDiscoveryAgent extends RecommendationAgent {
  constructor() {
    super('TrendDiscoveryAgent', '趋势发现和热门内容推荐')
  }

  async generateRecommendations(
    userProfile: UserProfile,
    request: RecommendationRequest,
    availableCards: any[]
  ): Promise<AgentRecommendation[]> {
    console.log(`🤖 ${this.name} 开始分析...`)

    try {
      const recommendations: AgentRecommendation[] = []

      // 分析当前趋势
      const trendingTopics = await this.analyzeTrends(availableCards)
      
      // 基于趋势推荐内容
      for (const card of availableCards.slice(0, 10)) {
        const trendScore = this.calculateTrendScore(card, trendingTopics)
        const relevanceScore = this.calculateRelevanceScore(card, userProfile)
        
        if (trendScore > 0.5 && relevanceScore > 0.3) {
          const reasoning = await this.generateTrendReasoning(card, trendingTopics)

          recommendations.push({
            cardId: card.id,
            score: (trendScore * 0.6 + relevanceScore * 0.4),
            reasoning,
            confidence: 0.7,
            agentType: this.name,
            metadata: {
              relevanceFactors: ['trending_topic', 'user_interest'],
              learningValue: 0.7,
              novelty: 0.9, // 趋势内容新颖性高
              difficulty: card.difficulty,
              estimatedEngagement: trendScore * 0.9
            }
          })
        }
      }

      return recommendations.slice(0, 5) // 限制趋势推荐数量

    } catch (error) {
      console.error(`${this.name} 推荐失败:`, error)
      return []
    }
  }

  private async analyzeTrends(cards: any[]): Promise<string[]> {
    try {
      const recentCards = cards
        .filter(card => {
          const daysSince = (Date.now() - new Date(card.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
          return daysSince <= 7 // 最近7天的内容
        })
        .slice(0, 20)

      const prompt = `
分析以下最近发布的内容，识别当前的热门趋势主题：

内容列表:
${recentCards.map(card => `- ${card.title} (${card.category})`).join('\n')}

请识别3-5个当前的热门趋势主题，返回JSON数组格式：
["趋势主题1", "趋势主题2", ...]

要求：
1. 识别重复出现的主题
2. 关注新兴技术和概念
3. 考虑跨领域的热点
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })

      const trends = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(trends) ? trends : []

    } catch (error) {
      console.error('趋势分析失败:', error)
      return ['AI', '机器学习', '区块链', '云计算', '数据科学']
    }
  }

  private calculateTrendScore(card: any, trendingTopics: string[]): number {
    let score = 0

    // 检查标题和标签中的趋势主题
    for (const trend of trendingTopics) {
      if (card.title.toLowerCase().includes(trend.toLowerCase()) ||
          card.tags.some((tag: string) => tag.toLowerCase().includes(trend.toLowerCase()))) {
        score += 0.3
      }
    }

    // 发布时间新鲜度
    const daysSince = (Date.now() - new Date(card.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
    const freshnessScore = Math.max(0, 1 - daysSince / 30) // 30天内的内容
    score += freshnessScore * 0.4

    return Math.min(score, 1)
  }

  private async generateTrendReasoning(card: any, trends: string[]): Promise<string> {
    const matchingTrends = trends.filter(trend => 
      card.title.toLowerCase().includes(trend.toLowerCase()) ||
      card.tags.some((tag: string) => tag.toLowerCase().includes(trend.toLowerCase()))
    )

    if (matchingTrends.length > 0) {
      return `正在关注热门趋势：${matchingTrends[0]}，这是当前的热点话题`
    }

    return '这是最近发布的热门内容，值得关注'
  }
}

// 个性化学习路径Agent
class LearningPathAgent extends RecommendationAgent {
  constructor() {
    super('LearningPathAgent', '个性化学习路径推荐')
  }

  async generateRecommendations(
    userProfile: UserProfile,
    request: RecommendationRequest,
    availableCards: any[]
  ): Promise<AgentRecommendation[]> {
    console.log(`🤖 ${this.name} 开始分析...`)

    try {
      const recommendations: AgentRecommendation[] = []

      // 分析用户的学习路径
      const learningPath = await this.generateLearningPath(userProfile, availableCards)
      
      // 推荐学习路径中的下一步内容
      for (const step of learningPath.slice(0, 3)) {
        const card = availableCards.find(c => c.id === step.cardId)
        if (card) {
          recommendations.push({
            cardId: card.id,
            score: step.priority,
            reasoning: step.reasoning,
            confidence: 0.85,
            agentType: this.name,
            metadata: {
              relevanceFactors: ['learning_progression', 'skill_building'],
              learningValue: 0.9,
              novelty: 0.7,
              difficulty: card.difficulty,
              estimatedEngagement: step.priority * 0.8
            }
          })
        }
      }

      return recommendations

    } catch (error) {
      console.error(`${this.name} 推荐失败:`, error)
      return []
    }
  }

  private async generateLearningPath(userProfile: UserProfile, availableCards: any[]): Promise<any[]> {
    try {
      const prompt = `
作为学习路径规划专家，为用户设计个性化学习路径：

用户档案:
- 当前专业: ${userProfile.expertise.join(', ')}
- 学习目标: ${userProfile.context.currentGoals.join(', ')}
- 偏好难度: ${userProfile.preferences.difficulty.join(', ')}
- 阅读历史: ${userProfile.readingHistory.slice(-5).join(', ')}

可用内容:
${availableCards.slice(0, 20).map(card => 
  `ID: ${card.id}, 标题: ${card.title}, 难度: ${card.difficulty}, 分类: ${card.category}`
).join('\n')}

请设计一个3-5步的学习路径，返回JSON格式：
[
  {
    "cardId": "卡片ID",
    "priority": 0.8,
    "reasoning": "推荐理由",
    "step": 1
  }
]

要求：
1. 考虑知识的递进性
2. 平衡难度梯度
3. 符合用户目标
4. 优先级0-1之间
`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      })

      const path = JSON.parse(response.choices[0].message.content || '[]')
      return Array.isArray(path) ? path : []

    } catch (error) {
      console.error('学习路径生成失败:', error)
      return []
    }
  }
}

// 智能推荐系统协调器
export class AIRecommendationSystem {
  private static instance: AIRecommendationSystem
  private agents: RecommendationAgent[]
  private userProfiles = new Map<string, UserProfile>()

  private constructor() {
    this.agents = [
      new ContentSimilarityAgent(),
      new TrendDiscoveryAgent(),
      new LearningPathAgent()
    ]
  }

  public static getInstance(): AIRecommendationSystem {
    if (!AIRecommendationSystem.instance) {
      AIRecommendationSystem.instance = new AIRecommendationSystem()
    }
    return AIRecommendationSystem.instance
  }

  // 生成智能推荐
  public async generateRecommendations(
    request: RecommendationRequest,
    availableCards: any[]
  ): Promise<RecommendationResponse> {
    const startTime = Date.now()
    
    try {
      console.log(`🧠 AI推荐系统开始为用户 ${request.userId} 生成推荐`)

      // 获取或创建用户档案
      const userProfile = await this.getUserProfile(request.userId)

      // 并行执行所有Agent
      const agentPromises = this.agents.map(agent => 
        agent.generateRecommendations(userProfile, request, availableCards)
      )

      const agentResults = await Promise.all(agentPromises)

      // 合并和排序推荐结果
      const allRecommendations = agentResults.flat()
      const mergedRecommendations = this.mergeRecommendations(allRecommendations)

      // 多样性优化
      const diversifiedRecommendations = this.optimizeDiversity(
        mergedRecommendations, 
        request.constraints?.maxResults || 10
      )

      // 生成解释和策略
      const explanation = await this.generateExplanation(diversifiedRecommendations, userProfile)
      const strategy = this.determineStrategy(agentResults)

      // 计算Agent贡献度
      const agentContributions = this.calculateAgentContributions(agentResults)

      const response: RecommendationResponse = {
        recommendations: diversifiedRecommendations,
        explanation,
        strategy,
        diversity: this.calculateDiversity(diversifiedRecommendations),
        totalProcessingTime: Date.now() - startTime,
        agentContributions
      }

      console.log(`✅ AI推荐完成: ${response.recommendations.length} 个推荐`)
      return response

    } catch (error) {
      console.error('AI推荐系统失败:', error)
      throw error
    }
  }

  // 获取用户档案
  private async getUserProfile(userId: string): Promise<UserProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!
    }

    // 创建默认用户档案
    const defaultProfile: UserProfile = {
      userId,
      interests: ['AI', '技术', '学习'],
      expertise: [],
      readingHistory: [],
      preferences: {
        difficulty: ['intermediate'],
        categories: ['tech', 'ai'],
        sources: [],
        readingTime: [5, 10, 15]
      },
      behavior: {
        clickThroughRate: 0.5,
        engagementScore: 0.5,
        shareFrequency: 0.3,
        bookmarkRate: 0.4
      },
      context: {
        currentGoals: ['学习新技术'],
        learningPath: [],
        timeOfDay: 'morning',
        device: 'desktop'
      },
      lastUpdated: new Date()
    }

    this.userProfiles.set(userId, defaultProfile)
    return defaultProfile
  }

  // 合并推荐结果
  private mergeRecommendations(recommendations: AgentRecommendation[]): AgentRecommendation[] {
    const merged = new Map<string, AgentRecommendation>()

    for (const rec of recommendations) {
      if (merged.has(rec.cardId)) {
        const existing = merged.get(rec.cardId)!
        // 合并分数（加权平均）
        existing.score = (existing.score + rec.score) / 2
        existing.confidence = Math.max(existing.confidence, rec.confidence)
        existing.reasoning += ` | ${rec.reasoning}`
      } else {
        merged.set(rec.cardId, { ...rec })
      }
    }

    return Array.from(merged.values()).sort((a, b) => b.score - a.score)
  }

  // 优化多样性
  private optimizeDiversity(recommendations: AgentRecommendation[], maxResults: number): AgentRecommendation[] {
    const selected: AgentRecommendation[] = []
    const categories = new Set<string>()
    const sources = new Set<string>()

    for (const rec of recommendations) {
      if (selected.length >= maxResults) break

      // 简单的多样性检查（实际实现中可以更复杂）
      const shouldAdd = selected.length < maxResults / 2 || 
                       categories.size < 3 || 
                       sources.size < 3

      if (shouldAdd) {
        selected.push(rec)
        categories.add(rec.metadata.difficulty)
        // sources.add(rec.metadata.source) // 需要从卡片数据获取
      }
    }

    return selected
  }

  // 生成解释
  private async generateExplanation(recommendations: AgentRecommendation[], userProfile: UserProfile): Promise<string> {
    const strategies = recommendations.map(r => r.agentType).slice(0, 3)
    return `基于您的兴趣和学习目标，我们使用了${strategies.length}种AI策略为您精选了这些内容`
  }

  // 确定策略
  private determineStrategy(agentResults: AgentRecommendation[][]): string {
    const totalResults = agentResults.reduce((sum, results) => sum + results.length, 0)
    if (totalResults === 0) return 'fallback'
    
    const maxResults = Math.max(...agentResults.map(results => results.length))
    const dominantAgent = agentResults.findIndex(results => results.length === maxResults)
    
    return ['content_similarity', 'trend_discovery', 'learning_path'][dominantAgent] || 'hybrid'
  }

  // 计算Agent贡献度
  private calculateAgentContributions(agentResults: AgentRecommendation[][]): Record<string, number> {
    const contributions: Record<string, number> = {}
    const totalResults = agentResults.reduce((sum, results) => sum + results.length, 0)

    agentResults.forEach((results, index) => {
      const agentName = ['ContentSimilarity', 'TrendDiscovery', 'LearningPath'][index]
      contributions[agentName] = totalResults > 0 ? results.length / totalResults : 0
    })

    return contributions
  }

  // 计算多样性
  private calculateDiversity(recommendations: AgentRecommendation[]): number {
    if (recommendations.length === 0) return 0

    const difficulties = new Set(recommendations.map(r => r.metadata.difficulty))
    const agentTypes = new Set(recommendations.map(r => r.agentType))
    
    return (difficulties.size + agentTypes.size) / (recommendations.length * 2)
  }

  // 更新用户档案
  public updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const profile = this.userProfiles.get(userId)
    if (profile) {
      Object.assign(profile, updates)
      profile.lastUpdated = new Date()
    }
  }

  // 获取系统统计
  public getStats() {
    return {
      totalUsers: this.userProfiles.size,
      activeAgents: this.agents.length,
      agentTypes: this.agents.map(agent => agent.constructor.name),
      lastUpdated: new Date().toISOString()
    }
  }
}

// 导出单例实例
export const aiRecommendationSystem = AIRecommendationSystem.getInstance()
