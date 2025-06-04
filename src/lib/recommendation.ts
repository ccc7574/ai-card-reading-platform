import { Card as CardType } from '@/types'
import { InteractionService } from './database'

export interface UserPreferences {
  categories: Record<string, number> // 分类偏好权重
  tags: Record<string, number> // 标签偏好权重
  readingTime: {
    preferred: number // 偏好的阅读时间
    tolerance: number // 容忍度
  }
  difficulty: Record<string, number> // 难度偏好权重
  authors: Record<string, number> // 作者偏好权重
}

export class RecommendationEngine {
  // 基于用户交互历史分析偏好
  static async analyzeUserPreferences(userId: string, cards: CardType[]): Promise<UserPreferences> {
    const preferences: UserPreferences = {
      categories: {},
      tags: {},
      readingTime: { preferred: 5, tolerance: 3 },
      difficulty: {},
      authors: {}
    }

    try {
      // 获取用户交互数据
      const cardIds = cards.map(card => card.id)
      const interactions = await InteractionService.getUserInteractions(userId, cardIds)

      // 分析交互数据
      let totalReadingTime = 0
      let readingTimeCount = 0

      Object.entries(interactions).forEach(([cardId, userInteractions]) => {
        const card = cards.find(c => c.id === cardId)
        if (!card) return

        // 计算交互权重
        let weight = 0
        if (userInteractions.like) weight += 3
        if (userInteractions.bookmark) weight += 2
        if (userInteractions.view) weight += 1
        if (userInteractions.share) weight += 2

        if (weight === 0) return

        // 分类偏好
        preferences.categories[card.category] = (preferences.categories[card.category] || 0) + weight

        // 标签偏好
        card.tags.forEach(tag => {
          preferences.tags[tag] = (preferences.tags[tag] || 0) + weight
        })

        // 难度偏好
        if (card.difficulty) {
          preferences.difficulty[card.difficulty] = (preferences.difficulty[card.difficulty] || 0) + weight
        }

        // 作者偏好
        if (card.author) {
          preferences.authors[card.author] = (preferences.authors[card.author] || 0) + weight
        }

        // 阅读时间偏好
        totalReadingTime += card.readingTime * weight
        readingTimeCount += weight
      })

      // 计算平均偏好阅读时间
      if (readingTimeCount > 0) {
        preferences.readingTime.preferred = Math.round(totalReadingTime / readingTimeCount)
        preferences.readingTime.tolerance = Math.max(2, Math.round(preferences.readingTime.preferred * 0.5))
      }

      // 归一化权重
      this.normalizeWeights(preferences.categories)
      this.normalizeWeights(preferences.tags)
      this.normalizeWeights(preferences.difficulty)
      this.normalizeWeights(preferences.authors)

    } catch (error) {
      console.error('Error analyzing user preferences:', error)
    }

    return preferences
  }

  // 归一化权重
  private static normalizeWeights(weights: Record<string, number>) {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    if (total === 0) return

    Object.keys(weights).forEach(key => {
      weights[key] = weights[key] / total
    })
  }

  // 计算卡片推荐分数
  static calculateRecommendationScore(card: CardType, preferences: UserPreferences): number {
    let score = 0

    // 分类匹配分数 (权重: 30%)
    const categoryScore = preferences.categories[card.category] || 0
    score += categoryScore * 0.3

    // 标签匹配分数 (权重: 25%)
    let tagScore = 0
    card.tags.forEach(tag => {
      tagScore += preferences.tags[tag] || 0
    })
    tagScore = Math.min(tagScore, 1) // 限制最大值为1
    score += tagScore * 0.25

    // 阅读时间匹配分数 (权重: 20%)
    const timeDiff = Math.abs(card.readingTime - preferences.readingTime.preferred)
    const timeScore = Math.max(0, 1 - timeDiff / preferences.readingTime.tolerance)
    score += timeScore * 0.2

    // 难度匹配分数 (权重: 15%)
    const difficultyScore = card.difficulty ? (preferences.difficulty[card.difficulty] || 0) : 0.5
    score += difficultyScore * 0.15

    // 作者匹配分数 (权重: 10%)
    const authorScore = card.author ? (preferences.authors[card.author] || 0) : 0.5
    score += authorScore * 0.1

    return score
  }

