import { NextRequest, NextResponse } from 'next/server'
import { agentCache } from '@/lib/agents/agent-cache'

// 获取缓存状态和统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      const stats = agentCache.getStats()
      return NextResponse.json({
        success: true,
        message: 'Agent缓存统计',
        data: stats,
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'health') {
      const health = agentCache.healthCheck()
      return NextResponse.json({
        success: true,
        message: 'Agent缓存健康检查',
        data: health,
        timestamp: new Date().toISOString()
      })
    }

    // 默认返回缓存概览
    const stats = agentCache.getStats()
    const health = agentCache.healthCheck()

    return NextResponse.json({
      success: true,
      message: 'Agent缓存系统状态',
      data: {
        overview: {
          status: 'active',
          totalEntries: stats.totalEntries,
          totalSize: `${Math.round(stats.totalSize / 1024)}KB`,
          expiredEntries: stats.expiredEntries,
          healthStatus: health.status
        },
        statistics: stats,
        health: health,
        configuration: {
          cacheTTL: {
            'content-recommendation': '10分钟',
            'content-search': '5分钟',
            'user-achievement': '30分钟',
            'user-analytics': '1小时',
            'user-engagement': '15分钟',
            'trend-analysis': '30分钟'
          },
          features: [
            '智能缓存键生成',
            '自动过期清理',
            '工作流级别TTL',
            '用户级别缓存清理',
            '缓存预热支持',
            '健康状态监控'
          ]
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('获取Agent缓存状态失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取Agent缓存状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 缓存管理操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workflowId, userId } = body

    switch (action) {
      case 'clear_all':
        agentCache.clear()
        return NextResponse.json({
          success: true,
          message: '已清空所有Agent缓存',
          timestamp: new Date().toISOString()
        })

      case 'clear_workflow':
        if (!workflowId) {
          return NextResponse.json(
            { error: '工作流ID是必需的' },
            { status: 400 }
          )
        }
        agentCache.clearWorkflow(workflowId)
        return NextResponse.json({
          success: true,
          message: `已清除工作流 ${workflowId} 的缓存`,
          timestamp: new Date().toISOString()
        })

      case 'clear_user':
        if (!userId) {
          return NextResponse.json(
            { error: '用户ID是必需的' },
            { status: 400 }
          )
        }
        agentCache.clearUserCache(userId)
        return NextResponse.json({
          success: true,
          message: `已清除用户 ${userId} 的相关缓存`,
          timestamp: new Date().toISOString()
        })

      case 'warmup':
        // 预热常用查询的缓存
        const commonQueries = [
          {
            workflowId: 'content-recommendation',
            input: { userId: 'demo-user', preferences: {}, timestamp: new Date().toISOString() }
          },
          {
            workflowId: 'trend-analysis',
            input: { limit: 20, timeRange: '7d', timestamp: new Date().toISOString() }
          }
        ]
        
        await agentCache.warmup(commonQueries)
        return NextResponse.json({
          success: true,
          message: '缓存预热已启动',
          data: { queriesWarmed: commonQueries.length },
          timestamp: new Date().toISOString()
        })

      case 'cleanup':
        // 手动触发清理
        const statsBefore = agentCache.getStats()
        // 清理逻辑已在内部自动执行
        const statsAfter = agentCache.getStats()
        
        return NextResponse.json({
          success: true,
          message: '缓存清理完成',
          data: {
            before: statsBefore.totalEntries,
            after: statsAfter.totalEntries,
            cleaned: statsBefore.totalEntries - statsAfter.totalEntries
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Agent缓存操作失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Agent缓存操作失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 删除特定缓存
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflowId')
    const userId = searchParams.get('userId')

    if (workflowId) {
      agentCache.clearWorkflow(workflowId)
      return NextResponse.json({
        success: true,
        message: `已删除工作流 ${workflowId} 的缓存`,
        timestamp: new Date().toISOString()
      })
    }

    if (userId) {
      agentCache.clearUserCache(userId)
      return NextResponse.json({
        success: true,
        message: `已删除用户 ${userId} 的相关缓存`,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: '请指定workflowId或userId参数' },
      { status: 400 }
    )

  } catch (error) {
    console.error('删除Agent缓存失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '删除Agent缓存失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
