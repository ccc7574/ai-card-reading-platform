import { NextRequest, NextResponse } from 'next/server'
import { CardService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || 'all'
    const difficulty = searchParams.get('difficulty') || 'all'
    const author = searchParams.get('author') || ''
    const dateRange = searchParams.get('dateRange') || 'all'
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const readingTime = searchParams.get('readingTime') || 'all'
    const sortBy = searchParams.get('sortBy') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 如果没有搜索条件，返回默认卡片
    if (!query && category === 'all' && difficulty === 'all' && !author && dateRange === 'all' && tags.length === 0 && readingTime === 'all') {
      const cards = await CardService.getCards({ limit, offset, category })
      return NextResponse.json({ cards, total: cards.length })
    }

    // 执行搜索
    let cards = await CardService.searchCards(query, { limit: limit * 2, category: category !== 'all' ? category : undefined })

    // 应用其他筛选条件
    cards = cards.filter(card => {
      // 难度筛选
      if (difficulty !== 'all' && card.difficulty !== difficulty) {
        return false
      }

      // 作者筛选
      if (author && !card.author?.toLowerCase().includes(author.toLowerCase())) {
        return false
      }

      // 标签筛选
      if (tags.length > 0) {
        const hasMatchingTag = tags.some(tag => 
          card.tags.some(cardTag => 
            cardTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
        if (!hasMatchingTag) {
          return false
        }
      }

      // 阅读时间筛选
      if (readingTime !== 'all') {
        const time = card.readingTime
        switch (readingTime) {
          case 'short':
            if (time > 3) return false
            break
          case 'medium':
            if (time <= 3 || time > 8) return false
            break
          case 'long':
            if (time <= 8) return false
            break
        }
      }

      // 时间范围筛选
      if (dateRange !== 'all') {
        const now = new Date()
        const cardDate = new Date(card.publishedAt)
        
        switch (dateRange) {
          case 'today':
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            if (cardDate < today) return false
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (cardDate < weekAgo) return false
            break
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            if (cardDate < monthAgo) return false
            break
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            if (cardDate < yearAgo) return false
            break
        }
      }

      return true
    })

    // 排序
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        case 'reading_time':
          return a.readingTime - b.readingTime
        case 'popular':
          // 简单的受欢迎度算法：基于标签数量和内容长度
          const scoreA = a.tags.length + (a.content?.length || 0) / 100
          const scoreB = b.tags.length + (b.content?.length || 0) / 100
          return scoreB - scoreA
        case 'trending':
          // 简单的趋势算法：最近发布且有较多标签的内容
          const trendScoreA = (Date.now() - new Date(a.publishedAt).getTime()) / (1000 * 60 * 60 * 24) + a.tags.length * 10
          const trendScoreB = (Date.now() - new Date(b.publishedAt).getTime()) / (1000 * 60 * 60 * 24) + b.tags.length * 10
          return trendScoreB - trendScoreA
        default:
          return 0
      }
    })

    // 分页
    const paginatedCards = cards.slice(offset, offset + limit)

    return NextResponse.json({
      cards: paginatedCards,
      total: cards.length,
      hasMore: offset + limit < cards.length
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

// 获取搜索建议
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // 简单的搜索建议实现
    const suggestions = [
      `${query} 教程`,
      `${query} 最佳实践`,
      `${query} 入门指南`,
      `${query} 深度解析`,
      `${query} 案例研究`
    ].filter(suggestion => suggestion.length <= 50)

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}
