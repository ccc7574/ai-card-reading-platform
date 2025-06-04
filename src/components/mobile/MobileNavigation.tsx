'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, Plus, User, Menu, X, Bookmark, Heart, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface MobileNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onSearchClick: () => void
  onGenerateClick: () => void
  onAuthClick: () => void
}

export function MobileNavigation({
  activeTab,
  onTabChange,
  onSearchClick,
  onGenerateClick,
  onAuthClick
}: MobileNavigationProps) {
  const { user } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { id: 'latest', icon: Home, label: '首页' },
    { id: 'search', icon: Search, label: '搜索', onClick: onSearchClick },
    { id: 'generate', icon: Plus, label: '生成', onClick: onGenerateClick },
    { id: 'profile', icon: User, label: user ? '我的' : '登录', onClick: user ? () => setIsMenuOpen(true) : onAuthClick }
  ]

  const menuItems = [
    { icon: Bookmark, label: '我的收藏', onClick: () => {} },
    { icon: Heart, label: '我的点赞', onClick: () => {} },
    { icon: Settings, label: '设置', onClick: () => {} }
  ]

  return (
    <>
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick()
                } else {
                  onTabChange(item.id)
                }
              }}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 用户菜单 */}
      <AnimatePresence>
        {isMenuOpen && user && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl"
            >
              {/* 拖拽指示器 */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* 用户信息 */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.user_metadata?.full_name || '用户'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* 菜单项 */}
              <div className="py-4">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.onClick()
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* 关闭按钮 */}
              <div className="px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>关闭</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

// 移动端头部组件
export function MobileHeader({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 z-30 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  )
}

// 移动端卡片网格组件
export function MobileCardGrid({ 
  cards, 
  onCardClick, 
  onCommentClick 
}: { 
  cards: any[]
  onCardClick: (card: any) => void
  onCommentClick: (cardId: string) => void
}) {
  return (
    <div className="md:hidden px-4 pb-20">
      <div className="space-y-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            onClick={() => onCardClick(card)}
          >
            {/* 卡片图片 */}
            {card.imageUrl && (
              <div className="aspect-video bg-gray-100">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 卡片内容 */}
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  {card.category}
                </span>
                <span className="text-xs text-gray-500">
                  {card.readingTime}分钟阅读
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                {card.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {card.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {card.author}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {new Date(card.publishedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCommentClick(card.id)
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Heart className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
