'use client'

import React from 'react'

import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Code, 
  Palette, 
  Zap,
  Globe,
  Lightbulb,
  BarChart3,
  Rocket
} from 'lucide-react'

interface PureGradientCardProps {
  card: {
    id: string
    title: string
    summary?: string
    content?: string
    tags?: string[]
    category?: string
    difficulty?: string
    readingTime?: number
    metadata?: any
  }
  onClick?: () => void
  className?: string
  index?: number
}

// 渐变色配置
const gradientStyles = [
  {
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    icon: Brain,
    accent: 'bg-blue-100 text-blue-800'
  },
  {
    gradient: 'from-purple-500 via-purple-600 to-pink-600',
    icon: Sparkles,
    accent: 'bg-purple-100 text-purple-800'
  },
  {
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    icon: Target,
    accent: 'bg-green-100 text-green-800'
  },
  {
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    icon: TrendingUp,
    accent: 'bg-orange-100 text-orange-800'
  },
  {
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    icon: BookOpen,
    accent: 'bg-cyan-100 text-cyan-800'
  },
  {
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    icon: Code,
    accent: 'bg-violet-100 text-violet-800'
  },
  {
    gradient: 'from-rose-500 via-pink-500 to-purple-600',
    icon: Palette,
    accent: 'bg-rose-100 text-rose-800'
  },
  {
    gradient: 'from-yellow-500 via-orange-500 to-red-600',
    icon: Zap,
    accent: 'bg-yellow-100 text-yellow-800'
  },
  {
    gradient: 'from-teal-500 via-cyan-500 to-blue-600',
    icon: Globe,
    accent: 'bg-teal-100 text-teal-800'
  },
  {
    gradient: 'from-indigo-500 via-blue-500 to-cyan-600',
    icon: Lightbulb,
    accent: 'bg-indigo-100 text-indigo-800'
  },
  {
    gradient: 'from-emerald-500 via-green-500 to-teal-600',
    icon: BarChart3,
    accent: 'bg-emerald-100 text-emerald-800'
  },
  {
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    icon: Rocket,
    accent: 'bg-pink-100 text-pink-800'
  }
]

// 提取关键词的函数
const extractKeywords = (text: string, maxKeywords: number = 4): string[] => {
  if (!text) return []
  
  // 移除标点符号并分词
  const words = text
    .replace(/[^\u4e00-\u9fa5\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1)
  
  // 常见停用词
  const stopWords = ['的', '是', '在', '有', '和', '与', '或', '但', '而', '了', '着', '过', '也', '都', '很', '更', '最', 'the', 'is', 'in', 'and', 'or', 'but', 'with', 'for', 'to', 'of', 'a', 'an']
  
  // 过滤停用词并统计词频
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    const lowerWord = word.toLowerCase()
    if (!stopWords.includes(lowerWord) && word.length > 1) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  })
  
  // 按词频排序并返回前几个
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

// 提取关键短句的函数
const extractKeyPhrases = (text: string, maxPhrases: number = 2): string[] => {
  if (!text) return []
  
  // 按句号、感叹号、问号分句
  const sentences = text
    .split(/[。！？.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 5 && s.length < 50)
  
  // 返回前几个短句
  return sentences.slice(0, maxPhrases)
}

export function PureGradientCard({ card, onClick, className = '', index = 0 }: PureGradientCardProps) {
  // 根据卡片ID或索引选择渐变样式 - 确保服务端和客户端一致
  const styleIndex = card.id ?
    (card.id.charCodeAt(0) + index) % gradientStyles.length :
    index % gradientStyles.length

  const style = gradientStyles[styleIndex]
  const Icon = style.icon

  // 提取关键信息 - 使用确定性的方法
  const keywords = extractKeywords(card.content || card.summary || '', 4)
  const keyPhrases = extractKeyPhrases(card.content || card.summary || '', 2)

  // 合并关键词和短句，优先显示短句
  const keyInfo = [...keyPhrases, ...keywords].slice(0, 5)

  return (
    <div
      className={`group cursor-pointer transform hover:-translate-y-2 transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      <div className="relative h-96 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* 渐变背景 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
        
        {/* 装饰性图案 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full" />
          <div className="absolute bottom-8 left-6 w-12 h-12 bg-white rounded-full" />
          <div className="absolute top-1/2 right-8 w-6 h-6 bg-white rounded-full" />
        </div>
        
        {/* 内容区域 */}
        <div className="relative h-full p-8 flex flex-col justify-between text-white">
          {/* 顶部图标 */}
          <div className="flex justify-center items-start mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon className="w-9 h-9 text-white" />
            </div>
          </div>
          
          {/* 主要内容 */}
          <div className="flex-1 flex flex-col justify-center text-center">
            {/* 标题 */}
            <h3 className="text-2xl font-bold mb-8 leading-tight group-hover:scale-105 transition-transform duration-200">
              {card.title}
            </h3>

            {/* 关键信息 */}
            <div className="space-y-4">
              {keyInfo.slice(0, 4).map((info, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center space-x-3 opacity-90"
                >
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                  <span className="text-base font-medium leading-relaxed">
                    {info}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 底部装饰 */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-white/60 rounded-full" />
              <div className="w-2 h-2 bg-white/80 rounded-full" />
              <div className="w-1 h-1 bg-white/60 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* 悬停效果 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        
        {/* 光泽效果 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  )
}

export default PureGradientCard
