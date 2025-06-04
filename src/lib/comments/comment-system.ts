import { nanoid } from 'nanoid'

// 评论接口
export interface Comment {
  id: string
  cardId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date
  updatedAt: Date
  likes: number
  replies: Reply[]
  isEdited: boolean
  sentiment: 'positive' | 'neutral' | 'negative'
  tags: string[]
}

// 回复接口
export interface Reply {
  id: string
  commentId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date
  likes: number
  replyTo?: string // 回复的用户名
}

// 用户接口
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  joinDate: Date
  commentCount: number
  reputation: number
}

// 评论统计
export interface CommentStats {
  totalComments: number
  totalReplies: number
  averageRating: number
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  topTags: Array<{ tag: string; count: number }>
}

// 评论系统管理器
export class CommentSystem {
  private static instance: CommentSystem | null = null
  private comments: Map<string, Comment> = new Map()
  private users: Map<string, User> = new Map()
  private cardComments: Map<string, string[]> = new Map() // cardId -> commentIds

  static getInstance(): CommentSystem {
    if (!CommentSystem.instance) {
      CommentSystem.instance = new CommentSystem()
    }
    return CommentSystem.instance
  }

  constructor() {
    this.initializeMockData()
  }

  // 初始化模拟数据
  private initializeMockData() {
    // 创建模拟用户
    const mockUsers: Omit<User, 'id'>[] = [
      {
        name: 'Alex Chen',
        email: 'alex@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format&q=80',
        joinDate: new Date('2023-01-15'),
        commentCount: 45,
        reputation: 892
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face&auto=format&q=80',
        joinDate: new Date('2023-03-22'),
        commentCount: 32,
        reputation: 654
      },
      {
        name: 'Michael Zhang',
        email: 'michael@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format&q=80',
        joinDate: new Date('2023-02-10'),
        commentCount: 28,
        reputation: 567
      },
      {
        name: 'Emily Davis',
        email: 'emily@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format&q=80',
        joinDate: new Date('2023-04-05'),
        commentCount: 19,
        reputation: 423
      }
    ]

    mockUsers.forEach(user => {
      const id = nanoid()
      this.users.set(id, { ...user, id })
    })

    console.log(`👥 初始化 ${this.users.size} 个模拟用户`)
  }

  // 添加评论
  addComment(
    cardId: string,
    userId: string,
    content: string
  ): Comment {
    const user = this.users.get(userId)
    if (!user) {
      throw new Error('用户不存在')
    }

    const comment: Comment = {
      id: nanoid(),
      cardId,
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      replies: [],
      isEdited: false,
      sentiment: this.analyzeSentiment(content),
      tags: this.extractTags(content)
    }

    this.comments.set(comment.id, comment)

    // 更新卡片评论索引
    const cardCommentIds = this.cardComments.get(cardId) || []
    cardCommentIds.push(comment.id)
    this.cardComments.set(cardId, cardCommentIds)

    // 更新用户统计
    user.commentCount++

    console.log(`💬 新增评论: ${comment.id} (卡片: ${cardId})`)
    return comment
  }

  // 添加回复
  addReply(
    commentId: string,
    userId: string,
    content: string,
    replyTo?: string
  ): Reply {
    const comment = this.comments.get(commentId)
    const user = this.users.get(userId)

    if (!comment || !user) {
      throw new Error('评论或用户不存在')
    }

    const reply: Reply = {
      id: nanoid(),
      commentId,
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      createdAt: new Date(),
      likes: 0,
      replyTo
    }

    comment.replies.push(reply)
    comment.updatedAt = new Date()

    console.log(`↩️ 新增回复: ${reply.id} (评论: ${commentId})`)
    return reply
  }

  // 点赞评论
  likeComment(commentId: string, userId: string): boolean {
    const comment = this.comments.get(commentId)
    if (!comment) return false

    comment.likes++
    console.log(`👍 评论点赞: ${commentId} (总赞数: ${comment.likes})`)
    return true
  }

  // 点赞回复
  likeReply(commentId: string, replyId: string, userId: string): boolean {
    const comment = this.comments.get(commentId)
    if (!comment) return false

    const reply = comment.replies.find(r => r.id === replyId)
    if (!reply) return false

    reply.likes++
    console.log(`👍 回复点赞: ${replyId} (总赞数: ${reply.likes})`)
    return true
  }

  // 编辑评论
  editComment(commentId: string, userId: string, newContent: string): boolean {
    const comment = this.comments.get(commentId)
    if (!comment || comment.userId !== userId) return false

    comment.content = newContent
    comment.updatedAt = new Date()
    comment.isEdited = true
    comment.sentiment = this.analyzeSentiment(newContent)
    comment.tags = this.extractTags(newContent)

    console.log(`✏️ 编辑评论: ${commentId}`)
    return true
  }

