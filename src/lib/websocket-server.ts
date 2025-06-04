// WebSocket服务器管理
import { realtimeManager } from './realtime-collaboration'

export interface WebSocketMessage {
  type: 'user_online' | 'user_offline' | 'new_comment' | 'comment_liked' | 'new_notification' | 'activity_update' | 'broadcast'
  data: any
  timestamp: string
  userId?: string
  targetUserId?: string
}

export class WebSocketManager {
  private static instance: WebSocketManager
  private connections = new Map<string, any>() // userId -> connection
  private rooms = new Map<string, Set<string>>() // roomId -> Set<userId>

  private constructor() {
    this.initializeEventListeners()
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  // 初始化事件监听器
  private initializeEventListeners() {
    // 监听实时协作管理器的事件
    realtimeManager.on('user_online', (user) => {
      this.broadcast({
        type: 'user_online',
        data: user,
        timestamp: new Date().toISOString()
      })
    })

    realtimeManager.on('user_offline', (user) => {
      this.broadcast({
        type: 'user_offline',
        data: user,
        timestamp: new Date().toISOString()
      })
    })

    realtimeManager.on('new_comment', (comment) => {
      this.broadcastToRoom(`card_${comment.cardId}`, {
        type: 'new_comment',
        data: comment,
        timestamp: new Date().toISOString()
      })
    })

    realtimeManager.on('comment_liked', (data) => {
      this.broadcast({
        type: 'comment_liked',
        data,
        timestamp: new Date().toISOString()
      })
    })

    realtimeManager.on('new_notification', (notification) => {
      this.sendToUser(notification.targetUserId, {
        type: 'new_notification',
        data: notification,
        timestamp: new Date().toISOString()
      })
    })

    realtimeManager.on('new_activity', (activity) => {
      this.broadcast({
        type: 'activity_update',
        data: activity,
        timestamp: new Date().toISOString()
      })
    })
  }

  // 用户连接
  public connectUser(userId: string, connection: any) {
    this.connections.set(userId, connection)
    console.log(`🔌 用户连接: ${userId}`)

    // 设置连接事件处理
    connection.on('message', (message: string) => {
      this.handleMessage(userId, message)
    })

    connection.on('close', () => {
      this.disconnectUser(userId)
    })

    connection.on('error', (error: any) => {
      console.error(`WebSocket错误 (${userId}):`, error)
      this.disconnectUser(userId)
    })

    // 发送连接确认
    this.sendToUser(userId, {
      type: 'connection_established',
      data: { userId, timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString()
    })
  }

  // 用户断开连接
  public disconnectUser(userId: string) {
    this.connections.delete(userId)
    
    // 从所有房间中移除用户
    for (const [roomId, users] of this.rooms) {
      users.delete(userId)
      if (users.size === 0) {
        this.rooms.delete(roomId)
      }
    }

    console.log(`🔌 用户断开: ${userId}`)
  }

  // 处理消息
  private handleMessage(userId: string, message: string) {
    try {
      const data = JSON.parse(message)
      
      switch (data.type) {
        case 'join_room':
          this.joinRoom(userId, data.roomId)
          break
          
        case 'leave_room':
          this.leaveRoom(userId, data.roomId)
          break
          
        case 'send_message':
          this.handleUserMessage(userId, data)
          break
          
        case 'typing_start':
          this.handleTypingStart(userId, data)
          break
          
        case 'typing_stop':
          this.handleTypingStop(userId, data)
          break
          
        case 'ping':
          this.sendToUser(userId, {
            type: 'pong',
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString()
          })
          break
          
        default:
          console.warn(`未知消息类型: ${data.type}`)
      }
    } catch (error) {
      console.error('处理WebSocket消息失败:', error)
    }
  }

  // 加入房间
  public joinRoom(userId: string, roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set())
    }
    
    this.rooms.get(roomId)!.add(userId)
    
    // 通知房间内其他用户
    this.broadcastToRoom(roomId, {
      type: 'user_joined_room',
      data: { userId, roomId },
      timestamp: new Date().toISOString()
    }, userId)

    console.log(`👥 用户 ${userId} 加入房间 ${roomId}`)
  }

  // 离开房间
  public leaveRoom(userId: string, roomId: string) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.delete(userId)
      
