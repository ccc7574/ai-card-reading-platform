'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid, List } from 'lucide-react'
import { AICard } from './AICard'
import { Button } from '@/components/ui/button'
import { Card as CardType } from '@/types'

interface CardGridProps {
  cards: CardType[]
  onCardClick?: (card: CardType) => void
  className?: string
}

export function CardGrid({ cards, onCardClick, className }: CardGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // 过滤逻辑
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || card.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const categories = [
    { value: 'all', label: '全部', icon: '📚' },
    { value: 'article', label: '文章', icon: '📄' },
    { value: 'kol-opinion', label: 'KOL观点', icon: '💭' },
    { value: 'insight', label: '洞察', icon: '💡' }
  ]

  const difficulties = [
    { value: 'all', label: '全部难度' },
    { value: 'beginner', label: '入门' },
    { value: 'intermediate', label: '进阶' },
    { value: 'advanced', label: '高级' }
  ]

  return (
    <div className={className}>
      {/* 搜索和过滤栏 */}
      <div className="mb-8 space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索卡片内容、标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 过滤器和视图切换 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* 分类过滤 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-1">
                {categories.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className="text-xs"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 难度过滤 */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          {/* 视图切换 */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 结果统计 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          找到 <span className="font-semibold text-blue-600">{filteredCards.length}</span> 张卡片
        </p>
      </div>

      {/* 卡片网格 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${searchTerm}-${selectedCategory}-${selectedDifficulty}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <AICard
                card={card}
                onClick={() => onCardClick?.(card)}
                className={viewMode === 'list' ? "max-w-none" : ""}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* 空状态 */}
      {filteredCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">没有找到匹配的卡片</h3>
          <p className="text-gray-600">尝试调整搜索条件或过滤器</p>
        </motion.div>
      )}
    </div>
  )
}
