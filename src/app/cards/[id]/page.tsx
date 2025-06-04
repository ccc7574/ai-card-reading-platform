'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Clock, User, Tag, Share2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AICard } from '@/components/cards/AICard'
import { Card as CardType } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

// 模拟数据
const mockCard: CardType = {
  id: '1',
  title: 'GPT-4的多模态能力突破：从文本到视觉的AI革命',
  summary: '🚀 AI不再只是"读"文字，现在它能"看"世界了！GPT-4的视觉能力让机器真正理解图像内容。',
  content: `
    <h2>多模态AI的革命性突破</h2>
    <p>GPT-4的多模态能力代表了人工智能发展的重要里程碑。这项技术突破使AI系统能够同时处理文本和图像信息，为各行各业带来了前所未有的应用可能性。</p>
    
    <h3>技术原理</h3>
    <p>多模态AI通过将视觉编码器与语言模型相结合，实现了对图像和文本的统一理解。这种架构允许模型：</p>
    <ul>
      <li>理解图像中的对象、场景和关系</li>
      <li>生成准确的图像描述</li>
      <li>回答关于图像内容的复杂问题</li>
      <li>执行视觉推理任务</li>
    </ul>
    
    <h3>应用场景</h3>
    <p>多模态AI在各个领域都有广泛的应用前景：</p>
    <ul>
      <li><strong>医疗诊断</strong>：分析医学影像，辅助医生诊断</li>
      <li><strong>教育辅助</strong>：理解学生的手写作业和图表</li>
      <li><strong>创意设计</strong>：根据描述生成或修改图像</li>
      <li><strong>科学研究</strong>：分析实验数据和可视化结果</li>
    </ul>
    
    <h3>未来展望</h3>
    <p>随着多模态AI技术的不断发展，我们可以期待更加智能和自然的人机交互体验。这项技术将推动AI从单纯的文本处理工具发展为真正理解世界的智能助手。</p>
  `,
  sourceUrl: 'https://example.com/gpt4-multimodal',
  sourceTitle: 'GPT-4多模态能力深度解析',
  author: 'OpenAI研究团队',
  tags: ['GPT-4', '多模态', '计算机视觉', '深度学习', '人工智能'],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  category: 'article',
  difficulty: 'intermediate',
  readingTime: 8,
  imageUrl: '/api/placeholder/400/300'
}

const relatedCards: CardType[] = [
  {
    id: '2',
    title: 'Andrej Karpathy：AI的下一个十年将是Agent的时代',
    summary: '🤖 "未来的AI不是工具，而是伙伴" - Karpathy预测AI Agent将成为每个人的数字助手。',
    content: '前特斯拉AI总监Andrej Karpathy在最新访谈中表示，AI Agent将是下一个十年的主要趋势...',
    sourceUrl: 'https://example.com/karpathy-ai-agents',
    sourceTitle: 'Karpathy谈AI Agent的未来',
    author: 'Andrej Karpathy',
    tags: ['AI Agent', '自主AI', '未来趋势'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    category: 'kol-opinion',
    difficulty: 'advanced',
    readingTime: 6,
  }
]

export default function CardDetailPage({ params }: { params: { id: string } }) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  const categoryIcons = {
    article: '📄',
    'kol-opinion': '💭',
    insight: '💡'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                记忆地图
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 卡片头部信息 */}
          <Card className="mb-8 bg-white shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{categoryIcons[mockCard.category]}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[mockCard.difficulty]}`}>
                    {mockCard.difficulty}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(mockCard.createdAt)}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {mockCard.title}
              </h1>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">💡 核心洞察</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {mockCard.summary}
                </p>
              </div>
              
              {/* 元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {mockCard.author && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {mockCard.author}
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {mockCard.readingTime} 分钟阅读
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                  onClick={() => window.open(mockCard.sourceUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  查看原文
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {mockCard.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* 配图 */}
              {mockCard.imageUrl && (
                <div className="mb-8 text-center">
                  <img 
                    src={mockCard.imageUrl} 
                    alt={mockCard.title}
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                  />
                  <p className="text-sm text-gray-500 mt-2">AI生成的概念图</p>
                </div>
              )}
              
              {/* 详细内容 */}
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: mockCard.content }}
              />
            </CardContent>
          </Card>
          
          {/* 相关卡片 */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">🔗 相关卡片</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedCards.map((card) => (
                <AICard
                  key={card.id}
                  card={card}
                  onClick={() => {
                    // 导航到相关卡片
                    window.location.href = `/cards/${card.id}`
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
