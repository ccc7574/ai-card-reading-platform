'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PureGradientCard from './PureGradientCard'
import { ChevronDown, Filter, Grid3X3, Grid2X2, LayoutGrid } from 'lucide-react'

interface PureGradientGridProps {
  cards: any[]
  onCardClick?: (card: any) => void
  onLoadMore?: () => void
  className?: string
  title?: string
  showControls?: boolean
}

export function PureGradientGrid({
  cards,
  onCardClick,
  onLoadMore,
  className = '',
  title = '',
  showControls = true
}: PureGradientGridProps) {
  const [displayCount, setDisplayCount] = useState(16)
  const [gridCols, setGridCols] = useState(4)
  const [sortBy, setSortBy] = useState('default')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isClient, setIsClient] = useState(false)

  // 客户端检测
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 响应式网格列数 - 只在客户端执行
  useEffect(() => {
    if (!isClient) return

    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setGridCols(1)
      } else if (width < 1024) {
        setGridCols(2)
      } else if (width < 1536) {
        setGridCols(3)
      } else {
        setGridCols(4)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient])

  // 过滤和排序卡片
  const processedCards = React.useMemo(() => {
    let filtered = cards

    // 分类过滤
    if (filterCategory !== 'all') {
      filtered = filtered.filter(card => 
        card.category === filterCategory || 
        card.tags?.includes(filterCategory)
      )
    }

    // 排序
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
        filtered.sort((a, b) => 
          (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
          (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0)
        )
        break
      case 'readingTime':
        filtered.sort((a, b) => (a.readingTime || 0) - (b.readingTime || 0))
        break
      default:
        // 保持原始顺序
        break
    }

    return filtered
  }, [cards, filterCategory, sortBy])

  // 显示的卡片
  const displayedCards = processedCards.slice(0, displayCount)

  // 获取所有分类
  const categories = React.useMemo(() => {
    const cats = new Set(['all'])
    cards.forEach(card => {
      if (card.category) cats.add(card.category)
      if (card.tags) {
        card.tags.forEach((tag: string) => cats.add(tag))
      }
    })
    return Array.from(cats)
  }, [cards])

  const handleLoadMore = () => {
    const newCount = displayCount + 12
    setDisplayCount(newCount)
    if (onLoadMore && newCount >= processedCards.length) {
      onLoadMore()
    }
  }

  const getGridClassName = () => {
    const baseClass = "grid gap-8"
    // 在服务端渲染时使用默认的响应式类名
    if (!isClient) {
      return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
    }

    switch (gridCols) {
      case 1:
        return `${baseClass} grid-cols-1`
      case 2:
        return `${baseClass} grid-cols-1 sm:grid-cols-2`
      case 3:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
      case 4:
      default:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 标题和控制栏 */}
      {(title || (showControls && isClient)) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          )}

          {showControls && isClient && (
            <div className="flex items-center space-x-4">
              {/* 网格布局切换 */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded transition-colors ${
                    gridCols === 2 ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded transition-colors ${
                    gridCols === 3 ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded transition-colors ${
                    gridCols === 4 ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* 分类过滤 */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? '全部分类' : cat}
                  </option>
                ))}
              </select>

              {/* 排序 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="default">默认排序</option>
                <option value="title">按标题</option>
                <option value="difficulty">按难度</option>
                <option value="readingTime">按时长</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* 卡片网格 */}
      <div className={getGridClassName()}>
        <AnimatePresence>
          {displayedCards.map((card, index) => (
            <PureGradientCard
              key={card.id}
              card={card}
              index={index}
              onClick={() => onCardClick?.(card)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 加载更多按钮 */}
      {displayedCards.length < processedCards.length && (
        <div className="flex justify-center">
          <motion.button
            onClick={handleLoadMore}
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-medium">加载更多</span>
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* 统计信息 */}
      <div className="text-center text-gray-500 text-sm">
        显示 {displayedCards.length} / {processedCards.length} 个卡片
        {processedCards.length !== cards.length && (
          <span> (已过滤 {cards.length - processedCards.length} 个)</span>
        )}
      </div>

      {/* 空状态 */}
      {displayedCards.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到卡片</h3>
          <p className="text-gray-500">尝试调整筛选条件或搜索其他内容</p>
        </div>
      )}
    </div>
  )
}

export default PureGradientGrid
