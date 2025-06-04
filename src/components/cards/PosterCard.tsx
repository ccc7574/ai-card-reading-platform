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
  Zap,
  Star,
  Wand2
} from 'lucide-react'
import { Card } from '@/types'
import { ShareButton } from '@/components/social/ShareButton'

interface PosterCardProps {
  card: Card
  onClick?: () => void
  onComment?: () => void
  onLike?: () => void
  onShare?: () => void
  onBookmark?: () => void
  className?: string
}

function PosterCard({
  card,
  onClick,
  onComment,
  onLike,
  onShare,
  onBookmark,
  className = ''
}: PosterCardProps) {
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

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'tech': return 'from-blue-600 via-cyan-500 to-teal-400'
      case 'ai': return 'from-purple-600 via-pink-500 to-rose-400'
      case 'business': return 'from-green-600 via-emerald-500 to-teal-400'
      case 'design': return 'from-orange-600 via-red-500 to-pink-400'
      case 'science': return 'from-indigo-600 via-blue-500 to-cyan-400'
      default: return 'from-gray-600 via-slate-500 to-gray-400'
    }
  }

  const getArtisticPattern = (category: string) => {
    const patterns = {
      tech: (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
          <defs>
            <pattern id="techPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.3"/>
              <path d="M10 20 L30 20 M20 10 L20 30" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#techPattern)"/>
          <circle cx="100" cy="80" r="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
          <circle cx="300" cy="200" r="40" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
        </svg>
      ),
      ai: (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
          <defs>
            <pattern id="aiPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,10 50,30 30,50 10,30" fill="currentColor" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#aiPattern)"/>
          <path d="M50 150 Q200 50 350 150 Q200 250 50 150" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
        </svg>
      ),
      business: (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
          <defs>
            <pattern id="bizPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect x="20" y="20" width="10" height="10" fill="currentColor" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bizPattern)"/>
          <rect x="80" y="100" width="20" height="100" fill="currentColor" opacity="0.2"/>
          <rect x="120" y="80" width="20" height="120" fill="currentColor" opacity="0.3"/>
          <rect x="160" y="60" width="20" height="140" fill="currentColor" opacity="0.4"/>
        </svg>
      ),
      design: (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
          <defs>
            <pattern id="designPattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#designPattern)"/>
          <path d="M100 100 Q200 50 300 100 Q200 150 100 100" fill="currentColor" opacity="0.2"/>
        </svg>
      ),
      science: (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
          <defs>
            <pattern id="sciPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sciPattern)"/>
          <circle cx="150" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
          <circle cx="250" cy="180" r="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
          <line x1="150" y1="100" x2="250" y2="180" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
        </svg>
      )
    }
    return patterns[category as keyof typeof patterns] || patterns.tech
  }

  const isAIGenerated = card.metadata?.framework && card.metadata.framework !== 'data-source'

  return (
    <motion.div
      className={`group relative overflow-hidden cursor-pointer transition-all duration-500 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* 名片风格卡片容器 */}
      <div className="relative h-80 rounded-xl overflow-hidden shadow-2xl">
        {/* 深色背景 - 严格参考名片设计 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
          {/* 名片风格的白色装饰条 */}
          <div className="absolute top-0 right-0 w-6 h-full bg-white"></div>
          <div className="absolute bottom-0 left-0 w-24 h-6 bg-white"></div>

          {/* 微妙的纹理 */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          </div>
        </div>

        {/* 名片风格内容布局 */}
        <div className="relative h-full p-8 text-white">
          {/* 左上角：主要信息区域 */}
          <div className="space-y-4">
            {/* 主标题 - 参考名片的"Your Name"位置 */}
            <motion.h1
              className="text-4xl font-bold leading-tight"
              style={{
                fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
                fontWeight: '700'
              }}
              animate={{ scale: isHovered ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {card.title}
            </motion.h1>

            {/* 副标题/分类 - 参考名片的"Your Designation"位置 */}
            <div className="text-lg text-white/80 font-medium">
              {card.category.toUpperCase()} • {card.readingTime}分钟阅读
            </div>

            {/* 内容信息列表 - 参考名片的联系信息布局 */}
            <div className="space-y-3 mt-8">
              {/* 作者信息 */}
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-base font-medium">{card.author || 'AI Assistant'}</span>
              </div>

              {/* 发布时间 */}
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5" />
                <span className="text-base font-medium">{new Date(card.publishedAt).toLocaleDateString('zh-CN')}</span>
              </div>

              {/* 摘要信息 */}
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                  <div className="w-3 h-3 bg-white/60 rounded-sm"></div>
                </div>
                <span className="text-base font-medium leading-relaxed line-clamp-3">
                  {card.summary}
                </span>
              </div>

              {/* 标签信息 */}
              {card.tags.length > 0 && (
                <div className="flex items-center space-x-3">
                  <Tag className="w-5 h-5" />
                  <span className="text-base font-medium">
                    {card.tags.slice(0, 2).join(' • ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 右下角：品牌标识区域 - 参考名片的"COMPANY"部分 */}
          <div className="absolute bottom-8 right-8">
            <div className="text-right space-y-2">
              {/* AI标识 */}
              {isAIGenerated && (
                <motion.div
                  className="flex items-center justify-end space-x-2 mb-3"
                  animate={{ opacity: isHovered ? 1 : 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Wand2 className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-wider">AI POWERED</span>
                </motion.div>
              )}

              {/* 品牌标识 */}
              <div className="text-right">
                <div className="text-2xl font-black tracking-wider">
                  CARD READING
                </div>
                <div className="text-sm text-white/70 font-medium tracking-wide">
                  INTELLIGENT INSIGHTS
                </div>
              </div>

              {/* 装饰性QR码风格元素 */}
              <div className="flex justify-end mt-4">
                <div className="grid grid-cols-4 gap-1">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 ${
                        i % 3 === 0 ? 'bg-white' : 'bg-white/40'
                      } ${i % 2 === 0 ? 'rounded-full' : 'rounded-sm'}`}
                      animate={{
                        opacity: isHovered ? [0.4, 1, 0.4] : 0.6,
                        scale: isHovered ? [1, 1.2, 1] : 1
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: isHovered ? Infinity : 0
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 悬浮效果 */}
        <motion.div
          className="absolute inset-0 bg-white/5 opacity-0 pointer-events-none rounded-xl"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* 交互按钮区域 - 悬浮时显示 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 right-4 flex space-x-2 z-10"
            >
              {/* 点赞按钮 */}
              <motion.button
                onClick={handleLike}
                className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                  isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>

              {/* 收藏按钮 */}
              <motion.button
                onClick={handleBookmark}
                className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                  isBookmarked
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>

              {/* 分享按钮 */}
              <div onClick={(e) => e.stopPropagation()}>
                <ShareButton
                  title={card.title}
                  summary={card.summary}
                  author={card.author}
                  tags={card.tags}
                  variant="minimal"
                  className="p-2 rounded-full backdrop-blur-sm bg-white/20 text-white hover:bg-white/30"
                />
              </div>

              {/* 评论按钮 */}
              <motion.button
                onClick={handleComment}
                className="p-2 rounded-full backdrop-blur-sm bg-white/20 text-white hover:bg-white/30 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部统计信息 - 始终显示 */}
        <div className="absolute bottom-4 left-8 flex items-center space-x-4 text-white/80">
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">{likeCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{commentCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PosterCard
