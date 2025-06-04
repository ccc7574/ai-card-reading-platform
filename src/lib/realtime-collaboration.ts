// 实时协作功能管理
export interface RealtimeUser {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  lastSeen: Date
  currentPage?: string
  currentCard?: string
}

export interface RealtimeComment {
  id: string
  cardId: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  replies?: RealtimeComment[]
  likes: number
  isEdited: boolean
}

export interface RealtimeNotification {
  id: string
  type: 'like' | 'comment' | 'share' | 'follow' | 'achievement'
  userId: string
  targetUserId: string
  content: string
  data?: any
  timestamp: Date
  isRead: boolean
}

export interface RealtimeActivity {
  id: string
  userId: string
  userName: string
  type: 'view' | 'like' | 'comment' | 'share' | 'bookmark'
  cardId: string
  cardTitle: string
  timestamp: Date
}

export class RealtimeCollaborationManager {
  private static instance: RealtimeCollaborationManager
  private users = new Map<string, RealtimeUser>()
  private comments = new Map<string, RealtimeComment[]>() // cardId -> comments
  private notifications = new Map<string, RealtimeNotification[]>() // userId -> notifications
  private activities: RealtimeActivity[] = []
  private eventListeners = new Map<string, Set<Function>>()

  private constructor() {
    this.initializeEventSystem()
  }

  public static getInstance(): RealtimeCollaborationManager {
    if (!RealtimeCollaborationManager.instance) {
      RealtimeCollaborationManager.instance = new RealtimeCollaborationManager()
    }
    return RealtimeCollaborationManager.instance
  }

  // 初始化事件系统
  private initializeEventSystem() {
    // 定期清理离线用户
    setInterval(() => {
      this.cleanupOfflineUsers()
    }, 60000) // 每分钟检查一次

    // 定期清理旧活动
    setInterval(() => {
      this.cleanupOldActivities()
    }, 300000) // 每5分钟清理一次
  }

  // 用户上线
  public userOnline(user: Omit<RealtimeUser, 'status' | 'lastSeen'>): RealtimeUser {
    const realtimeUser: RealtimeUser = {
      ...user,
      status: 'online',
      lastSeen: new Date()
    }

    this.users.set(user.id, realtimeUser)
    this.emit('user_online', realtimeUser)
    
    console.log(`👤 用户上线: ${user.name}`)
    return realtimeUser
  }

  // 用户下线
  public userOffline(userId: string) {
    const user = this.users.get(userId)
    if (user) {
      user.status = 'offline'
      user.lastSeen = new Date()
      this.emit('user_offline', user)
      console.log(`👤 用户下线: ${user.name}`)
    }
  }

  // 更新用户状态
  public updateUserStatus(userId: string, status: RealtimeUser['status'], currentPage?: string, currentCard?: string) {
    const user = this.users.get(userId)
    if (user) {
      user.status = status
      user.lastSeen = new Date()
      if (currentPage !== undefined) user.currentPage = currentPage
      if (currentCard !== undefined) user.currentCard = currentCard
      
      this.emit('user_status_updated', user)
    }
  }

  // 获取在线用户
  public getOnlineUsers(): RealtimeUser[] {
    return Array.from(this.users.values()).filter(user => user.status === 'online')
  }

  // 获取特定页面的在线用户
  public getUsersOnPage(page: string): RealtimeUser[] {
    return this.getOnlineUsers().filter(user => user.currentPage === page)
  }

  // 获取正在查看特定卡片的用户
  public getUsersViewingCard(cardId: string): RealtimeUser[] {
    return this.getOnlineUsers().filter(user => user.currentCard === cardId)
  }

  // 添加实时评论
  public addComment(comment: Omit<RealtimeComment, 'id' | 'timestamp' | 'likes' | 'isEdited'>): RealtimeComment {
    const newComment: RealtimeComment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      likes: 0,
      isEdited: false,
      replies: []
    }

    const cardComments = this.comments.get(comment.cardId) || []
    cardComments.push(newComment)
    this.comments.set(comment.cardId, cardComments)

    // 发送实时通知
    this.emit('new_comment', newComment)
    
    // 通知正在查看该卡片的其他用户
    const viewingUsers = this.getUsersViewingCard(comment.cardId)
    viewingUsers.forEach(user => {
      if (user.id !== comment.userId) {
        this.addNotification({
          type: 'comment',
          userId: comment.userId,
          targetUserId: user.id,
          content: `${comment.userName} 评论了您正在查看的内容`,
          data: { cardId: comment.cardId, commentId: newComment.id }
        })
      }
    })

