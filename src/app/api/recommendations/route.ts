import { NextRequest, NextResponse } from 'next/server'
import { CardService, InteractionService } from '@/lib/database'
import { RecommendationEngine } from '@/lib/recommendation'
import { aiRecommendationSystem } from '@/lib/ai-recommendation-agents'
import { aiDataSourceManager } from '@/lib/ai-data-source-agents'
import { ragEngine } from '@/lib/rag-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'personalized' // personalized, similar, trending, ai
    const cardId = searchParams.get('cardId') // for similar recommendations
    const limit = parseInt(searchParams.get('limit') || '10')
    const algorithm = searchParams.get('algorithm') || 'traditional' // traditional, ai, hybrid

    // 获取所有卡片
    const allCards = await CardService.getCards({ limit: 1000 })

    let recommendations = []

    switch (type) {
      case 'personalized':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID required for personalized recommendations' },
            { status: 400 }
          )
        }
        recommendations = await RecommendationEngine.getRecommendations(userId, allCards, limit)
        break

      case 'similar':
        if (!cardId) {
          return NextResponse.json(
            { error: 'Card ID required for similar recommendations' },
            { status: 400 }
          )
        }
        const targetCard = await CardService.getCardById(cardId)
        if (!targetCard) {
          return NextResponse.json(
            { error: 'Card not found' },
            { status: 404 }
          )
        }
        recommendations = RecommendationEngine.getSimilarCards(targetCard, allCards, limit)
        break

      case 'trending':
        recommendations = await RecommendationEngine.getTrendingRecommendations(allCards, limit)
        break

      case 'ai':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID required for AI recommendations' },
            { status: 400 }
          )
        }

        // 使用AI推荐系统
        const aiResponse = await aiRecommendationSystem.generateRecommendations(
          {
            userId,
            context: { intent: 'explore' },
            constraints: { maxResults: limit }
          },
          allCards
        )

        recommendations = aiResponse.recommendations.map(rec => ({
          ...allCards.find(card => card.id === rec.cardId),
          score: rec.score,
          reasoning: rec.reasoning,
          confidence: rec.confidence,
          agentType: rec.agentType,
          metadata: rec.metadata
        })).filter(Boolean)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid recommendation type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      recommendations,
      type,
      count: recommendations.length
    })

  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}

// 记录用户交互
export async function POST(request: NextRequest) {
  try {
    const { userId, cardId, interactionType } = await request.json()

    if (!userId || !cardId || !interactionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证交互类型
    const validTypes = ['like', 'bookmark', 'view', 'share']
    if (!validTypes.includes(interactionType)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      )
    }

    // 记录交互
    await InteractionService.recordInteraction(userId, cardId, interactionType)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Interaction recording error:', error)
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    )
  }
}
