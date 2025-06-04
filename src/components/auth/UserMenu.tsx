'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, BookOpen, Heart, LogOut, ChevronDown, Trophy, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  const navigateTo = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const menuItems = [
    {
      icon: User,
      label: '个人资料',
      onClick: () => navigateTo('/profile')
    },
    {
      icon: BookOpen,
      label: '我的收藏',
      onClick: () => navigateTo('/bookmarks')
    },
    {
      icon: Trophy,
      label: '成就系统',
      onClick: () => navigateTo('/achievements')
    },
    {
      icon: BarChart3,
      label: '数据分析',
      onClick: () => navigateTo('/analytics')
    },
    {
      icon: Heart,
      label: '我的点赞',
      onClick: () => {
        // TODO: 导航到点赞页面
        setIsOpen(false)
      }
    },
    {
      icon: Settings,
      label: '设置',
      onClick: () => navigateTo('/settings')
    }
  ]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center space-x-2 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* 用户头像 */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
        </div>
        
        {/* 用户名 */}
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
        
        {/* 下拉箭头 */}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* 菜单内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20"
            >
              {/* 用户信息头部 */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || '用户'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* 菜单项 */}
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* 分割线 */}
              <div className="border-t border-gray-100 my-2" />

              {/* 登出按钮 */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
