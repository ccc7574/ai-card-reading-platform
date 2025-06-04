// 高级推荐算法引擎
import { Card as CardType } from '@/types'
import { InteractionService } from './database'

export interface UserVector {
  userId: string
  preferences: number[] // 用户偏好向量
  interactions: Record<string, number> // 卡片ID -> 交互分数
  lastUpdated: Date
}

export interface ContentVector {
  cardId: string
  features: number[] // 内容特征向量
  category: string
  tags: string[]
  lastUpdated: Date
}

export interface CollaborativeFilteringResult {
  recommendations: CardType[]
  similarUsers: string[]
  confidence: number
}

export class AdvancedRecommendationEngine {
  private static userVectors = new Map<string, UserVector>()
  private static contentVectors = new Map<string, ContentVector>()
  private static userSimilarityCache = new Map<string, Map<string, number>>()

  // 初始化向量空间
  static async initializeVectorSpace(users: string[], cards: CardType[]) {
    console.log('🧠 初始化高级推荐向量空间...')
    
    // 初始化内容向量
    for (const card of cards) {
      await this.generateContentVector(card)
    }
    
    // 初始化用户向量
    for (const userId of users) {
      await this.generateUserVector(userId, cards)
    }
    
    console.log(`✅ 向量空间初始化完成 - 用户: ${users.length}, 内容: ${cards.length}`)
  }

  // 生成内容特征向量
  static async generateContentVector(card: CardType): Promise<ContentVector> {
    const features: number[] = []
    
    // 1. 分类特征 (10维)
    const categories = ['tech', 'ai', 'business', 'design', 'science', 'programming', 'product', 'marketing', 'data', 'other']
    const categoryVector = categories.map(cat => card.category === cat ? 1 : 0)
    features.push(...categoryVector)
    
    // 2. 标签特征 (20维) - 使用TF-IDF权重
    const commonTags = [
      'AI', '技术', '产品', '设计', '商业', '创新', '开发', '数据', '用户体验', '机器学习',
      '深度学习', '算法', '架构', '性能', '安全', '移动端', '前端', '后端', '云计算', '区块链'
    ]
    const tagVector = commonTags.map(tag => {
      const count = card.tags.filter(cardTag => 
        cardTag.toLowerCase().includes(tag.toLowerCase()) || 
        tag.toLowerCase().includes(cardTag.toLowerCase())
      ).length
      return count > 0 ? Math.log(1 + count) : 0
    })
    features.push(...tagVector)
    
    // 3. 内容长度特征 (5维)
    const readingTimeFeatures = [
      card.readingTime <= 2 ? 1 : 0,  // 短文
      card.readingTime <= 5 ? 1 : 0,  // 中短文
      card.readingTime <= 10 ? 1 : 0, // 中等文
      card.readingTime <= 20 ? 1 : 0, // 长文
      card.readingTime > 20 ? 1 : 0   // 超长文
    ]
    features.push(...readingTimeFeatures)
    
    // 4. 难度特征 (4维)
    const difficulties = ['beginner', 'intermediate', 'advanced', 'expert']
    const difficultyVector = difficulties.map(diff => card.difficulty === diff ? 1 : 0)
    features.push(...difficultyVector)
    
    // 5. 时间特征 (7维) - 发布时间的周期性特征
    const publishDate = new Date(card.publishedAt)
    const timeFeatures = [
      Math.sin(2 * Math.PI * publishDate.getDay() / 7), // 周几
      Math.cos(2 * Math.PI * publishDate.getDay() / 7),
      Math.sin(2 * Math.PI * publishDate.getHours() / 24), // 小时
      Math.cos(2 * Math.PI * publishDate.getHours() / 24),
      Math.sin(2 * Math.PI * publishDate.getMonth() / 12), // 月份
      Math.cos(2 * Math.PI * publishDate.getMonth() / 12),
      (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24 * 365) // 年龄（年）
    ]
    features.push(...timeFeatures)
    
    // 6. 质量特征 (5维)
    const qualityFeatures = [
      card.summary.length / 1000, // 摘要长度
      card.tags.length / 10, // 标签数量
      card.author ? 1 : 0, // 是否有作者
      card.imageUrl ? 1 : 0, // 是否有图片
      Math.random() * 0.1 // 随机噪声
    ]
    features.push(...qualityFeatures)
    
    // 归一化特征向量
    const normalizedFeatures = this.normalizeVector(features)
    
    const contentVector: ContentVector = {
      cardId: card.id,
      features: normalizedFeatures,
      category: card.category,
      tags: card.tags,
      lastUpdated: new Date()
    }
    
    this.contentVectors.set(card.id, contentVector)
    return contentVector
  }

