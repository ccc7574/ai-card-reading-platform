'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  User, 
  Tag, 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Share2, 
  Bookmark,
  Sparkles,
  ArrowRight,
  Coffee,
  Leaf,
  Sun
} from 'lucide-react'
import { Card } from '@/types'

interface RelaxedCardProps {
  card: Card
  onClick?: () => void
  onComment?: () => void
  onLike?: () => void
  onShare?: () => void
  onBookmark?: () => void
  className?: string
}

export default function RelaxedCard({
  card,
  onClick,
  onComment,
  onLike,
  onShare,
  onBookmark,
  className = ''
}: RelaxedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10)
  const [commentCount] = useState(Math.floor(Math.random() * 20) + 3)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    onLike?.()
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
    onBookmark?.()
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.()
  }

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    onComment?.()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tech': return '🚀'
      case 'ai': return '🤖'
      case 'business': return '💼'
      case 'design': return '🎨'
      case 'science': return '🔬'
      default: return '📖'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tech': return 'from-blue-400 to-cyan-400'
      case 'ai': return 'from-purple-400 to-pink-400'
      case 'business': return 'from-green-400 to-emerald-400'
      case 'design': return 'from-orange-400 to-red-400'
      case 'science': return 'from-indigo-400 to-blue-400'
      default: return 'from-gray-400 to-slate-400'
    }
  }

  const getIllustrationSvg = (category: string) => {
    const illustrations = {
      tech: (
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#techGrad)" opacity="0.1" rx="8"/>
          <circle cx="50" cy="40" r="15" fill="#60A5FA" opacity="0.6"/>
          <circle cx="150" cy="80" r="20" fill="#34D399" opacity="0.6"/>
          <path d="M30 60 Q100 30 170 60" stroke="#60A5FA" strokeWidth="3" fill="none" opacity="0.7"/>
          <rect x="80" y="45" width="40" height="30" fill="#F3F4F6" rx="4"/>
          <text x="100" y="65" textAnchor="middle" className="text-xs fill-gray-600">CODE</text>
        </svg>
      ),
      ai: (
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#aiGrad)" opacity="0.1" rx="8"/>
          <circle cx="100" cy="60" r="25" fill="#A855F7" opacity="0.3"/>
          <circle cx="85" cy="50" r="3" fill="#A855F7"/>
          <circle cx="115" cy="50" r="3" fill="#A855F7"/>
          <path d="M90 70 Q100 75 110 70" stroke="#A855F7" strokeWidth="2" fill="none"/>
          <path d="M60 40 Q80 20 100 40" stroke="#EC4899" strokeWidth="2" fill="none" opacity="0.6"/>
          <path d="M100 40 Q120 20 140 40" stroke="#EC4899" strokeWidth="2" fill="none" opacity="0.6"/>
        </svg>
      ),
      business: (
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="bizGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#bizGrad)" opacity="0.1" rx="8"/>
          <rect x="60" y="30" width="80" height="60" fill="#F3F4F6" rx="4"/>
          <rect x="70" y="40" width="15" height="40" fill="#10B981" opacity="0.7"/>
          <rect x="90" y="50" width="15" height="30" fill="#10B981" opacity="0.8"/>
          <rect x="110" y="35" width="15" height="45" fill="#10B981"/>
          <rect x="130" y="45" width="15" height="35" fill="#10B981" opacity="0.6"/>
        </svg>
      ),
      design: (
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="designGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#designGrad)" opacity="0.1" rx="8"/>
          <circle cx="70" cy="45" r="20" fill="#F97316" opacity="0.6"/>
          <circle cx="130" cy="75" r="15" fill="#EF4444" opacity="0.7"/>
          <path d="M50 80 Q100 50 150 80" stroke="#F97316" strokeWidth="3" fill="none" opacity="0.8"/>
          <rect x="90" y="30" width="20" height="20" fill="#FEF3C7" rx="2"/>
        </svg>
      ),
      science: (
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="sciGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#sciGrad)" opacity="0.1" rx="8"/>
          <circle cx="80" cy="50" r="12" fill="#6366F1" opacity="0.6"/>
          <circle cx="120" cy="70" r="8" fill="#3B82F6" opacity="0.7"/>
          <circle cx="100" cy="35" r="6" fill="#8B5CF6" opacity="0.8"/>
          <path d="M80 50 L100 35 L120 70" stroke="#6366F1" strokeWidth="2" opacity="0.5"/>
          <circle cx="100" cy="60" r="3" fill="#F59E0B"/>
        </svg>
      )
    }
    return illustrations[category as keyof typeof illustrations] || illustrations.tech
  }

  return (
    <motion.div
      className={`group relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/30 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* 主要内容区域 */}
      <div className="flex h-48">
        {/* 左侧内容区域 */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          {/* 顶部信息 */}
          <div>
            {/* 分类和趋势标识 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  <span className="mr-2">{getCategoryIcon(card.category)}</span>
                  {card.category}
                </span>
                
                {card.metadata?.trending && (
                  <motion.div
                    className="flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 text-xs font-medium"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    热门
                  </motion.div>
                )}
              </div>

              {/* AI生成标识 */}
              {card.metadata?.framework && (
                <div className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-medium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI生成
                </div>
              )}
            </div>

            {/* 标题 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
              {card.title}
            </h2>

            {/* 摘要 */}
            <p className="text-gray-600 text-base leading-relaxed line-clamp-3 mb-4">
              {card.summary}
            </p>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between">
            {/* 作者和时间 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium mr-3">
                  {card.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{card.author}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {card.readingTime}分钟阅读
                  </div>
                </div>
              </div>
            </div>

            {/* 交互按钮 */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </motion.button>

              <motion.button
                onClick={handleComment}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-blue-500 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{commentCount}</span>
              </motion.button>

              <motion.button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked 
                    ? 'text-yellow-500 bg-yellow-50' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* 右侧插图区域 */}
        <div className="w-48 relative overflow-hidden">
          {/* 背景渐变 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(card.category)} opacity-20`} />
          
          {/* 漫画风格插图 */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {getIllustrationSvg(card.category)}
          </div>

          {/* 装饰元素 */}
          <motion.div
            className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm"
            animate={{ 
              scale: isHovered ? [1, 1.2, 1] : 1,
              rotate: isHovered ? [0, 180, 360] : 0
            }}
            transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/50 to-transparent" />
          </motion.div>

          {/* 阅读指示 */}
          <motion.div
            className="absolute bottom-4 right-4 flex items-center text-white/80 text-sm font-medium"
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="mr-2">深度阅读</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* 标签区域 */}
      {card.tags.length > 0 && (
        <div className="px-8 pb-6">
          <div className="flex flex-wrap gap-2">
            {card.tags.slice(0, 4).map((tag, index) => (
              <motion.span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </motion.span>
            ))}
            {card.tags.length > 4 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs">
                +{card.tags.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 悬停效果 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* 质量指示器 */}
      {card.metadata?.qualityScore && (
        <div className="absolute top-4 left-4">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse" />
        </div>
      )}
    </motion.div>
  )
}