      if (room.size === 0) {
        this.rooms.delete(roomId)
      } else {
        // 通知房间内其他用户
        this.broadcastToRoom(roomId, {
          type: 'user_left_room',
          data: { userId, roomId },
          timestamp: new Date().toISOString()
        })
      }
    }

    console.log(`👥 用户 ${userId} 离开房间 ${roomId}`)
  }

  // 处理用户消息
  private handleUserMessage(userId: string, data: any) {
    const { roomId, content, messageType = 'text' } = data
    
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      content,
      messageType,
      roomId,
      timestamp: new Date().toISOString()
    }

    // 广播到房间
    this.broadcastToRoom(roomId, {
      type: 'new_message',
      data: message,
      timestamp: new Date().toISOString()
    })
  }

  // 处理开始输入
  private handleTypingStart(userId: string, data: any) {
    const { roomId } = data
    
    this.broadcastToRoom(roomId, {
      type: 'typing_start',
      data: { userId, roomId },
      timestamp: new Date().toISOString()
    }, userId)
  }

  // 处理停止输入
  private handleTypingStop(userId: string, data: any) {
    const { roomId } = data
    
    this.broadcastToRoom(roomId, {
      type: 'typing_stop',
      data: { userId, roomId },
      timestamp: new Date().toISOString()
    }, userId)
  }

  // 发送消息给特定用户
  public sendToUser(userId: string, message: WebSocketMessage) {
    const connection = this.connections.get(userId)
    if (connection && connection.readyState === 1) { // WebSocket.OPEN
      try {
        connection.send(JSON.stringify(message))
      } catch (error) {
        console.error(`发送消息给用户 ${userId} 失败:`, error)
        this.disconnectUser(userId)
      }
    }
  }

  // 广播消息给所有连接的用户
  public broadcast(message: WebSocketMessage, excludeUserId?: string) {
    for (const [userId, connection] of this.connections) {
      if (excludeUserId && userId === excludeUserId) continue
      
      if (connection.readyState === 1) { // WebSocket.OPEN
        try {
          connection.send(JSON.stringify(message))
        } catch (error) {
          console.error(`广播消息给用户 ${userId} 失败:`, error)
          this.disconnectUser(userId)
        }
      }
    }
  }

  // 广播消息给房间内的用户
  public broadcastToRoom(roomId: string, message: WebSocketMessage, excludeUserId?: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    for (const userId of room) {
      if (excludeUserId && userId === excludeUserId) continue
      this.sendToUser(userId, message)
    }
  }

  // 获取在线用户数量
  public getOnlineUserCount(): number {
    return this.connections.size
  }

  // 获取房间用户数量
  public getRoomUserCount(roomId: string): number {
    const room = this.rooms.get(roomId)
    return room ? room.size : 0
  }

  // 获取用户所在的房间
  public getUserRooms(userId: string): string[] {
    const rooms: string[] = []
    for (const [roomId, users] of this.rooms) {
      if (users.has(userId)) {
        rooms.push(roomId)
      }
    }
    return rooms
  }

  // 获取系统统计
  public getStats() {
    return {
      connectedUsers: this.connections.size,
      activeRooms: this.rooms.size,
      totalRoomUsers: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.size, 0),
      averageUsersPerRoom: this.rooms.size > 0 
        ? Array.from(this.rooms.values()).reduce((sum, room) => sum + room.size, 0) / this.rooms.size 
        : 0,
      lastUpdated: new Date().toISOString()
    }
  }

  // 健康检查
  public healthCheck() {
    const deadConnections: string[] = []
    
    for (const [userId, connection] of this.connections) {
      if (connection.readyState !== 1) { // Not WebSocket.OPEN
        deadConnections.push(userId)
      }
    }

    // 清理死连接
    deadConnections.forEach(userId => {
      this.disconnectUser(userId)
    })

    return {
      healthy: true,
      cleanedConnections: deadConnections.length,
      activeConnections: this.connections.size,
      timestamp: new Date().toISOString()
    }
  }
}

// 导出单例实例
export const wsManager = WebSocketManager.getInstance()

// 模拟WebSocket服务器（在实际部署中应该使用真实的WebSocket服务器）
export class MockWebSocketServer {
  private static instance: MockWebSocketServer
  private isRunning = false

  private constructor() {}

  public static getInstance(): MockWebSocketServer {
    if (!MockWebSocketServer.instance) {
      MockWebSocketServer.instance = new MockWebSocketServer()
    }
    return MockWebSocketServer.instance
  }

  public start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🚀 模拟WebSocket服务器启动')

    // 模拟定期的系统事件
    setInterval(() => {
      this.simulateSystemEvents()
    }, 30000) // 每30秒

    // 模拟健康检查
    setInterval(() => {
      wsManager.healthCheck()
    }, 60000) // 每分钟
  }

  public stop() {
    this.isRunning = false
    console.log('🛑 模拟WebSocket服务器停止')
  }

  private simulateSystemEvents() {
    if (!this.isRunning) return

    // 模拟系统广播
    const systemMessages = [
      '系统维护完成，性能已优化',
      '新增内容源已上线',
      '推荐算法已更新',
      '新功能即将发布'
    ]

    const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)]
    
    wsManager.broadcast({
      type: 'broadcast',
      data: {
        type: 'system_announcement',
        message: randomMessage,
        priority: 'low'
      },
      timestamp: new Date().toISOString()
    })
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      stats: wsManager.getStats(),
      timestamp: new Date().toISOString()
    }
  }
}

// 导出模拟服务器实例
export const mockWsServer = MockWebSocketServer.getInstance()
