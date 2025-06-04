import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 事件追踪API
export async function POST(request: NextRequest) {
  try {
    const { event, platform, content, userId, metadata } = await request.json()

    if (!event) {
      return NextResponse.json({
        success: false,
        error: '缺少事件类型'
      }, { status: 400 })
    }

    console.log(`📊 记录事件: ${event}`, { platform, content: content?.title })

    const eventData = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event_type: event,
      platform: platform || null,
      content_title: content?.title || null,
      content_url: content?.url || null,
      user_id: userId || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    }

    // 如果有Supabase，保存到数据库
    if (supabase) {
      try {
        const { error } = await supabase
          .from('analytics_events')
          .insert({
            event_type: eventData.event_type,
            platform: eventData.platform,
            content_title: eventData.content_title,
            content_url: eventData.content_url,
            user_id: eventData.user_id,
            metadata: eventData.metadata,
            ip_address: eventData.ip_address,
            user_agent: eventData.user_agent
          })

        if (error) {
          console.error('保存事件到数据库失败:', error)
        } else {
          console.log('✅ 事件已保存到数据库')
        }
      } catch (dbError) {
        console.warn('数据库操作失败:', dbError)
      }
    }

    // 实时事件处理
    await processEventInRealTime(eventData)

    return NextResponse.json({
      success: true,
      message: '事件记录成功',
      data: {
        eventId: eventData.id,
        timestamp: eventData.timestamp
      }
    })

  } catch (error) {
    console.error('记录事件失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '记录事件失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 获取事件统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'summary'
    const timeRange = searchParams.get('timeRange') || '7d'
    const eventType = searchParams.get('eventType')

    console.log(`📈 获取事件统计: ${action}, 时间范围: ${timeRange}`)

    switch (action) {
      case 'summary':
        const summary = await getEventSummary(timeRange)
        return NextResponse.json({
          success: true,
          data: summary
        })

      case 'breakdown':
        const breakdown = await getEventBreakdown(timeRange, eventType)
        return NextResponse.json({
          success: true,
          data: breakdown
        })

      case 'trends':
        const trends = await getEventTrends(timeRange)
        return NextResponse.json({
          success: true,
          data: trends
        })

      case 'realtime':
        const realtime = await getRealtimeEvents()
        return NextResponse.json({
          success: true,
          data: realtime
        })

      default:
        return NextResponse.json({
          success: false,
          error: '不支持的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('获取事件统计失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取事件统计失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 实时事件处理
async function processEventInRealTime(eventData: any) {
  try {
    // 更新实时统计
    await updateRealtimeStats(eventData)
    
    // 触发实时通知（如果需要）
    if (eventData.event_type === 'share' && eventData.platform) {
      console.log(`🔔 实时通知: 内容被分享到${eventData.platform}`)
    }
    
    // 更新热门内容排行
    if (eventData.event_type === 'view' || eventData.event_type === 'share') {
      await updateTrendingContent(eventData)
    }

  } catch (error) {
    console.error('实时事件处理失败:', error)
  }
}

// 获取事件摘要
async function getEventSummary(timeRange: string) {
  // 模拟数据，实际应该从数据库查询
  const mockSummary = {
    totalEvents: 15420,
    uniqueUsers: 3240,
    topEvents: [
      { type: 'view', count: 8920, percentage: 57.8 },
      { type: 'share', count: 2340, percentage: 15.2 },
      { type: 'like', count: 1890, percentage: 12.3 },
      { type: 'bookmark', count: 1560, percentage: 10.1 },
      { type: 'comment', count: 710, percentage: 4.6 }
    ],
    timeRange,
    lastUpdated: new Date().toISOString()
  }

  // 如果有Supabase，从数据库获取真实数据
  if (supabase) {
    try {
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, created_at')
        .gte('created_at', getTimeRangeStart(timeRange))

      if (events && events.length > 0) {
        const eventCounts = events.reduce((acc: any, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1
          return acc
        }, {})

        const total = events.length
        const topEvents = Object.entries(eventCounts)
          .map(([type, count]: [string, any]) => ({
            type,
            count,
            percentage: (count / total * 100).toFixed(1)
          }))
          .sort((a, b) => b.count - a.count)

        return {
          totalEvents: total,
          uniqueUsers: mockSummary.uniqueUsers, // 需要更复杂的查询
          topEvents,
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      }
    } catch (dbError) {
      console.warn('从数据库获取事件摘要失败:', dbError)
    }
  }

  return mockSummary
}

// 获取事件分解
async function getEventBreakdown(timeRange: string, eventType?: string) {
  const mockBreakdown = {
    platforms: {
      twitter: 45.2,
      linkedin: 28.7,
      facebook: 15.3,
      wechat: 8.1,
      email: 2.7
    },
    devices: {
      desktop: 62.4,
      mobile: 31.8,
      tablet: 5.8
    },
    timeDistribution: [
      { hour: 9, count: 234 },
      { hour: 10, count: 456 },
      { hour: 11, count: 567 },
      { hour: 14, count: 678 },
      { hour: 15, count: 543 },
      { hour: 16, count: 432 },
      { hour: 20, count: 321 },
      { hour: 21, count: 234 }
    ],
    eventType,
    timeRange
  }

  return mockBreakdown
}

// 获取事件趋势
async function getEventTrends(timeRange: string) {
  const mockTrends = {
    daily: [
      { date: '2024-01-15', views: 1234, shares: 89, likes: 156 },
      { date: '2024-01-16', views: 1456, shares: 102, likes: 178 },
      { date: '2024-01-17', views: 1678, shares: 134, likes: 203 },
      { date: '2024-01-18', views: 1890, shares: 156, likes: 234 },
      { date: '2024-01-19', views: 2103, shares: 178, likes: 267 },
      { date: '2024-01-20', views: 1987, shares: 145, likes: 245 },
      { date: '2024-01-21', views: 2234, shares: 189, likes: 289 }
    ],
    growth: {
      views: 12.5,
      shares: 23.4,
      likes: 18.7,
      bookmarks: 15.2
    },
    timeRange
  }

  return mockTrends
}

// 获取实时事件
async function getRealtimeEvents() {
  const mockRealtime = {
    activeUsers: 234,
    eventsLastMinute: 45,
    topContent: [
      { title: 'GPT-4的多模态能力突破', views: 89, shares: 12 },
      { title: '设计系统的演进', views: 67, shares: 8 },
      { title: '创业公司的产品市场匹配', views: 54, shares: 6 }
    ],
    recentEvents: [
      { type: 'share', platform: 'twitter', timestamp: new Date().toISOString() },
      { type: 'view', content: 'AI技术文章', timestamp: new Date().toISOString() },
      { type: 'like', content: '设计文章', timestamp: new Date().toISOString() }
    ]
  }

  return mockRealtime
}

// 更新实时统计
async function updateRealtimeStats(eventData: any) {
  // 这里应该更新Redis或内存缓存中的实时统计
  console.log('📊 更新实时统计:', eventData.event_type)
}

// 更新热门内容
async function updateTrendingContent(eventData: any) {
  // 这里应该更新热门内容排行榜
  if (eventData.content_title) {
    console.log('🔥 更新热门内容:', eventData.content_title)
  }
}

// 获取时间范围开始时间
function getTimeRangeStart(timeRange: string): string {
  const now = new Date()
  const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return start.toISOString()
}
