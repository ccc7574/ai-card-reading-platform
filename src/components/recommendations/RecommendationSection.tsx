'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Heart, Sparkles, RefreshCw, ChevronRight } from 'lucide-react'
import { Card as CardType } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import PosterCard from '@/components/cards/PosterCard'

interface RecommendationSectionProps {
  onCardClick: (card: CardType) => void
  onCommentClick: (cardId: string) => void
}

export function RecommendationSection({ onCardClick, onCommentClick }: RecommendationSectionProps) {
  const { user } = useAuth()
  const [personalizedCards, setPersonalizedCards] = useState<CardType[]>([])
  const [trendingCards, setTrendingCards] = useState<CardType[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending'>('personalized')

  useEffect(() => {
    loadRecommendations()
  }, [user])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      // 加载个性化推荐
      if (user) {
        const personalizedResponse = await fetch(`/api/recommendations?type=personalized&userId=${user.id}&limit=6`)
        if (personalizedResponse.ok) {
          const data = await personalizedResponse.json()
          setPersonalizedCards(data.recommendations)
        }
      }

      // 加载热门推荐
      const trendingResponse = await fetch('/api/recommendations?type=trending&limit=6')
      if (trendingResponse.ok) {
        const data = await trendingResponse.json()
        setTrendingCards(data.recommendations)
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadRecommendations()
  }

  const recordInteraction = async (cardId: string, type: 'like' | 'bookmark' | 'view' | 'share') => {
    if (!user) return

    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          cardId,
          interactionType: type
        })
      })
    } catch (error) {
      console.error('Failed to record interaction:', error)
    }
  }

  const handleCardClick = (card: CardType) => {
    recordInteraction(card.id, 'view')
    onCardClick(card)
  }

  const currentCards = activeTab === 'personalized' ? personalizedCards : trendingCards

  if (!user && activeTab === 'personalized') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">个性化推荐</h3>
        <p className="text-gray-600 mb-4">登录后获取专属推荐内容</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 推荐标题和控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">智能推荐</h2>
          
          {/* 标签切换 */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {user && (
              <button
                onClick={() => setActiveTab('personalized')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'personalized'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Heart className="w-4 h-4 mr-2 inline" />
                为你推荐
              </button>
            )}
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'trending'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              热门趋势
            </button>
          </div>
        </div>

        {/* 刷新按钮 */}
        <motion.button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </motion.button>
      </div>

      {/* 推荐说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {activeTab === 'personalized' 
                ? '基于你的阅读偏好和互动历史智能推荐' 
                : '发现当前最受欢迎的热门内容'
              }
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {activeTab === 'personalized' 
                ? '点赞、收藏和分享可以帮助我们更好地了解你的喜好' 
                : '根据用户互动和发布时间综合排序'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 推荐卡片 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : currentCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PosterCard
                card={card}
                onClick={() => handleCardClick(card)}
                onLike={() => recordInteraction(card.id, 'like')}
                onBookmark={() => recordInteraction(card.id, 'bookmark')}
                onComment={() => onCommentClick(card.id)}
                onShare={() => recordInteraction(card.id, 'share')}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无推荐内容</h3>
          <p className="text-gray-600">
            {activeTab === 'personalized' 
              ? '多与内容互动，我们将为你提供更精准的推荐' 
              : '暂时没有热门内容，请稍后再试'
            }
          </p>
        </div>
      )}

      {/* 查看更多 */}
      {currentCards.length > 0 && (
        <div className="text-center">
          <button className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium">
            <span>查看更多推荐</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
