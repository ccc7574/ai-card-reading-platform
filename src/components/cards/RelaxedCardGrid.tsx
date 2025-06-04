'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/types'
import PosterCard from './PosterCard'
import { Loader2, Coffee, Sparkles, Leaf } from 'lucide-react'

interface RelaxedCardGridProps {
  cards: Card[]
  onCardClick?: (card: Card) => void
  onCommentClick?: (cardId: string) => void
  onLoadMore?: () => Promise<Card[]>
  className?: string
}

export default function RelaxedCardGrid({
  cards,
  onCardClick,
  onCommentClick,
  onLoadMore,
  className = ''
}: RelaxedCardGridProps) {
  const [displayedCards, setDisplayedCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const CARDS_PER_PAGE = 3 // 一屏显示3张卡片

  // 初始化显示卡片
  useEffect(() => {
    if (cards.length > 0) {
      const initialCards = cards.slice(0, CARDS_PER_PAGE)
      setDisplayedCards(initialCards)
      setPage(1)
      setHasMore(cards.length > CARDS_PER_PAGE)
    }
  }, [cards])

  // 加载更多卡片
  const loadMoreCards = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      // 模拟加载延迟，提供更好的用户体验
      await new Promise(resolve => setTimeout(resolve, 800))

      const startIndex = page * CARDS_PER_PAGE
      const endIndex = startIndex + CARDS_PER_PAGE
      const newCards = cards.slice(startIndex, endIndex)

      if (newCards.length > 0) {
        setDisplayedCards(prev => [...prev, ...newCards])
        setPage(prev => prev + 1)
        setHasMore(endIndex < cards.length)
      } else {
        // 如果本地卡片用完了，尝试从API加载更多
        if (onLoadMore) {
          const moreCards = await onLoadMore()
          if (moreCards.length > 0) {
            setDisplayedCards(prev => [...prev, ...moreCards.slice(0, CARDS_PER_PAGE)])
            setPage(prev => prev + 1)
          } else {
            setHasMore(false)
          }
        } else {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('加载更多卡片失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [cards, page, isLoading, hasMore, onLoadMore])

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 当滚动到距离底部300px时开始加载
      if (scrollTop + windowHeight >= documentHeight - 300 && hasMore && !isLoading) {
        console.log('🔄 触发滚动加载')
        loadMoreCards()
      }
    }

    const throttledHandleScroll = throttle(handleScroll, 200)
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [loadMoreCards, hasMore, isLoading])

  // 节流函数
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  const handleCardClick = (card: Card) => {
    onCardClick?.(card)
  }

  const handleCommentClick = (cardId: string) => {
    onCommentClick?.(cardId)
  }

  if (displayedCards.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Coffee className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">暂时没有内容</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            放松一下，新的精彩内容正在路上。
            <br />
            或者尝试生成一些有趣的AI卡片吧！
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 卡片列表 */}
      <AnimatePresence mode="popLayout">
        {displayedCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            layout
          >
            <PosterCard
              card={card}
              onClick={() => handleCardClick(card)}
              onComment={() => handleCommentClick(card.id)}
              className="w-full max-w-4xl mx-auto"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 加载状态 */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative">
              <motion.div
                className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <motion.p
              className="text-gray-600 mt-4 text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              正在为您精心准备新内容...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 结束提示 */}
      <AnimatePresence>
        {!hasMore && !isLoading && displayedCards.length > 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mr-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Leaf className="w-8 h-8 text-green-500" />
              </motion.div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  今日阅读完成
                </h3>
                <p className="text-gray-600">
                  您已经浏览了所有精选内容
                </p>
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                适度的信息摄入有助于保持思维清晰。
                <br />
                不如休息一下，让大脑消化今天的收获吧！
              </p>
              
              <motion.div
                className="flex items-center justify-center space-x-2 text-blue-500"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">明天会有更多精彩内容</span>
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 滚动提示 */}
      {hasMore && !isLoading && displayedCards.length > 0 && (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="inline-flex items-center text-gray-400 text-sm"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>继续向下滚动查看更多</span>
            <motion.div
              className="ml-2 w-1 h-4 bg-gray-400 rounded-full"
              animate={{ scaleY: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
