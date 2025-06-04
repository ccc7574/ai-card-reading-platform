// 推送通知系统
export interface PushSubscription {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
  createdAt: Date
  isActive: boolean
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
  requireInteraction?: boolean
  silent?: boolean
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface NotificationTemplate {
  id: string
  name: string
  title: string
  body: string
  icon: string
  category: string
  priority: 'low' | 'normal' | 'high'
  variables?: string[]
}

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private subscriptions = new Map<string, PushSubscription>()
  private templates = new Map<string, NotificationTemplate>()
  private notificationHistory: any[] = []

  private constructor() {
    this.initializeTemplates()
  }

  public static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  // 初始化通知模板
  private initializeTemplates() {
    const templates: NotificationTemplate[] = [
      {
        id: 'new_comment',
        name: '新评论通知',
        title: '💬 新评论',
        body: '{userName} 评论了您关注的内容',
        icon: '/icons/comment.png',
        category: 'social',
        priority: 'normal',
        variables: ['userName', 'cardTitle']
      },
      {
        id: 'new_like',
        name: '点赞通知',
        title: '❤️ 新点赞',
        body: '{userName} 点赞了您的评论',
        icon: '/icons/like.png',
        category: 'social',
        priority: 'low',
        variables: ['userName']
      },
      {
        id: 'new_share',
        name: '分享通知',
        title: '🔗 内容被分享',
        body: '您的内容被分享了 {shareCount} 次',
        icon: '/icons/share.png',
        category: 'engagement',
        priority: 'normal',
        variables: ['shareCount']
      },
      {
        id: 'achievement_unlocked',
        name: '成就解锁',
        title: '🏆 成就解锁',
        body: '恭喜！您解锁了新成就：{achievementName}',
        icon: '/icons/achievement.png',
        category: 'achievement',
        priority: 'high',
        variables: ['achievementName']
      },
      {
        id: 'daily_digest',
        name: '每日摘要',
        title: '📰 今日精选',
        body: '为您推荐了 {count} 篇精选内容',
        icon: '/icons/digest.png',
        category: 'content',
        priority: 'normal',
        variables: ['count']
      },
      {
        id: 'trending_content',
        name: '热门内容',
        title: '🔥 热门推荐',
        body: '发现热门内容：{title}',
        icon: '/icons/trending.png',
        category: 'content',
        priority: 'normal',
        variables: ['title']
      },
      {
        id: 'system_update',
        name: '系统更新',
        title: '🔄 系统更新',
        body: '新功能已上线：{feature}',
        icon: '/icons/update.png',
        category: 'system',
        priority: 'low',
        variables: ['feature']
      }
    ]

    templates.forEach(template => {
      this.templates.set(template.id, template)
    })

    console.log(`📋 已加载 ${templates.length} 个通知模板`)
  }

  // 订阅推送通知
  public async subscribe(userId: string, subscription: any): Promise<boolean> {
    try {
      const pushSubscription: PushSubscription = {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: navigator.userAgent,
        createdAt: new Date(),
        isActive: true
      }

      this.subscriptions.set(userId, pushSubscription)
      
      console.log(`🔔 用户 ${userId} 已订阅推送通知`)
      
      // 发送欢迎通知
      await this.sendWelcomeNotification(userId)
      
      return true
    } catch (error) {
      console.error('订阅推送通知失败:', error)
      return false
    }
  }

  // 取消订阅
  public unsubscribe(userId: string): boolean {
    const subscription = this.subscriptions.get(userId)
    if (subscription) {
      subscription.isActive = false
      console.log(`🔕 用户 ${userId} 已取消推送通知订阅`)
      return true
    }
    return false
  }

