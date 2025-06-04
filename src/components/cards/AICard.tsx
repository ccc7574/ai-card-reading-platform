'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, User, Tag, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Card as CardType } from '@/types'
import { cn, formatDate, truncateText } from '@/lib/utils'

interface AICardProps {
  card: CardType
  onClick?: () => void
  className?: string
  showFullContent?: boolean
}

export function AICard({ card, onClick, className, showFullContent = false }: AICardProps) {
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
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("cursor-pointer", className)}
      onClick={onClick}
    >
      <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* 简笔画区域 */}
        {card.imageUrl && (
          <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <img 
              src={card.imageUrl} 
              alt={card.title}
              className="max-h-24 max-w-24 object-contain"
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          {/* 分类和难度标签 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">{categoryIcons[card.category]}</span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              difficultyColors[card.difficulty]
            )}>
              {card.difficulty}
            </span>
          </div>
          
          {/* 金句/摘要 */}
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
            {showFullContent ? card.summary : truncateText(card.summary, 80)}
          </h3>
          
          {/* 标题 */}
          <p className="text-sm text-gray-600 font-medium">
            {truncateText(card.title, 60)}
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 内容预览 */}
          {showFullContent ? (
            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              {card.content}
            </div>
          ) : (
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
              {truncateText(card.content, 120)}
            </p>
          )}
          
          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mb-4">
            {card.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{card.tags.length - 3}</span>
            )}
          </div>
          
          {/* 元信息 */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-3">
              {card.author && (
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {card.author}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {card.readingTime}分钟
              </div>
            </div>
            <span>{formatDate(card.createdAt)}</span>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 p-0 h-auto"
              onClick={(e) => {
                e.stopPropagation()
                window.open(card.sourceUrl, '_blank')
              }}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              查看原文
            </Button>
            
            {!showFullContent && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick?.()
                }}
              >
                深度解读
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