  // 获取推荐卡片
  static async getRecommendations(
    userId: string, 
    allCards: CardType[], 
    limit: number = 10
  ): Promise<CardType[]> {
    try {
      // 分析用户偏好
      const preferences = await this.analyzeUserPreferences(userId, allCards)

      // 获取用户已交互的卡片ID
      const cardIds = allCards.map(card => card.id)
      const interactions = await InteractionService.getUserInteractions(userId, cardIds)
      const interactedCardIds = new Set(Object.keys(interactions))

      // 过滤掉已交互的卡片
      const candidateCards = allCards.filter(card => !interactedCardIds.has(card.id))

      // 计算推荐分数并排序
      const scoredCards = candidateCards.map(card => ({
        card,
        score: this.calculateRecommendationScore(card, preferences)
      }))

      // 添加一些随机性以避免推荐过于单一
      scoredCards.forEach(item => {
        item.score += Math.random() * 0.1 // 添加10%的随机因子
      })

      // 排序并返回前N个
      return scoredCards
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.card)

    } catch (error) {
      console.error('Error getting recommendations:', error)
      // 如果推荐失败，返回最新的卡片
      return allCards
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit)
    }
  }

  // 获取相似卡片推荐
  static getSimilarCards(targetCard: CardType, allCards: CardType[], limit: number = 5): CardType[] {
    const similarities = allCards
      .filter(card => card.id !== targetCard.id)
      .map(card => ({
        card,
        similarity: this.calculateSimilarity(targetCard, card)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    return similarities.map(item => item.card)
  }

  // 计算两个卡片的相似度
  private static calculateSimilarity(card1: CardType, card2: CardType): number {
    let similarity = 0

    // 分类相似度 (权重: 40%)
    if (card1.category === card2.category) {
      similarity += 0.4
    }

    // 标签相似度 (权重: 30%)
    const commonTags = card1.tags.filter(tag => card2.tags.includes(tag))
    const totalTags = new Set([...card1.tags, ...card2.tags]).size
    if (totalTags > 0) {
      similarity += (commonTags.length / totalTags) * 0.3
    }

    // 难度相似度 (权重: 15%)
    if (card1.difficulty === card2.difficulty) {
      similarity += 0.15
    }

    // 阅读时间相似度 (权重: 10%)
    const timeDiff = Math.abs(card1.readingTime - card2.readingTime)
    const timeScore = Math.max(0, 1 - timeDiff / 10) // 10分钟为最大差异
    similarity += timeScore * 0.1

    // 作者相似度 (权重: 5%)
    if (card1.author === card2.author) {
      similarity += 0.05
    }

    return similarity
  }

  // 获取热门推荐
  static async getTrendingRecommendations(allCards: CardType[], limit: number = 10): Promise<CardType[]> {
    try {
      // 计算每个卡片的热门分数
      const trendingCards = await Promise.all(
        allCards.map(async card => {
          const stats = await InteractionService.getCardStats(card.id)
          
          // 计算热门分数
          const ageInDays = (Date.now() - new Date(card.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
          const ageFactor = Math.max(0.1, 1 - ageInDays / 30) // 30天内的内容有更高权重
          
          const trendingScore = (
            stats.likes * 3 +
            stats.bookmarks * 2 +
            stats.shares * 4 +
            stats.views * 0.1
          ) * ageFactor

          return {
            card,
            score: trendingScore
          }
        })
      )

      return trendingCards
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.card)

    } catch (error) {
      console.error('Error getting trending recommendations:', error)
      return allCards.slice(0, limit)
    }
  }
}
