'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { Sparkles, Plus, Filter, RefreshCw, Rss, Globe, LogIn, X, Search, Brain, ArrowRight } from 'lucide-react'
import AISearchPortal from '@/components/ai/AISearchPortal'
import SimpleAISearchPortal from '@/components/ai/SimpleAISearchPortal'
import UnifiedAIPortal from '@/components/ai/UnifiedAIPortal'
import { CardGrid } from '@/components/cards/CardGrid'
import { SimpleCardGenerator } from '@/components/cards/SimpleCardGenerator'
import PremiumCard from '@/components/cards/PremiumCard'
import RelaxedCardGrid from '@/components/cards/RelaxedCardGrid'
import PureGradientGrid from '@/components/cards/PureGradientGrid'
// import AIGeneratorHighlight from '@/components/cards/AIGeneratorHighlight'
import DeepContentView from '@/components/content/DeepContentView'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import CommentSection from '@/components/comments/CommentSection'
import { UserMenu } from '@/components/auth/UserMenu'
import { AdvancedSearch } from '@/components/search/AdvancedSearch'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'
import { MobileNavigation, MobileHeader, MobileCardGrid } from '@/components/mobile/MobileNavigation'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor'
import { ThemeToggleButton, AdvancedThemeSelector } from '@/components/theme/AdvancedThemeSelector'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card as CardType } from '@/types'

import { useIsMobile, useSwipeGesture } from '@/hooks/useSwipeGesture'

interface ContentItem {
  id: string
  title: string
  url: string
  summary: string
  publishDate: Date
  author?: string
  category: string
  sourceId: string
  sourceName: string
  imageUrl?: string
  tags: string[]
  readingTime: number
  quality: number
  trending: boolean
  fetchedAt: Date
}

