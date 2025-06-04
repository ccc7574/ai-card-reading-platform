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
  Eye,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Card } from '@/types'

interface PremiumCardProps {
  card: Card
  onClick?: () => void
  onComment?: () => void
  onLike?: () => void
  onShare?: () => void
  onBookmark?: () => void
  className?: string
}

export default function PremiumCard({
  card,
  onClick,
  onComment,
  onLike,
  onShare,
  onBookmark,
  className = ''
}: PremiumCardProps) {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tech': return '💻'
      case 'ai': return '🤖'
      case 'business': return '💼'
      case 'design': return '🎨'
      case 'science': return '🔬'
      default: return '📄'
    }
  }

  return (
    <motion.div
      className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 顶部图片区域 */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={card.imageUrl || '/api/placeholder/400/200'}
          alt={card.title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* 分类标签 */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-800">
            <span className="mr-1">{getCategoryIcon(card.category)}</span>
            {card.category}
          </span>
        </div>

        {/* 趋势标识 */}
        {card.metadata?.trending && (
          <div className="absolute top-4 right-4">
            <motion.div
              className="flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              热门
            </motion.div>
          </div>
        )}

        {/* 阅读时间 */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {card.readingTime}分钟阅读
          </div>
        </div>

        {/* 难度标识 */}
        <div className="absolute bottom-4 right-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(card.difficulty)}`}>
            {card.difficulty}
          </span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {/* 标题 */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {card.title}
        </h3>

        {/* 摘要 */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {card.summary}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {card.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-xs">
              +{card.tags.length - 3}
            </span>
          )}
        </div>

        {/* 作者和时间 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium mr-3">
              {card.author?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{card.author}</p>
              <p className="text-xs text-gray-500">
                {new Date(card.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>

          {/* AI生成标识 */}
          {card.metadata?.framework && (
            <div className="flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-medium">
              <Sparkles className="w-3 h-3 mr-1" />
              AI生成
            </div>
          )}
        </div>

        {/* 交互按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* 点赞 */}
            <motion.button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </motion.button>

            {/* 评论 */}
            <motion.button
              onClick={handleComment}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount}</span>
            </motion.button>

            {/* 分享 */}
            <motion.button
              onClick={handleShare}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex items-center space-x-2">
            {/* 收藏 */}
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

            {/* 查看详情 */}
            <motion.div
              className="flex items-center text-sm text-blue-600 font-medium cursor-pointer"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClick}
            >
              <span className="mr-1">深度解析</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>

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
        <div className="absolute top-2 left-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse" />
        </div>
      )}
    </motion.div>
  )
}
