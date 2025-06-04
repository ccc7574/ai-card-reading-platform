export interface Card {
  id: string
  title: string
  summary: string // 金句/高度概括的内容
  content: string // 详细解读内容
  imageUrl?: string // 简笔画URL
  sourceUrl: string // 原文链接
  sourceTitle: string // 原文标题
  author?: string // 作者/KOL
  tags: string[]
  createdAt: Date
  updatedAt: Date
  category: 'article' | 'kol-opinion' | 'insight'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  readingTime: number // 预估阅读时间（分钟）
}

export interface CardConnection {
  id: string
  fromCardId: string
  toCardId: string
  connectionType: 'related' | 'prerequisite' | 'follow-up' | 'contrast'
  description: string
  strength: number // 关联强度 0-1
}

export interface MemoryMap {
  id: string
  title: string
  description: string
  cards: Card[]
  connections: CardConnection[]
  centerCardId?: string // 中心卡片
  createdAt: Date
  updatedAt: Date
}

export interface AISource {
  id: string
  name: string
  url: string
  type: 'rss' | 'website' | 'twitter' | 'blog'
  isActive: boolean
  lastCrawled?: Date
}

export interface ProcessingJob {
  id: string
  sourceId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: Date
  completedAt?: Date
  error?: string
}