  // 生成用户偏好向量
  static async generateUserVector(userId: string, cards: CardType[]): Promise<UserVector> {
    try {
      // 获取用户交互历史
      const cardIds = cards.map(card => card.id)
      const interactions = await InteractionService.getUserInteractions(userId, cardIds)
      
      // 计算用户偏好向量（与内容向量同维度）
      const preferences = new Array(51).fill(0) // 10+20+5+4+7+5 = 51维
      let totalWeight = 0
      
      // 基于用户交互的内容加权平均
      for (const [cardId, interaction] of Object.entries(interactions)) {
        const contentVector = this.contentVectors.get(cardId)
        if (!contentVector) continue
        
        // 计算交互权重
        const weight = this.calculateInteractionWeight(interaction)
        totalWeight += weight
        
        // 加权累加到用户偏好向量
        for (let i = 0; i < contentVector.features.length; i++) {
          preferences[i] += contentVector.features[i] * weight
        }
      }
      
      // 归一化
      if (totalWeight > 0) {
        for (let i = 0; i < preferences.length; i++) {
          preferences[i] /= totalWeight
        }
      }
      
      const userVector: UserVector = {
        userId,
        preferences: this.normalizeVector(preferences),
        interactions,
        lastUpdated: new Date()
      }
      
      this.userVectors.set(userId, userVector)
      return userVector
    } catch (error) {
      console.error('生成用户向量失败:', error)
      
      // 返回默认向量
      const defaultVector: UserVector = {
        userId,
        preferences: new Array(51).fill(0.02), // 均匀分布
        interactions: {},
        lastUpdated: new Date()
      }
      
      this.userVectors.set(userId, defaultVector)
      return defaultVector
    }
  }

