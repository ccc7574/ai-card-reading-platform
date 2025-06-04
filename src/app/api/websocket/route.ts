import { NextRequest, NextResponse } from 'next/server'
import { wsManager, mockWsServer } from '@/lib/websocket-server'

// WebSocket管理API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        const stats = wsManager.getStats()
        const serverStatus = mockWsServer.getStatus()
        
        return NextResponse.json({
          success: true,
          message: 'WebSocket服务状态',
          data: {
            server: serverStatus,
            connections: stats,
            features: [
              '实时消息传递',
              '房间管理',
              '用户状态同步',
              '输入状态指示',
              '自动重连机制'
            ]
          }
        })

      case 'stats':
        const detailedStats = {
          ...wsManager.getStats(),
          healthCheck: wsManager.healthCheck(),
          performance: {
            averageLatency: '45ms',
            messagesThroughput: Math.floor(Math.random() * 100) + 50,
            errorRate: '0.1%',
            uptime: '99.9%'
          }
        }
        
        return NextResponse.json({
          success: true,
          message: 'WebSocket详细统计',
          data: detailedStats
        })

      case 'rooms':
        // 模拟房间信息
        const rooms = [
          {
            id: 'card_1',
            name: '卡片讨论 #1',
            userCount: wsManager.getRoomUserCount('card_1'),
            type: 'card_discussion',
            isActive: true
          },
          {
            id: 'general',
            name: '全局聊天',
            userCount: wsManager.getRoomUserCount('general'),
            type: 'general_chat',
            isActive: true
          },
          {
            id: 'tech_discussion',
            name: '技术讨论',
            userCount: wsManager.getRoomUserCount('tech_discussion'),
            type: 'topic_discussion',
            isActive: true
          }
        ]
        
        return NextResponse.json({
          success: true,
          message: '活跃房间列表',
          data: {
            rooms,
            totalRooms: rooms.length,
            totalUsers: rooms.reduce((sum, room) => sum + room.userCount, 0)
          }
        })

      case 'health':
        const healthCheck = wsManager.healthCheck()
        return NextResponse.json({
          success: true,
          message: 'WebSocket健康检查',
          data: healthCheck
        })

      default:
        return NextResponse.json({
          success: false,
          error: '不支持的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('WebSocket API错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'WebSocket API错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// WebSocket操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (!action) {
      return NextResponse.json({
        success: false,
        error: '缺少操作类型'
      }, { status: 400 })
    }

    console.log(`🔄 WebSocket操作: ${action}`)

    switch (action) {
      case 'start_server':
        mockWsServer.start()
        return NextResponse.json({
          success: true,
          message: 'WebSocket服务器启动成功'
        })

      case 'stop_server':
        mockWsServer.stop()
        return NextResponse.json({
          success: true,
          message: 'WebSocket服务器停止成功'
        })

      case 'broadcast':
        const { message, type = 'announcement' } = data
        if (!message) {
          return NextResponse.json({
            success: false,
            error: '缺少广播消息'
          }, { status: 400 })
        }
        
        wsManager.broadcast({
          type: 'broadcast',
          data: { message, type },
          timestamp: new Date().toISOString()
        })
        
        return NextResponse.json({
          success: true,
          message: '广播发送成功',
          data: { message, type, recipients: wsManager.getOnlineUserCount() }
        })

      case 'send_to_room':
        const { roomId, message: roomMessage, messageType = 'system' } = data
        if (!roomId || !roomMessage) {
          return NextResponse.json({
            success: false,
            error: '缺少房间ID或消息内容'
          }, { status: 400 })
        }
        
        wsManager.broadcastToRoom(roomId, {
          type: 'new_message',
          data: {
            id: `sys_${Date.now()}`,
            content: roomMessage,
            messageType,
            roomId,
            userId: 'system',
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        })
        
        return NextResponse.json({
          success: true,
          message: '房间消息发送成功',
          data: { roomId, message: roomMessage, recipients: wsManager.getRoomUserCount(roomId) }
        })

      case 'simulate_activity':
        // 模拟用户活动
        const activities = [
          { type: 'user_joined', userId: 'user_' + Math.random().toString(36).substr(2, 5) },
          { type: 'new_comment', cardId: 'card_' + Math.floor(Math.random() * 10) },
          { type: 'like_activity', targetId: 'content_' + Math.floor(Math.random() * 20) }
        ]
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        
        wsManager.broadcast({
          type: 'activity_update',
          data: randomActivity,
          timestamp: new Date().toISOString()
        })
        
        return NextResponse.json({
          success: true,
          message: '模拟活动发送成功',
          data: randomActivity
        })

      case 'test_connection':
        const { userId } = data
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: '缺少用户ID'
          }, { status: 400 })
        }
        
        // 模拟连接测试
        wsManager.sendToUser(userId, {
          type: 'connection_test',
          data: { 
            message: '连接测试消息',
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        })
        
        return NextResponse.json({
          success: true,
          message: '连接测试消息已发送',
          data: { userId }
        })

      default:
        return NextResponse.json({
          success: false,
          error: '不支持的操作类型'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('WebSocket操作失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'WebSocket操作失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 删除连接
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const roomId = searchParams.get('roomId')

    if (userId && roomId) {
      // 从特定房间移除用户
      wsManager.leaveRoom(userId, roomId)
      return NextResponse.json({
        success: true,
        message: `用户 ${userId} 已从房间 ${roomId} 移除`
      })
    } else if (userId) {
      // 断开用户连接
      wsManager.disconnectUser(userId)
      return NextResponse.json({
        success: true,
        message: `用户 ${userId} 连接已断开`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('删除连接失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '删除连接失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
