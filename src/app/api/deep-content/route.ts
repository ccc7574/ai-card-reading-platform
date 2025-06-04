import { NextRequest, NextResponse } from 'next/server'
import { DeepContentGenerator } from '@/lib/content-expansion/deep-content-generator'

// 深度内容生成API
export async function POST(request: NextRequest) {
  try {
    const { cardId, card } = await request.json()

    if (!card) {
      return NextResponse.json(
        { error: '需要提供卡片数据' },
        { status: 400 }
      )
    }

    console.log(`🔍 开始生成深度内容: ${card.title}`)

    const deepContentGenerator = DeepContentGenerator.getInstance()
    const deepContent = await deepContentGenerator.generateDeepContent(card)

    return NextResponse.json({
      success: true,
      data: deepContent,
      message: '深度内容生成成功'
    })

  } catch (error) {
    console.error('深度内容生成错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '深度内容生成失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 获取深度内容缓存状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    const deepContentGenerator = DeepContentGenerator.getInstance()

    switch (action) {
      case 'stats':
        const stats = deepContentGenerator.getCacheStats()
        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'clear-cache':
        deepContentGenerator.clearCache()
        return NextResponse.json({
          success: true,
          message: '缓存已清理'
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('深度内容API错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '深度内容API错误',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