  // 发送通知
  public async sendNotification(
    userId: string, 
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const subscription = this.subscriptions.get(userId)
      if (!subscription || !subscription.isActive) {
        console.warn(`用户 ${userId} 未订阅推送通知`)
        return false
      }

      // 在实际实现中，这里会调用Web Push API
      // 现在我们模拟发送成功
      console.log(`📤 发送推送通知给用户 ${userId}:`, payload.title)
      
      // 记录通知历史
      this.notificationHistory.unshift({
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        payload,
        timestamp: new Date(),
        status: 'sent'
      })

      // 限制历史记录数量
      if (this.notificationHistory.length > 1000) {
        this.notificationHistory.splice(1000)
      }

      // 模拟通知发送成功
      setTimeout(() => {
        this.handleNotificationInteraction(userId, payload, 'delivered')
      }, 1000)

      return true
    } catch (error) {
      console.error('发送推送通知失败:', error)
      return false
    }
  }

  // 使用模板发送通知
  public async sendTemplateNotification(
    userId: string,
    templateId: string,
    variables: Record<string, string> = {}
  ): Promise<boolean> {
    const template = this.templates.get(templateId)
    if (!template) {
      console.error(`通知模板 ${templateId} 不存在`)
      return false
    }

    // 替换模板变量
    let title = template.title
    let body = template.body

    Object.entries(variables).forEach(([key, value]) => {
      title = title.replace(`{${key}}`, value)
      body = body.replace(`{${key}}`, value)
    })

    const payload: NotificationPayload = {
      title,
      body,
      icon: template.icon,
      badge: '/icons/badge-72x72.png',
      tag: template.category,
      data: {
        templateId,
        category: template.category,
        priority: template.priority,
        variables
      }
    }

    return await this.sendNotification(userId, payload)
  }

  // 批量发送通知
  public async sendBulkNotification(
    userIds: string[],
    payload: NotificationPayload
  ): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const userId of userIds) {
      const result = await this.sendNotification(userId, payload)
      if (result) {
        success++
      } else {
        failed++
      }
    }

    console.log(`📊 批量通知发送完成: 成功 ${success}, 失败 ${failed}`)
    return { success, failed }
  }

  // 发送欢迎通知
  private async sendWelcomeNotification(userId: string) {
    const payload: NotificationPayload = {
      title: '🎉 欢迎使用AI卡片阅读',
      body: '您已成功开启推送通知，不会错过任何精彩内容！',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'welcome',
      data: {
        type: 'welcome',
        userId
      }
    }

    await this.sendNotification(userId, payload)
  }

  // 处理通知交互
  private handleNotificationInteraction(
    userId: string, 
    payload: NotificationPayload, 
    action: string
  ) {
    console.log(`📱 通知交互: 用户 ${userId}, 动作 ${action}`)
    
    // 更新通知历史状态
    const notification = this.notificationHistory.find(n => 
      n.userId === userId && n.payload.title === payload.title
    )
    
    if (notification) {
      notification.status = action
      notification.interactionTime = new Date()
    }
  }

  // 获取用户订阅状态
  public getSubscriptionStatus(userId: string) {
    const subscription = this.subscriptions.get(userId)
    return {
      isSubscribed: !!subscription?.isActive,
      subscription: subscription || null,
      notificationCount: this.getUserNotificationCount(userId)
    }
  }

  // 获取用户通知数量
  public getUserNotificationCount(userId: string): number {
    return this.notificationHistory.filter(n => n.userId === userId).length
  }

  // 获取通知历史
  public getNotificationHistory(userId?: string, limit: number = 50) {
    let history = this.notificationHistory
    
    if (userId) {
      history = history.filter(n => n.userId === userId)
    }
    
    return history.slice(0, limit)
  }

  // 获取通知模板
  public getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values())
  }

  // 获取模板详情
  public getTemplate(templateId: string): NotificationTemplate | null {
    return this.templates.get(templateId) || null
  }

  // 获取系统统计
  public getStats() {
    const totalSubscriptions = this.subscriptions.size
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(s => s.isActive).length
    
    const notificationsByCategory = this.notificationHistory.reduce((acc, n) => {
      const category = n.payload.data?.category || 'other'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const notificationsByStatus = this.notificationHistory.reduce((acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        inactive: totalSubscriptions - activeSubscriptions
      },
      notifications: {
        total: this.notificationHistory.length,
        byCategory: notificationsByCategory,
        byStatus: notificationsByStatus
      },
      templates: {
        total: this.templates.size,
        categories: Array.from(new Set(Array.from(this.templates.values()).map(t => t.category)))
      },
      performance: {
        deliveryRate: notificationsByStatus.delivered ? 
          (notificationsByStatus.delivered / this.notificationHistory.length * 100).toFixed(1) + '%' : '0%',
        averageDeliveryTime: '1.2s',
        errorRate: notificationsByStatus.failed ? 
          (notificationsByStatus.failed / this.notificationHistory.length * 100).toFixed(1) + '%' : '0%'
      },
      lastUpdated: new Date().toISOString()
    }
  }

  // 清理过期通知
  public cleanupExpiredNotifications(maxAge: number = 30 * 24 * 60 * 60 * 1000) {
    const now = new Date().getTime()
    const initialCount = this.notificationHistory.length
    
    this.notificationHistory = this.notificationHistory.filter(n => 
      now - n.timestamp.getTime() < maxAge
    )
    
    const cleanedCount = initialCount - this.notificationHistory.length
    console.log(`🧹 清理了 ${cleanedCount} 条过期通知`)
    
    return cleanedCount
  }

  // 测试通知
  public async testNotification(userId: string): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '🧪 测试通知',
      body: '这是一条测试通知，用于验证推送功能是否正常工作',
      icon: '/icons/test.png',
      badge: '/icons/badge-72x72.png',
      tag: 'test',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    }

    return await this.sendNotification(userId, payload)
  }
}

// 导出单例实例
export const pushNotificationManager = PushNotificationManager.getInstance()