  // 删除评论
  deleteComment(commentId: string, userId: string): boolean {
    const comment = this.comments.get(commentId)
    if (!comment || comment.userId !== userId) return false

    // 从卡片评论索引中移除
    const cardCommentIds = this.cardComments.get(comment.cardId) || []
    const updatedIds = cardCommentIds.filter(id => id !== commentId)
    this.cardComments.set(comment.cardId, updatedIds)

    // 删除评论
    this.comments.delete(commentId)

    // 更新用户统计
    const user = this.users.get(userId)
    if (user) {
      user.commentCount = Math.max(0, user.commentCount - 1)
    }

    console.log(`🗑️ 删除评论: ${commentId}`)
    return true
  }

  // 获取卡片的所有评论
  getCardComments(cardId: string): Comment[] {
    const commentIds = this.cardComments.get(cardId) || []
    const comments = commentIds
      .map(id => this.comments.get(id))
      .filter(comment => comment !== undefined) as Comment[]

    return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // 获取评论统计
  getCommentStats(cardId: string): CommentStats {
    const comments = this.getCardComments(cardId)
    const totalReplies = comments.reduce((sum, comment) => sum + comment.replies.length, 0)

    // 情感分布
    const sentimentCounts = comments.reduce((acc, comment) => {
      acc[comment.sentiment]++
      return acc
    }, { positive: 0, neutral: 0, negative: 0 })

    // 标签统计
    const tagCounts = new Map<string, number>()
    comments.forEach(comment => {
      comment.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))

    return {
      totalComments: comments.length,
      totalReplies,
      averageRating: this.calculateAverageRating(comments),
      sentimentDistribution: sentimentCounts,
      topTags
    }
  }

  // 获取用户信息
  getUser(userId: string): User | undefined {
    return this.users.get(userId)
  }

  // 创建新用户
  createUser(name: string, email: string, avatar?: string): User {
    const user: User = {
      id: nanoid(),
      name,
      email,
      avatar,
      joinDate: new Date(),
      commentCount: 0,
      reputation: 0
    }

    this.users.set(user.id, user)
    console.log(`👤 创建新用户: ${user.name} (${user.id})`)
    return user
  }

  // 生成模拟评论
  generateMockComments(cardId: string, count: number = 3): Comment[] {
    const users = Array.from(this.users.values())
    const mockComments = [
      '这个观点很有启发性，特别是关于AI应用的部分。',
      '非常实用的内容，已经收藏了！期待更多类似的分享。',
      '作者的分析很深入，不过我觉得还可以从另一个角度来看这个问题。',
      '这篇文章解决了我一直困惑的问题，感谢分享！',
      '内容质量很高，但是排版可以再优化一下。',
      '很好的案例分析，对我的工作很有帮助。',
      '观点新颖，但需要更多的数据支撑。',
      '写得很清楚，适合初学者阅读。'
    ]

    const comments: Comment[] = []

    for (let i = 0; i < count && i < users.length; i++) {
      const user = users[i]
      const content = mockComments[Math.floor(Math.random() * mockComments.length)]
      
      const comment = this.addComment(cardId, user.id, content)
      
      // 随机添加一些回复
      if (Math.random() > 0.6) {
        const replyUser = users[(i + 1) % users.length]
        this.addReply(
          comment.id,
          replyUser.id,
          '同意你的观点，这确实是一个值得深入思考的问题。',
          user.name
        )
      }

      // 随机点赞
      if (Math.random() > 0.4) {
        comment.likes = Math.floor(Math.random() * 10) + 1
      }

      comments.push(comment)
    }

    return comments
  }

  // 私有方法

  // 分析情感
  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['好', '棒', '优秀', '赞', '喜欢', '有用', '启发', '感谢', '收藏']
    const negativeWords = ['差', '不好', '问题', '错误', '失望', '糟糕']

    const lowerContent = content.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  // 提取标签
  private extractTags(content: string): string[] {
    const tags = []
    
    if (content.includes('AI') || content.includes('人工智能')) tags.push('AI')
    if (content.includes('技术') || content.includes('科技')) tags.push('技术')
    if (content.includes('设计')) tags.push('设计')
    if (content.includes('商业') || content.includes('业务')) tags.push('商业')
    if (content.includes('创新')) tags.push('创新')
    if (content.includes('学习')) tags.push('学习')

    return tags
  }

  // 计算平均评分
  private calculateAverageRating(comments: Comment[]): number {
    if (comments.length === 0) return 0

    const totalScore = comments.reduce((sum, comment) => {
      const sentimentScore = {
        positive: 5,
        neutral: 3,
        negative: 1
      }[comment.sentiment]
      
      return sum + sentimentScore
    }, 0)

    return totalScore / comments.length
  }
}
