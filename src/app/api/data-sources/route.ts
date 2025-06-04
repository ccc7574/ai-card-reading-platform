import { NextRequest, NextResponse } from 'next/server'
import { DataSourceManager } from '@/lib/data-sources/data-source-manager'

// 数据源管理API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'latest'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    const dataManager = DataSourceManager.getInstance()

    switch (action) {
      case 'latest':
        const latestContent = dataManager.getLatestContent(limit)
        return NextResponse.json({
          success: true,
          data: latestContent,
          total: latestContent.length
        })

      case 'trending':
        const trendingContent = dataManager.getTrendingContent(limit)
        return NextResponse.json({
          success: true,
          data: trendingContent,
          total: trendingContent.length
        })

      case 'category':
        if (!category) {
          return NextResponse.json(
            { error: '需要指定分类' },
            { status: 400 }
          )
        }
        const categoryContent = dataManager.getContentByCategory(category, limit)
        return NextResponse.json({
          success: true,
          data: categoryContent,
          total: categoryContent.length,
          category
        })

      case 'status':
        const status = dataManager.getDataSourceStatus()
        return NextResponse.json({
          success: true,
          data: status
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('数据源API错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '数据源API错误',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 手动刷新数据源
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    const dataManager = DataSourceManager.getInstance()

    switch (action) {
      case 'refresh':
        await dataManager.refreshAll()
        const status = dataManager.getDataSourceStatus()
        
        return NextResponse.json({
          success: true,
          message: '数据源刷新完成',
          data: status
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('数据源刷新错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '数据源刷新失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
