'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Check, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Sparkles
} from 'lucide-react'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'share' | 'bookmark' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  avatar?: string
  metadata?: any
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    
    // 模拟实时通知
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        addRandomNotification()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  const loadNotifications = () => {
    // 模拟加载通知数据
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'like',
        title: '新的点赞',
        message: '用户张三点赞了您的文章「AI技术趋势分析」',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        avatar: '👤'
      },
      {
        id: '2',
        type: 'comment',
        title: '新的评论',
        message: '用户李四评论了您的文章「产品设计最佳实践」',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        avatar: '👤'
      },
      {
        id: '3',
        type: 'system',
        title: '系统更新',
        message: '平台新增了AI多Agent协作功能，快来体验吧！',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      },
      {
        id: '4',
        type: 'bookmark',
        title: '内容收藏',
        message: '您收藏的文章「商业模式创新」有新的更新',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true
      }
    ]
    
    setNotifications(mockNotifications)
  }

  const addRandomNotification = () => {
    const types: Notification['type'][] = ['like', 'comment', 'share', 'bookmark', 'system']
    const type = types[Math.floor(Math.random() * types.length)]
    
    const messages = {
      like: ['用户王五点赞了您的文章', '您的内容获得了新的点赞'],
      comment: ['用户赵六评论了您的文章', '您收到了新的评论'],
      share: ['用户钱七分享了您的文章', '您的内容被分享了'],
      bookmark: ['用户孙八收藏了您的文章', '您的内容被收藏了'],
      system: ['系统维护通知', '新功能上线通知']
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title: type === 'system' ? '系统通知' : `新的${type === 'like' ? '点赞' : type === 'comment' ? '评论' : type === 'share' ? '分享' : '收藏'}`,
      message: messages[type][Math.floor(Math.random() * messages[type].length)],
      timestamp: new Date(),
      read: false,
      avatar: type !== 'system' ? '👤' : undefined
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'share':
        return <Share2 className="w-4 h-4 text-green-500" />
      case 'bookmark':
        return <Bookmark className="w-4 h-4 text-yellow-500" />
      case 'system':
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    
    if (diff < 60 * 1000) {
      return '刚刚'
    } else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
    } else {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
    }
  }

  return (
    <div className="relative">
      {/* 通知按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* 通知面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 通知列表 */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
            >
              {/* 头部 */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">通知</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      全部已读
                    </button>
                  )}
                </div>
              </div>

              {/* 通知列表 */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">暂无通知</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* 头像或图标 */}
                          <div className="flex-shrink-0">
                            {notification.avatar ? (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                                {notification.avatar}
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                          </div>

                          {/* 内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>

                          {/* 未读指示器 */}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
