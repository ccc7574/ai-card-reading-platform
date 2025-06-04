// WebSocket客户端管理
export interface WebSocketClientOptions {
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

export interface WebSocketEventHandler {
  (data: any): void
}

export class WebSocketClient {
  private static instance: WebSocketClient
  private ws: WebSocket | null = null
  private url: string = ''
  private options: WebSocketClientOptions
  private eventHandlers = new Map<string, Set<WebSocketEventHandler>>()
  private reconnectAttempts = 0
  private isConnecting = false
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private userId: string | null = null
  private currentRooms = new Set<string>()

  private constructor(options: WebSocketClientOptions = {}) {
    this.options = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...options
    }
  }

  public static getInstance(options?: WebSocketClientOptions): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient(options)
    }
    return WebSocketClient.instance
  }

  // 连接WebSocket
  public connect(userId: string, wsUrl?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve()
        return
      }

      this.userId = userId
      this.isConnecting = true

      // 在实际部署中，这里应该是真实的WebSocket URL
      // 现在我们模拟WebSocket连接
      this.url = wsUrl || `ws://localhost:3001/ws?userId=${userId}`
      
      try {
        // 模拟WebSocket连接
        this.simulateWebSocketConnection()
        resolve()
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  // 模拟WebSocket连接（在实际部署中替换为真实WebSocket）
  private simulateWebSocketConnection() {
    console.log(`🔌 模拟WebSocket连接: ${this.userId}`)
    
    // 模拟连接成功
    setTimeout(() => {
      this.isConnecting = false
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.emit('connection_established', { userId: this.userId })
      console.log('✅ WebSocket连接已建立')
    }, 1000)

    // 模拟接收消息
    this.simulateIncomingMessages()
  }

  // 模拟接收消息
  private simulateIncomingMessages() {
    // 模拟定期接收系统消息
    setInterval(() => {
      if (this.userId) {
        const messageTypes = [
          'user_online',
          'new_comment',
          'new_notification',
          'activity_update'
        ]
        
        const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)]
        
        this.handleMessage({
          type: randomType,
          data: this.generateMockData(randomType),
          timestamp: new Date().toISOString()
        })
      }
    }, 10000) // 每10秒模拟一条消息
  }

  // 生成模拟数据
  private generateMockData(type: string) {
    switch (type) {
      case 'user_online':
        return {
          id: `user_${Math.random().toString(36).substr(2, 5)}`,
          name: `用户${Math.floor(Math.random() * 1000)}`,
          status: 'online'
        }
      
      case 'new_comment':
        return {
          id: `comment_${Date.now()}`,
          cardId: `card_${Math.floor(Math.random() * 10)}`,
          userName: `用户${Math.floor(Math.random() * 100)}`,
          content: '这是一条模拟评论消息'
        }
      
      case 'new_notification':
        return {
          id: `notification_${Date.now()}`,
          type: 'like',
          content: '有人点赞了您的评论',
          isRead: false
        }
      
      case 'activity_update':
        return {
          id: `activity_${Date.now()}`,
          userId: `user_${Math.random().toString(36).substr(2, 5)}`,
          type: 'view',
          cardTitle: '模拟卡片标题'
        }
      
      default:
        return {}
    }
  }

  // 断开连接
  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.stopHeartbeat()
    this.stopReconnect()
    this.currentRooms.clear()
    this.userId = null
    
    console.log('🔌 WebSocket连接已断开')
  }

  // 发送消息
  public send(message: any): boolean {
    if (!this.userId) {
      console.warn('WebSocket未连接，无法发送消息')
      return false
    }

    // 在实际实现中，这里会通过WebSocket发送消息
    // 现在我们模拟发送成功
    console.log('📤 发送WebSocket消息:', message)
    
    // 模拟消息发送成功的回调
    setTimeout(() => {
      if (message.type === 'join_room') {
        this.currentRooms.add(message.roomId)
        this.emit('room_joined', { roomId: message.roomId })
      } else if (message.type === 'leave_room') {
        this.currentRooms.delete(message.roomId)
        this.emit('room_left', { roomId: message.roomId })
      }
    }, 100)
    
    return true
  }

  // 加入房间
  public joinRoom(roomId: string): boolean {
    return this.send({
      type: 'join_room',
      roomId,
      userId: this.userId,
      timestamp: new Date().toISOString()
    })
  }

  // 离开房间
  public leaveRoom(roomId: string): boolean {
    return this.send({
      type: 'leave_room',
      roomId,
      userId: this.userId,
      timestamp: new Date().toISOString()
    })
  }

  // 发送聊天消息
  public sendMessage(roomId: string, content: string, messageType: string = 'text'): boolean {
    return this.send({
      type: 'send_message',
      roomId,
      content,
      messageType,
      userId: this.userId,
      timestamp: new Date().toISOString()
    })
  }

  // 发送输入状态
  public sendTypingStatus(roomId: string, isTyping: boolean): boolean {
    return this.send({
      type: isTyping ? 'typing_start' : 'typing_stop',
      roomId,
      userId: this.userId,
      timestamp: new Date().toISOString()
    })
  }

  // 处理接收到的消息
  private handleMessage(message: any) {
    try {
      console.log('📥 收到WebSocket消息:', message)
      this.emit(message.type, message.data)
    } catch (error) {
      console.error('处理WebSocket消息失败:', error)
    }
  }

  // 开始心跳
  private startHeartbeat() {
    if (this.heartbeatTimer) return

    this.heartbeatTimer = setInterval(() => {
      this.send({
        type: 'ping',
        timestamp: new Date().toISOString()
      })
    }, this.options.heartbeatInterval!)
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 开始重连
  private startReconnect() {
    if (this.reconnectTimer || !this.options.autoReconnect) return

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts!) {
      console.error('WebSocket重连次数已达上限')
      this.emit('reconnect_failed', { attempts: this.reconnectAttempts })
      return
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`🔄 WebSocket重连尝试 ${this.reconnectAttempts}/${this.options.maxReconnectAttempts}`)
      
      this.connect(this.userId!)
        .then(() => {
          this.emit('reconnected', { attempts: this.reconnectAttempts })
          // 重新加入之前的房间
          this.currentRooms.forEach(roomId => {
            this.joinRoom(roomId)
          })
        })
        .catch(() => {
          this.startReconnect() // 继续重连
        })
      
      this.reconnectTimer = null
    }, this.options.reconnectInterval!)
  }

  // 停止重连
  private stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = 0
  }

  // 添加事件监听器
  public on(event: string, handler: WebSocketEventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  // 移除事件监听器
  public off(event: string, handler: WebSocketEventHandler) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  // 触发事件
  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error('WebSocket事件处理器执行失败:', error)
        }
      })
    }
  }

  // 获取连接状态
  public getConnectionState() {
    return {
      isConnected: this.userId !== null,
      userId: this.userId,
      currentRooms: Array.from(this.currentRooms),
      reconnectAttempts: this.reconnectAttempts,
      isConnecting: this.isConnecting
    }
  }

  // 获取统计信息
  public getStats() {
    return {
      ...this.getConnectionState(),
      eventHandlers: this.eventHandlers.size,
      options: this.options,
      lastActivity: new Date().toISOString()
    }
  }
}

// 导出单例实例
export const wsClient = WebSocketClient.getInstance()
