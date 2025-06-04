'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Clock,
  User,
  Calendar,
  BookOpen,
  Lightbulb,
  Target,
  Link2,
  Quote,
  Highlighter,
  MessageSquare,
  Star,
  TrendingUp,
  ArrowLeft,
  Share2,
  Bookmark,
  Eye
} from 'lucide-react'
import { Card } from '@/types'
import { DeepContent } from '@/lib/content-expansion/deep-content-generator'

interface DeepContentViewProps {
  card: Card
  isOpen: boolean
  onClose: () => void
}

export default function DeepContentView({ card, isOpen, onClose }: DeepContentViewProps) {
  const [deepContent, setDeepContent] = useState<DeepContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('content')
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    if (isOpen && !deepContent) {
      generateDeepContent()
    }
  }, [isOpen])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrolled / maxHeight) * 100
      setReadingProgress(Math.min(progress, 100))
    }

    if (isOpen) {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen])

  const generateDeepContent = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/deep-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, card })
      })

      if (response.ok) {
        const result = await response.json()
        setDeepContent(result.data)
      }
    } catch (error) {
      console.error('生成深度内容失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        {/* 阅读进度条 */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-60">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${readingProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* 主内容容器 */}
        <motion.div
          className="relative w-full h-full overflow-y-auto bg-white"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* 顶部导航 */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {deepContent?.title || card.title}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {deepContent?.subtitle || '深度解析'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Bookmark className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <motion.div
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-gray-600">正在生成深度内容...</p>
                <p className="text-sm text-gray-500 mt-2">AI正在进行深度分析和扩展</p>
              </div>
            </div>
          )}

          {/* 主要内容 */}
          {deepContent && (
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* 文章头部 */}
              <div className="mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={card.imageUrl || '/api/placeholder/400/200'}
                    alt={card.title}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {deepContent.title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                      {deepContent.subtitle}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {card.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(deepContent.generatedAt).toLocaleDateString('zh-CN')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {deepContent.readingTime}分钟阅读
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {deepContent.wordCount}字
                      </div>
                    </div>
                  </div>
                </div>

                {/* 质量指标 */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-1" />
                      <span className="font-medium">质量评分</span>
                      <span className="ml-2 text-lg font-bold text-blue-600">
                        {(deepContent.quality * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
                      <span className="font-medium">深度分析</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    由AI智能生成 • 专业级内容
                  </div>
                </div>
              </div>

              {/* 导航标签 */}
              <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'content', label: '深度内容', icon: BookOpen },
                  { id: 'notes', label: '阅读笔记', icon: Highlighter },
                  { id: 'insights', label: '核心洞察', icon: Lightbulb },
                  { id: 'actions', label: '行动建议', icon: Target }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeSection === id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>

              {/* 内容区域 */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeSection === 'content' && (
                    <div className="prose prose-lg max-w-none">
                      {/* 检查是否为降级模式 */}
                      {deepContent.subtitle?.includes('降级模式') && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse" />
                            <span className="text-amber-800 font-medium text-sm">降级模式</span>
                          </div>
                          <p className="text-amber-700 text-sm">
                            由于网络问题，AI深度分析暂时不可用。以下展示原文核心内容和基础分析，功能体验保持完整。
                          </p>
                        </div>
                      )}

                      <div
                        className={`text-gray-800 leading-relaxed ${
                          deepContent.subtitle?.includes('降级模式')
                            ? 'fallback-content-styles'
                            : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: deepContent.content }}
                      />

                      {/* 降级模式的额外样式 */}
                      <style jsx>{`
                        .fallback-content-styles .content-notice {
                          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                          border: 1px solid #f59e0b;
                          border-radius: 12px;
                          padding: 16px;
                          margin-bottom: 24px;
                        }

                        .fallback-content-styles .notice-text {
                          color: #92400e;
                          font-weight: 500;
                          margin: 0;
                        }

                        .fallback-content-styles .core-content {
                          background: #f8fafc;
                          border: 1px solid #e2e8f0;
                          border-radius: 12px;
                          padding: 20px;
                          margin-bottom: 24px;
                        }

                        .fallback-content-styles .core-content h3 {
                          color: #1e293b;
                          font-size: 18px;
                          font-weight: 600;
                          margin-bottom: 12px;
                          display: flex;
                          align-items: center;
                        }

                        .fallback-content-styles .basic-analysis {
                          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                          border: 1px solid #3b82f6;
                          border-radius: 12px;
                          padding: 20px;
                          margin-bottom: 24px;
                        }

                        .fallback-content-styles .basic-analysis h3 {
                          color: #1e40af;
                          font-size: 18px;
                          font-weight: 600;
                          margin-bottom: 12px;
                        }

                        .fallback-content-styles .key-points {
                          background: #f0fdf4;
                          border: 1px solid #22c55e;
                          border-radius: 12px;
                          padding: 20px;
                        }

                        .fallback-content-styles .key-points h3 {
                          color: #15803d;
                          font-size: 18px;
                          font-weight: 600;
                          margin-bottom: 12px;
                        }

                        .fallback-content-styles .key-points ul {
                          list-style: none;
                          padding: 0;
                          margin: 0;
                        }

                        .fallback-content-styles .key-points li {
                          padding: 8px 0;
                          border-bottom: 1px solid #dcfce7;
                          color: #166534;
                          position: relative;
                          padding-left: 24px;
                        }

                        .fallback-content-styles .key-points li:before {
                          content: "✓";
                          position: absolute;
                          left: 0;
                          color: #22c55e;
                          font-weight: bold;
                        }

                        .fallback-content-styles .key-points li:last-child {
                          border-bottom: none;
                        }
                      `}</style>
                    </div>
                  )}

                  {activeSection === 'notes' && (
                    <div className="space-y-6">
                      {deepContent.readingNotes.map((note, index) => (
                        <motion.div
                          key={note.id}
                          className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50/50 rounded-r-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center mb-2">
                            <Quote className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-800 capitalize">
                              {note.type}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              note.importance === 'high' ? 'bg-red-100 text-red-800' :
                              note.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {note.importance}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{note.content}</p>
                          <div className="flex flex-wrap gap-2">
                            {note.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeSection === 'insights' && (
                    <div className="grid gap-6">
                      {deepContent.insights.map((insight, index) => (
                        <motion.div
                          key={insight.id}
                          className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{insight.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              insight.category === 'trend' ? 'bg-green-100 text-green-800' :
                              insight.category === 'opportunity' ? 'bg-blue-100 text-blue-800' :
                              insight.category === 'challenge' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {insight.category}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4">{insight.description}</p>
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-medium text-gray-600">置信度:</span>
                              <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: `${insight.confidence * 100}%` }}
                                />
                              </div>
                              <span className="ml-2 text-sm font-bold text-blue-600">
                                {(insight.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">影响分析:</h4>
                            <ul className="space-y-1">
                              {insight.implications.map((implication, impIndex) => (
                                <li key={impIndex} className="flex items-start">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                                  <span className="text-gray-700">{implication}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeSection === 'actions' && (
                    <div className="space-y-4">
                      {deepContent.actionItems.map((action, index) => (
                        <motion.div
                          key={action.id}
                          className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                            <div className="flex space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                action.priority === 'high' ? 'bg-red-100 text-red-800' :
                                action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {action.priority}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                action.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                                action.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {action.difficulty}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{action.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="capitalize">{action.timeframe.replace('_', ' ')}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* 延伸阅读 */}
              {deepContent.furtherReading.length > 0 && (
                <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Link2 className="w-5 h-5 mr-2" />
                    延伸阅读
                  </h3>
                  <div className="grid gap-4">
                    {deepContent.furtherReading.map((reading, index) => (
                      <div key={reading.id} className="flex items-center p-4 bg-white rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{reading.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{reading.description}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {reading.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          相关度: {(reading.relevance * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