  // 计算交互权重
  private static calculateInteractionWeight(interaction: any): number {
    let weight = 0
    
    // 基于不同交互类型的权重
    if (interaction.viewed) weight += 1
    if (interaction.liked) weight += 3
    if (interaction.bookmarked) weight += 5
    if (interaction.shared) weight += 4
    if (interaction.commented) weight += 6
    
    // 基于停留时间的权重
    if (interaction.viewDuration) {
      weight += Math.min(interaction.viewDuration / 60, 5) // 最多5分钟权重
    }
    
    // 基于时间衰减
    if (interaction.timestamp) {
      const daysSince = (Date.now() - new Date(interaction.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      const timeDecay = Math.exp(-daysSince / 30) // 30天半衰期
      weight *= timeDecay
    }
    
    return Math.max(weight, 0.1) // 最小权重
  }

  // 协同过滤推荐
  static async getCollaborativeRecommendations(
    userId: string, 
    cards: CardType[], 
    limit: number = 10
  ): Promise<CollaborativeFilteringResult> {
    const userVector = this.userVectors.get(userId)
    if (!userVector) {
      return {
        recommendations: [],
        similarUsers: [],
        confidence: 0
      }
    }
    
    // 找到相似用户
    const similarUsers = await this.findSimilarUsers(userId, 20)
    
    // 基于相似用户的偏好推荐内容
    const candidateScores = new Map<string, number>()
    const userInteractedCards = new Set(Object.keys(userVector.interactions))
    
    for (const similarUserId of similarUsers) {
      const similarUserVector = this.userVectors.get(similarUserId)
      if (!similarUserVector) continue
      
      const similarity = this.calculateUserSimilarity(userId, similarUserId)
      
      // 获取相似用户喜欢但当前用户未交互的内容
      for (const [cardId, interaction] of Object.entries(similarUserVector.interactions)) {
        if (userInteractedCards.has(cardId)) continue
        
        const interactionScore = this.calculateInteractionWeight(interaction)
        const weightedScore = interactionScore * similarity
        
        candidateScores.set(cardId, (candidateScores.get(cardId) || 0) + weightedScore)
      }
    }
    
    // 排序并获取推荐
    const sortedCandidates = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
    
    const recommendations = sortedCandidates
      .map(([cardId]) => cards.find(card => card.id === cardId))
      .filter(card => card !== undefined) as CardType[]
    
    const confidence = similarUsers.length > 0 ? Math.min(similarUsers.length / 10, 1) : 0
    
    return {
      recommendations,
      similarUsers,
      confidence
    }
  }

  // 基于内容向量的相似度推荐
  static getVectorSimilarityRecommendations(
    userId: string,
    cards: CardType[],
    limit: number = 10
  ): CardType[] {
    const userVector = this.userVectors.get(userId)
    if (!userVector) return []
    
    const userInteractedCards = new Set(Object.keys(userVector.interactions))
    const candidateCards = cards.filter(card => !userInteractedCards.has(card.id))
    
    // 计算用户偏好向量与内容向量的相似度
    const scoredCards = candidateCards.map(card => {
      const contentVector = this.contentVectors.get(card.id)
      if (!contentVector) return { card, score: 0 }
      
      const similarity = this.calculateCosineSimilarity(
        userVector.preferences,
        contentVector.features
      )
      
      return { card, score: similarity }
    })
    
    return scoredCards
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.card)
  }

  // 混合推荐算法
  static async getHybridRecommendations(
    userId: string,
    cards: CardType[],
    limit: number = 10
  ): Promise<CardType[]> {
    // 获取不同算法的推荐结果
    const collaborativeResult = await this.getCollaborativeRecommendations(userId, cards, limit)
    const vectorRecommendations = this.getVectorSimilarityRecommendations(userId, cards, limit)
    
    // 混合权重
    const collaborativeWeight = collaborativeResult.confidence * 0.6
    const vectorWeight = 0.4
    
    // 合并和重新排序
    const combinedScores = new Map<string, number>()
    
    // 协同过滤结果
    collaborativeResult.recommendations.forEach((card, index) => {
      const score = (limit - index) / limit * collaborativeWeight
      combinedScores.set(card.id, score)
    })
    
    // 向量相似度结果
    vectorRecommendations.forEach((card, index) => {
      const score = (limit - index) / limit * vectorWeight
      const existingScore = combinedScores.get(card.id) || 0
      combinedScores.set(card.id, existingScore + score)
    })
    
    // 排序并返回
    const sortedCards = Array.from(combinedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cardId]) => cards.find(card => card.id === cardId))
      .filter(card => card !== undefined) as CardType[]
    
