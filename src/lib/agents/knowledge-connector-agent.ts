import { BaseAgent, AgentTask, AgentResult } from './base-agent'
import { Card, CardConnection } from '@/types'

// 知识关联Agent
export class KnowledgeConnectorAgent extends BaseAgent {
  private knowledgeBase: Map<string, Card> = new Map()
  private connections: Map<string, CardConnection[]> = new Map()

  constructor() {
    super({
      name: 'KnowledgeConnectorAgent',
      description: '专门负责发现和建立知识点之间的关联关系',
      capabilities: ['find-connections', 'build-knowledge-graph', 'suggest-related', 'analyze-patterns'],
      priority: 4,
      timeout: 30000
    })
  }

  protected async performTask(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'find-connections':
        return await this.findConnections(task.input.content, task.input.tags)
      
      case 'build-knowledge-graph':
        return await this.buildKnowledgeGraph(task.input.cards)
      
      case 'suggest-related':
        return await this.suggestRelated(task.input.cardId)
      
      case 'analyze-patterns':
        return await this.analyzePatterns(task.input.timeRange)
      
      default:
        throw new Error(`Unsupported task type: ${task.type}`)
    }
  }

  private async findConnections(content: any, tags: string[]): Promise<AgentResult> {
    try {
      const connections = await this.discoverConnections(content, tags)
      
      return {
        success: true,
        data: { connections },
        metadata: {
          connectionCount: connections.length,
          analysisMethod: 'semantic-similarity',
          confidence: this.calculateAverageConfidence(connections)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Connection discovery failed'
      }
    }
  }

  private async discoverConnections(content: any, tags: string[]): Promise<CardConnection[]> {
    const connections: CardConnection[] = []
    
    // 遍历现有知识库寻找关联
    for (const [cardId, card] of this.knowledgeBase) {
      if (cardId === content.id) continue // 跳过自己
      
      const similarity = this.calculateSimilarity(content, card, tags)
      
      if (similarity.score > 0.3) { // 相似度阈值
        connections.push({
          id: `conn_${content.id}_${cardId}`,
          fromCardId: content.id,
          toCardId: cardId,
          connectionType: this.determineConnectionType(similarity),
          description: similarity.reason,
          strength: similarity.score
        })
      }
    }
    
    return connections.sort((a, b) => b.strength - a.strength).slice(0, 5) // 返回前5个最强关联
  }

  private calculateSimilarity(content1: any, content2: Card, tags1: string[]) {
    let score = 0
    let reasons: string[] = []
    
    // 标签相似度
    const commonTags = tags1.filter(tag => content2.tags.includes(tag))
    if (commonTags.length > 0) {
      score += (commonTags.length / Math.max(tags1.length, content2.tags.length)) * 0.4
      reasons.push(`共同标签: ${commonTags.join(', ')}`)
    }
    
    // 分类相似度
    if (content1.category === content2.category) {
      score += 0.2
      reasons.push('相同分类')
    }
    
    // 难度相似度
    if (content1.difficulty === content2.difficulty) {
      score += 0.1
      reasons.push('相同难度级别')
    }
    
    // 内容关键词相似度
    const keywordSimilarity = this.calculateKeywordSimilarity(content1.keyPoints || [], content2.tags)
    score += keywordSimilarity * 0.3
    if (keywordSimilarity > 0.2) {
      reasons.push('内容关键词相关')
    }
    
    return {
      score,
      reason: reasons.join('; ') || '内容相关性'
    }
  }

  private calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0
    
    const set1 = new Set(keywords1.map(k => k.toLowerCase()))
    const set2 = new Set(keywords2.map(k => k.toLowerCase()))
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }

  private determineConnectionType(similarity: any): 'related' | 'prerequisite' | 'follow-up' | 'contrast' {
    if (similarity.score > 0.7) return 'related'
    if (similarity.reason.includes('难度')) return 'prerequisite'
    if (similarity.reason.includes('分类')) return 'follow-up'
    return 'related'
  }

  private calculateAverageConfidence(connections: CardConnection[]): number {
    if (connections.length === 0) return 0
    return connections.reduce((sum, conn) => sum + conn.strength, 0) / connections.length
  }

  private async buildKnowledgeGraph(cards: Card[]): Promise<AgentResult> {
    try {
      // 更新知识库
      cards.forEach(card => {
        this.knowledgeBase.set(card.id, card)
      })
      
      // 构建全局关联图
      const allConnections: CardConnection[] = []
      
      for (const card of cards) {
        const connections = await this.discoverConnections(card, card.tags)
        allConnections.push(...connections)
      }
      
      // 构建图结构
      const graph = this.buildGraphStructure(cards, allConnections)
      
      return {
        success: true,
        data: { graph, connections: allConnections },
        metadata: {
          nodeCount: cards.length,
          edgeCount: allConnections.length,
          density: allConnections.length / (cards.length * (cards.length - 1) / 2)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Knowledge graph construction failed'
      }
    }
  }

  private buildGraphStructure(cards: Card[], connections: CardConnection[]) {
    const nodes = cards.map(card => ({
      id: card.id,
      title: card.title,
      category: card.category,
      difficulty: card.difficulty,
      tags: card.tags,
      x: Math.random() * 800, // 随机初始位置
      y: Math.random() * 600
    }))
    
    const edges = connections.map(conn => ({
      id: conn.id,
      source: conn.fromCardId,
      target: conn.toCardId,
      type: conn.connectionType,
      strength: conn.strength,
      description: conn.description
    }))
    
    return { nodes, edges }
  }

  private async suggestRelated(cardId: string): Promise<AgentResult> {
    try {
      const card = this.knowledgeBase.get(cardId)
      if (!card) {
        throw new Error('Card not found in knowledge base')
      }
      
      const connections = await this.discoverConnections(card, card.tags)
      const suggestions = connections
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3)
        .map(conn => ({
          cardId: conn.toCardId,
          reason: conn.description,
          strength: conn.strength,
          type: conn.connectionType
        }))
      
      return {
        success: true,
        data: { suggestions },
        metadata: {
          baseCardId: cardId,
          suggestionCount: suggestions.length
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Related content suggestion failed'
      }
    }
  }

  private async analyzePatterns(timeRange?: { start: Date; end: Date }): Promise<AgentResult> {
    try {
      const cards = Array.from(this.knowledgeBase.values())
      
      // 分析标签模式
      const tagFrequency = this.analyzeTagFrequency(cards)
      
      // 分析分类分布
      const categoryDistribution = this.analyzeCategoryDistribution(cards)
      
      // 分析难度分布
      const difficultyDistribution = this.analyzeDifficultyDistribution(cards)
      
      // 分析时间趋势（如果有时间范围）
      const timeTrends = timeRange ? this.analyzeTimeTrends(cards, timeRange) : null
      
      return {
        success: true,
        data: {
          tagFrequency,
          categoryDistribution,
          difficultyDistribution,
          timeTrends,
          totalCards: cards.length
        },
        metadata: {
          analysisDate: new Date(),
          timeRange
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Pattern analysis failed'
      }
    }
  }

  private analyzeTagFrequency(cards: Card[]) {
    const tagCount = new Map<string, number>()
    
    cards.forEach(card => {
      card.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      })
    })
    
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count, percentage: count / cards.length }))
  }

  private analyzeCategoryDistribution(cards: Card[]) {
    const categoryCount = new Map<string, number>()
    
    cards.forEach(card => {
      categoryCount.set(card.category, (categoryCount.get(card.category) || 0) + 1)
    })
    
    return Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count, percentage: count / cards.length }))
  }

  private analyzeDifficultyDistribution(cards: Card[]) {
    const difficultyCount = new Map<string, number>()
    
    cards.forEach(card => {
      difficultyCount.set(card.difficulty, (difficultyCount.get(card.difficulty) || 0) + 1)
    })
    
    return Array.from(difficultyCount.entries())
      .map(([difficulty, count]) => ({ difficulty, count, percentage: count / cards.length }))
  }

  private analyzeTimeTrends(cards: Card[], timeRange: { start: Date; end: Date }) {
    const filteredCards = cards.filter(card => 
      card.createdAt >= timeRange.start && card.createdAt <= timeRange.end
    )
    
    // 按天分组
    const dailyCount = new Map<string, number>()
    filteredCards.forEach(card => {
      const day = card.createdAt.toISOString().split('T')[0]
      dailyCount.set(day, (dailyCount.get(day) || 0) + 1)
    })
    
    return Array.from(dailyCount.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))
  }

  // 添加卡片到知识库
  addCard(card: Card) {
    this.knowledgeBase.set(card.id, card)
  }

  // 获取知识库统计
  getKnowledgeBaseStats() {
    return {
      totalCards: this.knowledgeBase.size,
      totalConnections: Array.from(this.connections.values()).flat().length,
      categories: [...new Set(Array.from(this.knowledgeBase.values()).map(c => c.category))],
      tags: [...new Set(Array.from(this.knowledgeBase.values()).flatMap(c => c.tags))]
    }
  }
}