    console.log(`💬 新评论: ${comment.userName} -> 卡片 ${comment.cardId}`)
    return newComment
  }

  // 获取卡片评论
  public getCardComments(cardId: string): RealtimeComment[] {
    return this.comments.get(cardId) || []
  }

  // 点赞评论
  public likeComment(commentId: string, userId: string): boolean {
    for (const [cardId, comments] of this.comments) {
      const comment = comments.find(c => c.id === commentId)
      if (comment) {
        comment.likes += 1
        this.emit('comment_liked', { commentId, userId, likes: comment.likes })
        
        // 通知评论作者
        if (comment.userId !== userId) {
          this.addNotification({
            type: 'like',
            userId,
            targetUserId: comment.userId,
            content: '有人点赞了您的评论',
            data: { commentId, cardId }
          })
        }
        
        return true
      }
    }
    return false
  }

  // 添加通知
  public addNotification(notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'isRead'>): RealtimeNotification {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false
    }

    const userNotifications = this.notifications.get(notification.targetUserId) || []
    userNotifications.unshift(newNotification) // 添加到开头
    
    // 限制通知数量
    if (userNotifications.length > 100) {
      userNotifications.splice(100)
    }
    
    this.notifications.set(notification.targetUserId, userNotifications)
    this.emit('new_notification', newNotification)
    
    console.log(`🔔 新通知: ${notification.content} -> ${notification.targetUserId}`)
    return newNotification
  }

  // 获取用户通知
  public getUserNotifications(userId: string, limit: number = 20): RealtimeNotification[] {
    const notifications = this.notifications.get(userId) || []
    return notifications.slice(0, limit)
  }

  // 标记通知为已读
  public markNotificationAsRead(userId: string, notificationId: string): boolean {
    const notifications = this.notifications.get(userId) || []
    const notification = notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      this.emit('notification_read', { userId, notificationId })
      return true
    }
    return false
  }

  // 获取未读通知数量
  public getUnreadNotificationCount(userId: string): number {
    const notifications = this.notifications.get(userId) || []
    return notifications.filter(n => !n.isRead).length
  }

  // 记录用户活动
  public recordActivity(activity: Omit<RealtimeActivity, 'id' | 'timestamp'>): RealtimeActivity {
    const newActivity: RealtimeActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.activities.unshift(newActivity) // 添加到开头
    
    // 限制活动数量
    if (this.activities.length > 1000) {
      this.activities.splice(1000)
    }

    this.emit('new_activity', newActivity)
    
    // 根据活动类型发送通知
    if (activity.type === 'like' || activity.type === 'comment') {
      // 这里可以添加更复杂的通知逻辑
    }

    return newActivity
  }

  // 获取最近活动
  public getRecentActivities(limit: number = 50): RealtimeActivity[] {
    return this.activities.slice(0, limit)
  }

  // 获取用户活动
  public getUserActivities(userId: string, limit: number = 20): RealtimeActivity[] {
    return this.activities
      .filter(activity => activity.userId === userId)
      .slice(0, limit)
  }

  // 获取卡片活动
  public getCardActivities(cardId: string, limit: number = 20): RealtimeActivity[] {
    return this.activities
      .filter(activity => activity.cardId === cardId)
      .slice(0, limit)
  }

  // 事件监听
  public on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  // 移除事件监听
  public off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  // 触发事件
  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('事件回调执行失败:', error)
        }
      })
    }
  }

  // 清理离线用户
  private cleanupOfflineUsers() {
    const now = new Date()
    const offlineThreshold = 5 * 60 * 1000 // 5分钟

    for (const [userId, user] of this.users) {
      if (user.status === 'online' && now.getTime() - user.lastSeen.getTime() > offlineThreshold) {
        user.status = 'offline'
        this.emit('user_offline', user)
      }
    }
  }

  // 清理旧活动
  private cleanupOldActivities() {
    const now = new Date()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时

    this.activities = this.activities.filter(activity => 
      now.getTime() - activity.timestamp.getTime() < maxAge
    )
  }

  // 获取系统统计
  public getSystemStats() {
    return {
      onlineUsers: this.getOnlineUsers().length,
      totalUsers: this.users.size,
      totalComments: Array.from(this.comments.values()).reduce((sum, comments) => sum + comments.length, 0),
      totalNotifications: Array.from(this.notifications.values()).reduce((sum, notifications) => sum + notifications.length, 0),
      totalActivities: this.activities.length,
      lastUpdated: new Date().toISOString()
    }
  }

  // 广播消息给所有在线用户
  public broadcast(message: any) {
    this.emit('broadcast', message)
  }

  // 发送消息给特定用户
  public sendToUser(userId: string, message: any) {
    this.emit(`user_message_${userId}`, message)
  }

  // 发送消息给特定页面的用户
  public sendToPage(page: string, message: any) {
    const users = this.getUsersOnPage(page)
    users.forEach(user => {
      this.sendToUser(user.id, message)
    })
  }
}

// 导出单例实例
export const realtimeManager = RealtimeCollaborationManager.getInstance()
