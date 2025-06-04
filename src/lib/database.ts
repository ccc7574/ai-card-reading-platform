import { supabase, type Card, type User, type UserInteraction, type Comment } from './supabase'
import { Card as CardType } from '@/types'

// 卡片相关操作
export class CardService {
  // 获取所有卡片
  static async getCards(options?: {
    limit?: number
    offset?: number
    category?: string
    userId?: string
  }) {
    let query = supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching cards:', error)
      return []
    }

    return data?.map(this.transformToCardType) || []
  }

  // 根据ID获取卡片
  static async getCardById(id: string): Promise<CardType | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching card:', error)
      return null
    }

    return data ? this.transformToCardType(data) : null
  }

  // 创建新卡片
  static async createCard(card: Omit<Card, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('cards')
      .insert([{
        ...card,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      throw error
    }

    return this.transformToCardType(data)
  }

  // 更新卡片
  static async updateCard(id: string, updates: Partial<Card>) {
    const { data, error } = await supabase
      .from('cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating card:', error)
      throw error
    }

    return this.transformToCardType(data)
  }

  // 删除卡片
  static async deleteCard(id: string) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting card:', error)
      throw error
    }

    return true
  }

  // 搜索卡片
  static async searchCards(query: string, options?: {
    limit?: number
    category?: string
  }) {
    let dbQuery = supabase
      .from('cards')
      .select('*')
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (options?.category && options.category !== 'all') {
      dbQuery = dbQuery.eq('category', options.category)
    }

    if (options?.limit) {
      dbQuery = dbQuery.limit(options.limit)
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error('Error searching cards:', error)
      return []
    }

    return data?.map(this.transformToCardType) || []
  }

  // 获取相关卡片
  static async getRelatedCards(cardId: string, limit = 5): Promise<CardType[]> {
    // 简单的相关性算法：基于标签和分类
    const card = await this.getCardById(cardId)
    if (!card) return []

    let query = supabase
      .from('cards')
      .select('*')
      .neq('id', cardId)
      .eq('category', card.category)
      .limit(limit)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching related cards:', error)
      return []
    }

    return data?.map(this.transformToCardType) || []
  }

  // 转换数据库格式到应用格式
  private static transformToCardType(dbCard: Card): CardType {
    return {
      id: dbCard.id,
      title: dbCard.title,
      summary: dbCard.summary,
      content: dbCard.content || '',
      sourceUrl: dbCard.source_url || '',
      sourceTitle: dbCard.source_title || '',
      author: dbCard.author || '',
      tags: dbCard.tags || [],
      createdAt: new Date(dbCard.created_at),
      updatedAt: new Date(dbCard.updated_at),
      category: dbCard.category,
      difficulty: dbCard.difficulty,
      readingTime: dbCard.reading_time,
      imageUrl: dbCard.image_url,
      publishedAt: new Date(dbCard.published_at),
      metadata: dbCard.metadata
    }
  }
}

// 用户交互相关操作
export class InteractionService {
  // 记录用户交互
  static async recordInteraction(
    userId: string,
    cardId: string,
    type: 'like' | 'bookmark' | 'view' | 'share'
  ) {
    const { data, error } = await supabase
      .from('user_interactions')
      .insert([{
        user_id: userId,
        card_id: cardId,
        interaction_type: type,
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error recording interaction:', error)
      throw error
    }

    return data
  }

  // 获取用户对卡片的交互状态
  static async getUserInteractions(userId: string, cardIds: string[]) {
    const { data, error } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .in('card_id', cardIds)

    if (error) {
      console.error('Error fetching user interactions:', error)
      return {}
    }

    // 转换为便于查询的格式
    const interactions: Record<string, Record<string, boolean>> = {}
    data?.forEach(interaction => {
      if (!interactions[interaction.card_id]) {
        interactions[interaction.card_id] = {}
      }
      interactions[interaction.card_id][interaction.interaction_type] = true
    })

    return interactions
  }

  // 获取卡片的统计信息
  static async getCardStats(cardId: string) {
    const { data, error } = await supabase
      .from('user_interactions')
      .select('interaction_type')
      .eq('card_id', cardId)

    if (error) {
      console.error('Error fetching card stats:', error)
      return { likes: 0, bookmarks: 0, views: 0, shares: 0 }
    }

    const stats = { likes: 0, bookmarks: 0, views: 0, shares: 0 }
    data?.forEach(interaction => {
      switch (interaction.interaction_type) {
        case 'like':
          stats.likes++
          break
        case 'bookmark':
          stats.bookmarks++
          break
        case 'view':
          stats.views++
          break
        case 'share':
          stats.shares++
          break
      }
    })

    return stats
  }
}

// 评论相关操作
export class CommentService {
  // 获取卡片的评论
  static async getComments(cardId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (
          full_name,
          avatar_url
        )
      `)
      .eq('card_id', cardId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }

    return data || []
  }

  // 创建评论
  static async createComment(
    cardId: string,
    userId: string,
    content: string,
    parentId?: string
  ) {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        card_id: cardId,
        user_id: userId,
        content,
        parent_id: parentId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      throw error
    }

    return data
  }
}