// 模拟数据
const mockCards: CardType[] = [
  {
    id: '1',
    title: 'GPT-4的多模态能力突破：从文本到视觉的AI革命',
    summary: '🚀 AI不再只是"读"文字，现在它能"看"世界了！GPT-4的视觉能力让机器真正理解图像内容。',
    content: 'GPT-4的多模态能力代表了人工智能发展的重要里程碑。这项技术突破使AI系统能够同时处理文本和图像信息，为各行各业带来了前所未有的应用可能性。从医疗诊断到教育辅助，从创意设计到科学研究，多模态AI正在重新定义人机交互的边界。',
    sourceUrl: 'https://example.com/gpt4-multimodal',
    sourceTitle: 'GPT-4多模态能力深度解析',
    author: 'OpenAI研究团队',
    tags: ['GPT-4', '多模态', '计算机视觉', '深度学习'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    category: 'article',
    difficulty: 'intermediate',
    readingTime: 8,
  },
  {
    id: '2',
    title: 'Andrej Karpathy：AI的下一个十年将是Agent的时代',
    summary: '🤖 "未来的AI不是工具，而是伙伴" - Karpathy预测AI Agent将成为每个人的数字助手。',
    content: '前特斯拉AI总监Andrej Karpathy在最新访谈中表示，AI Agent将是下一个十年的主要趋势。他认为，当前的AI模型虽然强大，但缺乏持续学习和自主决策的能力。未来的AI Agent将具备记忆、规划和执行能力，能够在复杂环境中自主完成任务。',
    sourceUrl: 'https://example.com/karpathy-ai-agents',
    sourceTitle: 'Karpathy谈AI Agent的未来',
    author: 'Andrej Karpathy',
    tags: ['AI Agent', '自主AI', '未来趋势', 'Karpathy'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    category: 'kol-opinion',
    difficulty: 'advanced',
    readingTime: 6,
  },
  {
    id: '3',
    title: '大模型训练成本分析：为什么每个token都很昂贵',
    summary: '💰 训练一个GPT级别的模型需要数百万美元，但背后的经济学原理值得深思。',
    content: '大语言模型的训练成本主要包括计算资源、数据获取、人力成本和基础设施投入。以GPT-3为例，其训练成本估计在460万美元左右。这个数字背后反映了AI技术的资本密集性特征，也解释了为什么只有少数大公司能够负担得起最先进的AI模型开发。',
    sourceUrl: 'https://example.com/llm-training-cost',
    sourceTitle: '大模型训练成本深度分析',
    author: 'AI Economics研究院',
    tags: ['训练成本', '大模型', '经济学', 'GPT'],
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    category: 'insight',
    difficulty: 'beginner',
    readingTime: 5,
  }
]

export default function Home() {
  const { user } = useAuth()
  const t = useTranslations('header')
  const tCommon = useTranslations('common')
  const tCards = useTranslations('cards')
  const [cards, setCards] = useState<CardType[]>([])
  const [latestContent, setLatestContent] = useState<ContentItem[]>([])
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [isDeepContentOpen, setIsDeepContentOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [selectedCardForComments, setSelectedCardForComments] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'recent' | 'trending'>('all')
  const [activeTab, setActiveTab] = useState<'generated' | 'latest'>('latest')
  const [dataSourceStatus, setDataSourceStatus] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<CardType[]>([])
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('light')
  const [aiSearchQuery, setAiSearchQuery] = useState('')
  const [aiSearchResults, setAiSearchResults] = useState<CardType[]>([])
  const [isAiSearching, setIsAiSearching] = useState(false)
  const [showAiResults, setShowAiResults] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    // 标记为客户端渲染
    setIsClient(true)

    // 加载现有卡片
    const savedCards = localStorage.getItem('ai-cards')
    if (savedCards) {
      setCards(JSON.parse(savedCards))
    } else {
      // 如果没有保存的卡片，使用模拟数据
      setCards(mockCards)
    }

    // 加载最新数据源内容
    loadLatestContent()
    loadDataSourceStatus()

    // 设置定时刷新
    const interval = setInterval(() => {
      loadLatestContent()
      loadDataSourceStatus()
    }, 60000) // 每分钟检查一次

    return () => clearInterval(interval)
  }, [])

  const loadLatestContent = async () => {
    try {
      const response = await fetch('/api/data-sources?action=latest&limit=20')
      if (response.ok) {
        const result = await response.json()
        setLatestContent(result.data)
      }
    } catch (error) {
      console.error('加载最新内容失败:', error)
    }
  }

  const loadDataSourceStatus = async () => {
    try {
      const response = await fetch('/api/data-sources?action=status')
      if (response.ok) {
        const result = await response.json()
        setDataSourceStatus(result.data)
      }
    } catch (error) {
      console.error('加载数据源状态失败:', error)
    }
  }

  const refreshDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' })
      })
      if (response.ok) {
        await loadLatestContent()
        await loadDataSourceStatus()
      }
    } catch (error) {
      console.error('刷新数据源失败:', error)
    }
  }

  const loadMoreContent = async (): Promise<CardType[]> => {
    try {
      // 模拟加载更多内容
      const response = await fetch('/api/data-sources?action=latest&limit=10')
      if (response.ok) {
        const result = await response.json()
        return result.data.map(convertContentItemToCard)
      }
      return []
    } catch (error) {
      console.error('加载更多内容失败:', error)
      return []
    }
  }

  const handleCardGenerated = (newCard: CardType) => {
    const updatedCards = [newCard, ...cards]
    setCards(updatedCards)
    localStorage.setItem('ai-cards', JSON.stringify(updatedCards))
  }

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card)
    setIsDeepContentOpen(true)
  }

  const handleCommentClick = (cardId: string) => {
    setSelectedCardForComments(cardId)
    setIsCommentsOpen(true)
  }

  // 处理高级搜索
  const handleAdvancedSearch = async (filters: any) => {
    try {
      const params = new URLSearchParams()

      if (filters.query) params.append('q', filters.query)
      if (filters.category !== 'all') params.append('category', filters.category)
      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty)
      if (filters.author) params.append('author', filters.author)
      if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange)
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','))
      if (filters.readingTime !== 'all') params.append('readingTime', filters.readingTime)
      if (filters.sortBy !== 'newest') params.append('sortBy', filters.sortBy)

      const response = await fetch(`/api/search?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.cards)
        setIsSearchMode(true)
        setActiveTab('generated') // 切换到搜索结果显示
      } else {
        console.error('Search failed:', data.error)
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  // 清除搜索结果
  const clearSearch = () => {
    setSearchResults([])
    setIsSearchMode(false)
    setActiveTab('latest')
  }

  // 统一生成处理函数
  const handleUnifiedGenerate = async (input: string, type: 'url' | 'search', searchType?: string) => {
    setIsAiSearching(true)
    setShowAiResults(true)
    setActiveTab('generated')

    try {
      if (type === 'url') {
        // 处理URL生成
        await handleUrlGenerate(input)
      } else {
        // 处理搜索生成
        await handleSearchGenerate(input, searchType || 'explore')
      }
    } catch (error) {
      console.error('生成错误:', error)
      // 使用模拟数据作为降级方案
      const timestamp = new Date().toISOString()
      const baseId = Date.now()
      const context = {
        inputType: type,
        timestamp: timestamp,
        baseId: baseId,
        complexity: input.length > 50 ? 'high' : input.length > 20 ? 'medium' : 'low'
      }
      const aiCards = generateAiCards(input, null, searchType || 'explore', context)
      setAiSearchResults(aiCards)
    } finally {
      setIsAiSearching(false)
    }
  }

  // URL生成处理
  const handleUrlGenerate = async (url: string) => {
    const timestamp = new Date().toISOString()
    const baseId = Date.now()
    const context = {
      inputType: 'url',
      url: url,
      timestamp: timestamp,
      baseId: baseId,
      complexity: 'medium'
    }

    // 生成URL相关的卡片
    const aiCards = generateUrlCards(url, context)
    setAiSearchResults(aiCards)
  }

  // 搜索生成处理
  const handleSearchGenerate = async (query: string, searchType: string) => {
    const timestamp = new Date().toISOString()
    const baseId = Date.now()
    const context = {
      inputType: 'search',
      searchType: searchType,
      timestamp: timestamp,
      baseId: baseId,
      complexity: query.length > 50 ? 'high' : query.length > 20 ? 'medium' : 'low'
    }

    // 调用Agentic RAG API
    const response = await fetch('/api/agentic-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        action: 'search',
        context: {
          ...context,
          searchType: searchType
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      const aiCards = generateAiCards(query, data.data, searchType, context)
      setAiSearchResults(aiCards)
    } else {
      const aiCards = generateAiCards(query, null, searchType, context)
      setAiSearchResults(aiCards)
    }
  }

  // AI搜索处理 - 新的统一处理函数
  const handleAiSearch = async (query: string, type: string, context: any) => {
    if (!query.trim()) return

    setIsAiSearching(true)
    setShowAiResults(true)
    setActiveTab('generated')

    try {
      // 调用Agentic RAG API
      const response = await fetch('/api/agentic-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          action: 'search',
          context: {
            ...context,
            searchType: type
          }
        })
      })

      if (response.ok) {
        const data = await response.json()

        // 生成AI卡片
        const aiCards = generateAiCards(query, data.data, type, context)
        setAiSearchResults(aiCards)

      } else {
        console.error('AI搜索失败')
        // 使用模拟数据作为降级方案
        const aiCards = generateAiCards(query, null, type, context)
        setAiSearchResults(aiCards)
      }
    } catch (error) {
      console.error('AI搜索错误:', error)
      // 使用模拟数据作为降级方案
      const aiCards = generateAiCards(query, null, type, context)
      setAiSearchResults(aiCards)
    } finally {
      setIsAiSearching(false)
    }
  }

  // 生成URL卡片
  const generateUrlCards = (url: string, context: any): CardType[] => {
    const timestamp = context.timestamp || new Date().toISOString()
    const baseId = context.baseId || Date.now()

    // 从URL提取域名作为标题
    let domain = url
    try {
      domain = new URL(url).hostname.replace('www.', '')
    } catch {
      // 如果URL格式不正确，使用原始输入
    }

    return [
      {
        id: `url-content-${baseId}`,
        title: `${domain} - 内容解析`,
        summary: `从${url}提取的核心内容和关键信息`,
        content: `网页内容分析：主要观点、核心论述、关键数据。内容结构：标题层次、段落组织、逻辑脉络。价值提取：实用信息、学习要点、行动建议。相关资源：延伸阅读、参考链接、工具推荐。`,
        tags: ['网页解析', '内容提取', domain],
        category: 'content',
        difficulty: 'intermediate',
        readingTime: 8,
        author: 'AI Assistant',
        createdAt: timestamp,
        metadata: {
          source: 'url_analysis',
          url: url,
          inputType: 'url',
          context: context
        }
      },
      {
        id: `url-summary-${baseId + 1}`,
        title: `${domain} - 核心摘要`,
        summary: `${url}的核心内容摘要和要点总结`,
        content: `核心观点：主要论点、关键结论、重要发现。数据洞察：统计数据、趋势分析、量化指标。实践应用：具体方法、操作步骤、实施建议。影响意义：行业影响、发展趋势、未来展望。`,
        tags: ['内容摘要', '要点提取', domain],
        category: 'summary',
        difficulty: 'beginner',
        readingTime: 5,
        author: 'AI Assistant',
        createdAt: timestamp,
        metadata: {
          source: 'url_analysis',
          url: url,
          inputType: 'url',
          context: context
        }
      },
      {
        id: `url-insights-${baseId + 2}`,
        title: `${domain} - 深度洞察`,
        summary: `基于${url}内容的深度分析和洞察`,
        content: `深层分析：背景脉络、发展历程、影响因素。关联思考：相关领域、交叉学科、系统思维。创新启发：新颖观点、创意思路、突破方向。行动指南：具体建议、实施路径、注意事项。`,
        tags: ['深度分析', '洞察思考', domain],
        category: 'analysis',
        difficulty: 'advanced',
        readingTime: 12,
        author: 'AI Assistant',
        createdAt: timestamp,
        metadata: {
          source: 'url_analysis',
          url: url,
          inputType: 'url',
          context: context
        }
      }
    ]
  }

  // 生成AI卡片 - 支持不同搜索类型
  const generateAiCards = (query: string, ragData: any, type: string, context: any): CardType[] => {
    const timestamp = context.timestamp || new Date().toISOString()
    const baseId = context.baseId || Date.now()

    // 根据搜索类型生成不同的卡片
    const cardTemplates = getCardTemplatesByType(type, query, ragData, context)

    return cardTemplates.map((template, index) => ({
      id: `ai-${type}-${baseId + index}`,
      title: template.title,
      summary: template.summary,
      content: template.content,
      tags: template.tags,
      category: template.category,
      difficulty: template.difficulty,
      readingTime: template.readingTime,
      author: 'AI Assistant',
      createdAt: timestamp,
      metadata: {
        source: 'agentic_rag',
        searchType: type,
        confidence: ragData?.confidence || 0.8,
        ragSteps: ragData?.retrievalSteps?.length || 0,
        context: context
      }
    }))
  }

  // 根据搜索类型获取卡片模板
  const getCardTemplatesByType = (type: string, query: string, ragData: any, context: any) => {
    const baseContent = ragData?.finalAnswer || `关于${query}的详细分析和深度解读。`

    switch (type) {
      case 'learn':
        return [
          {
            title: `${query} - 基础入门指南`,
            summary: `${query}的基础概念和入门指南，适合初学者学习。`,
            content: `${baseContent}\n\n核心概念：机器学习算法、数据预处理、模型训练。学习路径：理论基础 → 实践项目 → 进阶应用。关键技能：Python编程、数据分析、算法理解。实践建议：从简单项目开始，逐步提升复杂度。`,
            tags: ['学习指南', '基础概念', query],
            category: 'tutorial',
            difficulty: 'beginner',
            readingTime: 8
          },
          {
            title: `${query} - 进阶实践技巧`,
            summary: `${query}的进阶知识和实践技巧。`,
            content: `深入探讨${query}的高级概念和实际应用技巧。高级算法：深度神经网络、集成学习、强化学习。优化技术：超参数调优、模型压缩、分布式训练。实战项目：推荐系统、计算机视觉、自然语言处理。性能提升：特征工程、数据增强、模型融合。`,
            tags: ['进阶学习', '实践技巧', query],
            category: 'advanced',
            difficulty: 'intermediate',
            readingTime: 12
          },
          {
            title: `${query} - 完整学习路径`,
            summary: `完整的${query}学习路径和资源推荐。`,
            content: `为学习${query}制定的完整路径，包括必备知识点和推荐资源。第一阶段：数学基础、编程基础。第二阶段：算法理论、实践项目。第三阶段：深度学习、专业应用。推荐资源：在线课程、开源项目、技术书籍。学习建议：理论与实践并重，持续项目练习。`,
            tags: ['学习路径', '资源推荐', query],
            category: 'guide',
            difficulty: 'beginner',
            readingTime: 6
          }
        ]

      case 'create':
        return [
          {
            title: `${query} - 创新应用方案`,
            summary: `基于${query}的创新想法和实现方案。`,
            content: `${baseContent}\n\n创新方向：智能推荐、个性化服务、自动化决策。应用场景：电商平台、内容分发、金融风控。技术亮点：实时学习、多模态融合、边缘计算。商业价值：提升效率、降低成本、增强体验。实施策略：MVP验证、迭代优化、规模化部署。`,
            tags: ['创意方案', '创新应用', query],
            category: 'creative',
            difficulty: 'intermediate',
            readingTime: 10
          },
          {
            title: `${query} - 项目开发蓝图`,
            summary: `${query}相关的项目想法和开发思路。`,
            content: `基于${query}的项目构思，包括技术选型和实现策略。架构设计：微服务架构、云原生部署、容器化管理。技术栈：Python/TensorFlow、React/Node.js、Docker/Kubernetes。开发流程：需求分析、原型设计、迭代开发、测试部署。团队配置：算法工程师、前端开发、后端开发、产品经理。`,
            tags: ['项目构思', '开发思路', query],
            category: 'project',
            difficulty: 'advanced',
            readingTime: 15
          },
          {
            title: `${query} - 设计创意灵感`,
            summary: `${query}在设计领域的应用和灵感来源。`,
            content: `从设计角度探讨${query}的应用价值和创意潜力。设计理念：以用户为中心、数据驱动设计、智能交互。视觉风格：简约现代、科技感、渐变色彩。交互模式：语音交互、手势控制、个性化界面。用户体验：无缝衔接、智能预测、情感化设计。设计工具：Figma、Sketch、Principle、Framer。`,
            tags: ['设计灵感', '创意设计', query],
            category: 'design',
            difficulty: 'intermediate',
            readingTime: 8
          }
        ]

      case 'analyze':
        return [
          {
            title: `${query} - 深度分析`,
            summary: `${query}的全面分析和技术解读。`,
            content: `${baseContent}\n\n从多个维度深入分析${query}的技术特点和应用价值。`,
            tags: ['深度分析', '技术解读', query],
            category: 'analysis',
            difficulty: 'advanced',
            readingTime: 12
          },
          {
            title: `${query} - 对比研究`,
            summary: `${query}与相关技术的对比分析。`,
            content: `通过对比分析，深入理解${query}的优势和适用场景。`,
            tags: ['对比分析', '技术对比', query],
            category: 'comparison',
            difficulty: 'intermediate',
            readingTime: 10
          },
          {
            title: `${query} - 趋势预测`,
            summary: `${query}的发展趋势和未来展望。`,
            content: `基于当前发展状况，预测${query}的未来发展方向。`,
            tags: ['趋势预测', '未来展望', query],
            category: 'trend',
            difficulty: 'advanced',
            readingTime: 8
          }
        ]

      default: // explore
        return [
          {
            title: `${query} - 核心概念`,
            summary: `${query}的核心概念和基本原理。`,
            content: `${baseContent}\n\n探索${query}的核心概念，理解其基本工作原理。`,
            tags: ['核心概念', '基本原理', query],
            category: 'concept',
            difficulty: 'intermediate',
            readingTime: 8
          },
          {
            title: `${query} - 实际应用`,
            summary: `${query}在现实世界中的应用案例。`,
            content: `${query}的实际应用场景和成功案例分析。`,
            tags: ['实际应用', '应用案例', query],
            category: 'application',
            difficulty: 'beginner',
            readingTime: 6
          },
          {
            title: `${query} - 技术生态`,
            summary: `${query}相关的技术生态和工具链。`,
            content: `围绕${query}构建的技术生态系统和相关工具。`,
            tags: ['技术生态', '工具链', query],
            category: 'ecosystem',
            difficulty: 'intermediate',
            readingTime: 10
          }
        ]
    }
  }

  // 清除AI搜索结果
  const clearAiSearch = () => {
    setAiSearchResults([])
    setShowAiResults(false)
    if (isSearchMode) {
      setIsSearchMode(false)
      setActiveTab('latest')
    }
  }



  // 手势支持
  const swipeRef = useSwipeGesture({
    onSwipeLeft: () => {
      if (activeTab === 'latest') {
        setActiveTab('generated')
      }
    },
    onSwipeRight: () => {
      if (activeTab === 'generated') {
        setActiveTab('latest')
      }
    }
  })

  const convertContentItemToCard = (item: ContentItem): CardType => {
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.summary,
      tags: item.tags,
      category: item.category as any,
      difficulty: 'intermediate',
      readingTime: item.readingTime,
      author: item.author || 'Unknown',
      createdAt: typeof item.fetchedAt === 'string' ? item.fetchedAt : new Date(item.fetchedAt).toISOString(),
      imageUrl: item.imageUrl,
      metadata: {
        framework: 'data-source',
        trending: item.trending,
        qualityScore: item.quality,
        source: item.sourceName
      }
    }
  }

  const filteredCards = cards.filter(card => {
    if (!isClient) return true // 服务端渲染时显示所有卡片

    switch (filter) {
      case 'recent':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return new Date(card.createdAt) > oneWeekAgo
      case 'trending':
        return card.metadata?.trending || false
      default:
        return true
    }
  })

  const filteredLatestContent = latestContent.filter(item => {
    if (!isClient) return true // 服务端渲染时显示所有内容

    switch (filter) {
      case 'trending':
        return item.trending
      case 'recent':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const itemDate = typeof item.fetchedAt === 'string' ? new Date(item.fetchedAt) : new Date(item.fetchedAt)
        return itemDate > oneWeekAgo
      default:
        return true
    }
  })

  return (
    <div
      ref={swipeRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50"
    >
      {/* 移动端头部 */}
      {isClient && isMobile && (
        <MobileHeader
          title={isSearchMode ? '搜索结果' : activeTab === 'latest' ? '最新内容' : 'AI生成卡片'}
        />
      )}

      {/* 装饰性背景元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/3 w-36 h-36 bg-yellow-200/20 rounded-full blur-3xl" />
      </div>

      {/* 桌面端头部导航 */}
      <header className={`relative bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 ${isClient && isMobile ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
                  <p className="text-sm text-gray-600">{t('subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 数据源状态 */}
              {dataSourceStatus && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>{dataSourceStatus.active}/{dataSourceStatus.total} 数据源</span>
                  <span className="text-gray-400">|</span>
                  <span>{dataSourceStatus.contentCount} 内容</span>
                </div>
              )}

              {/* 刷新按钮 */}
              <button
                onClick={refreshDataSources}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>

              {/* 筛选器 */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部</option>
                  <option value="recent">最近</option>
                  <option value="trending">热门</option>
                </select>
              </div>

              <button
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
              >
                <Filter className="w-4 h-4" />
                <span>{t('advancedSearch')}</span>
              </button>

              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>{t('generateCard')}</span>
              </button>

              {/* 导航链接 */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/search"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  搜索
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  分析
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  个人中心
                </Link>
              </div>

              {/* 语言切换 */}
              <LanguageSwitcher />

              {/* 主题切换 */}
              <ThemeToggleButton onClick={() => setIsThemeSelectorOpen(true)} />

              {/* 通知中心 */}
              <NotificationCenter />

              {/* 用户认证区域 */}
              {user ? (
                <UserMenu />
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>登录</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* AI智能生成入口 */}
        <UnifiedAIPortal
          onGenerate={handleUnifiedGenerate}
          isLoading={isAiSearching}
          className="mb-8"
        />
        {/* 标签页导航 */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setActiveTab('latest')
              if (isSearchMode) clearSearch()
            }}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'latest' && !isSearchMode
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Rss className="w-4 h-4 mr-2" />
            最新内容
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
              {latestContent.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('generated')
              if (isSearchMode) clearSearch()
            }}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'generated' && !isSearchMode
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            生成卡片
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
              {cards.length}
            </span>
          </button>
          {isClient && isSearchMode && (
            <button
              onClick={clearSearch}
              className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-green-500 text-white shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              搜索结果
              <span className="ml-2 px-2 py-1 bg-green-400 text-green-900 text-xs rounded-full">
                {searchResults.length}
              </span>
              <X className="w-4 h-4 ml-2" />
            </button>
          )}
          {isClient && showAiResults && (
            <button
              onClick={clearAiSearch}
              className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI生成结果
              <span className="ml-2 px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                {aiSearchResults.length}
              </span>
              <X className="w-4 h-4 ml-2" />
            </button>
          )}

        </div>

        {/* AI生成器突出显示 */}
        {activeTab === 'generated' && filteredCards.length === 0 && (
          <div className="mb-12 text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-16 h-16 text-purple-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">AI 智能生成</h2>
            <p className="text-xl text-gray-600 mb-8">将任何链接转化为精美卡片</p>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-lg font-bold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-6 h-6" />
              <span>开始创造</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* 内容区域 */}
        <div>
          {isClient && showAiResults ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI智能生成</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {aiSearchResults.length} 个卡片
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  基于Agentic RAG技术的智能卡片生成，根据搜索类型提供个性化的知识内容
                </p>
              </div>
              <PureGradientGrid
                cards={aiSearchResults}
                onCardClick={handleCardClick}
                onLoadMore={loadMoreContent}
                showControls={false}
              />
            </div>
          ) : isClient && isSearchMode ? (
            <PureGradientGrid
              cards={searchResults}
              onCardClick={handleCardClick}
              onLoadMore={loadMoreContent}
              title="搜索结果"
            />
          ) : activeTab === 'latest' ? (
            <PureGradientGrid
              cards={filteredLatestContent.map(convertContentItemToCard)}
              onCardClick={handleCardClick}
              onLoadMore={loadMoreContent}
              title="最新内容"
            />
          ) : (
            <PureGradientGrid
              cards={filteredCards}
              onCardClick={handleCardClick}
              onLoadMore={loadMoreContent}
              title="AI生成卡片"
            />
          )}
        </div>
      </main>

      {/* 卡片生成器 */}
      <SimpleCardGenerator
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onCardGenerated={handleCardGenerated}
      />

      {/* 深度内容视图 */}
      {selectedCard && (
        <DeepContentView
          card={selectedCard}
          isOpen={isDeepContentOpen}
          onClose={() => {
            setIsDeepContentOpen(false)
            setSelectedCard(null)
          }}
        />
      )}

      {/* 评论系统 */}
      {selectedCardForComments && (
        <CommentSection
          cardId={selectedCardForComments}
          isOpen={isCommentsOpen}
          onClose={() => {
            setIsCommentsOpen(false)
            setSelectedCardForComments(null)
          }}
        />
      )}

      {/* 认证模态框 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 高级搜索 */}
      <AdvancedSearch
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearch={handleAdvancedSearch}
      />

      {/* 移动端导航 */}
      {isClient && isMobile && (
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearchClick={() => setIsAdvancedSearchOpen(true)}
          onGenerateClick={() => setIsGeneratorOpen(true)}
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* 主题选择器 */}
      <AdvancedThemeSelector
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />

      {/* 性能监控 */}
      <PerformanceMonitor />
    </div>
  )
}