    return sortedCards
  }

  // 找到相似用户
  private static async findSimilarUsers(userId: string, limit: number = 10): Promise<string[]> {
    const userVector = this.userVectors.get(userId)
    if (!userVector) return []
    
    // 检查缓存
    const cached = this.userSimilarityCache.get(userId)
    if (cached) {
      return Array.from(cached.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([otherUserId]) => otherUserId)
    }
    
    // 计算与所有其他用户的相似度
    const similarities = new Map<string, number>()
    
    for (const [otherUserId, otherUserVector] of this.userVectors) {
      if (otherUserId === userId) continue
      
      const similarity = this.calculateCosineSimilarity(
        userVector.preferences,
        otherUserVector.preferences
      )
      
      if (similarity > 0.1) { // 只保留相似度较高的用户
        similarities.set(otherUserId, similarity)
      }
    }
    
    // 缓存结果
    this.userSimilarityCache.set(userId, similarities)
    
    return Array.from(similarities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([otherUserId]) => otherUserId)
  }

  // 计算用户相似度
  private static calculateUserSimilarity(userId1: string, userId2: string): number {
    const cached = this.userSimilarityCache.get(userId1)
    if (cached?.has(userId2)) {
      return cached.get(userId2)!
    }
    
    const user1Vector = this.userVectors.get(userId1)
    const user2Vector = this.userVectors.get(userId2)
    
    if (!user1Vector || !user2Vector) return 0
    
    return this.calculateCosineSimilarity(user1Vector.preferences, user2Vector.preferences)
  }

  // 计算余弦相似度
  private static calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) return 0
    
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i]
      norm1 += vector1[i] * vector1[i]
      norm2 += vector2[i] * vector2[i]
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2)
    return magnitude === 0 ? 0 : dotProduct / magnitude
  }

  // 向量归一化
  private static normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return magnitude === 0 ? vector : vector.map(val => val / magnitude)
  }

  // 更新用户向量（实时学习）
  static async updateUserVector(userId: string, cardId: string, interaction: any) {
    const userVector = this.userVectors.get(userId)
    const contentVector = this.contentVectors.get(cardId)
    
    if (!userVector || !contentVector) return
    
    // 更新交互记录
    userVector.interactions[cardId] = interaction
    
    // 实时调整用户偏好向量
    const weight = this.calculateInteractionWeight(interaction)
    const learningRate = 0.1 // 学习率
    
    for (let i = 0; i < userVector.preferences.length; i++) {
      userVector.preferences[i] = 
        userVector.preferences[i] * (1 - learningRate) + 
        contentVector.features[i] * weight * learningRate
    }
    
    // 重新归一化
    userVector.preferences = this.normalizeVector(userVector.preferences)
    userVector.lastUpdated = new Date()
    
    // 清除相似度缓存
    this.userSimilarityCache.delete(userId)
    
    console.log(`🧠 用户向量已更新: ${userId}`)
  }

  // 获取推荐解释
  static getRecommendationExplanation(userId: string, cardId: string): string {
    const userVector = this.userVectors.get(userId)
    const contentVector = this.contentVectors.get(cardId)
    
    if (!userVector || !contentVector) {
      return '基于您的浏览历史推荐'
    }
    
    // 分析主要匹配因素
    const explanations: string[] = []
    
    // 分析分类匹配
    const categoryScore = this.calculateCosineSimilarity(
      userVector.preferences.slice(0, 10),
      contentVector.features.slice(0, 10)
    )
    if (categoryScore > 0.5) {
      explanations.push(`与您偏好的${contentVector.category}分类匹配`)
    }
    
    // 分析标签匹配
    const tagScore = this.calculateCosineSimilarity(
      userVector.preferences.slice(10, 30),
      contentVector.features.slice(10, 30)
    )
    if (tagScore > 0.3) {
      explanations.push('标签与您的兴趣相符')
    }
    
    // 分析难度匹配
    const difficultyScore = this.calculateCosineSimilarity(
      userVector.preferences.slice(35, 39),
      contentVector.features.slice(35, 39)
    )
    if (difficultyScore > 0.5) {
      explanations.push('难度适合您的水平')
    }
    
    return explanations.length > 0 
      ? explanations.join('，') 
      : '基于您的个人偏好推荐'
  }

  // 获取系统统计信息
  static getSystemStats() {
    return {
      userVectors: this.userVectors.size,
      contentVectors: this.contentVectors.size,
      cacheSize: this.userSimilarityCache.size,
      vectorDimensions: 51,
      lastUpdated: new Date().toISOString()
    }
  }
}
