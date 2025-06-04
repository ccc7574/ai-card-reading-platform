'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Heart, 
  Reply, 
  MoreVertical,
  User,
  Clock,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

interface Comment {
  id: string
  cardId: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  replies?: Comment[]
  likes: number
  isEdited: boolean
}

interface RealtimeCommentsProps {
  cardId: string
  className?: string
}

export function RealtimeComments({ cardId, className = '' }: RealtimeCommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [onlineViewers, setOnlineViewers] = useState<any[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadComments()
    loadOnlineViewers()
    
    // 模拟实时更新
    const interval = setInterval(() => {
      loadComments()
      loadOnlineViewers()
    }, 5000)

    return () => clearInterval(interval)
  }, [cardId])

  useEffect(() => {
    // 自动滚动到最新评论
    scrollToBottom()
  }, [comments])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/realtime?action=comments&cardId=${cardId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setComments(data.data.comments)
        }
      }
    } catch (error) {
      console.error('加载评论失败:', error)
    }
  }

  const loadOnlineViewers = async () => {
    try {
      const response = await fetch(`/api/realtime?action=card_viewers&cardId=${cardId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOnlineViewers(data.data.viewers)
        }
      }
    } catch (error) {
      console.error('加载在线查看者失败:', error)
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || !user) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          cardId,
          userId: user.id,
          userName: user.user_metadata?.name || user.email || '匿名用户',
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNewComment('')
          loadComments() // 重新加载评论
        }
      }
    } catch (error) {
      console.error('发送评论失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const likeComment = async (commentId: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like_comment',
          commentId,
          userId: user.id
        })
      })

      if (response.ok) {
        loadComments() // 重新加载评论
      }
    } catch (error) {
      console.error('点赞评论失败:', error)
    }
  }

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`
    return `${Math.floor(minutes / 1440)}天前`
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* 头部 - 在线查看者 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              实时讨论 ({comments.length})
            </span>
          </div>
          
          {onlineViewers.length > 0 && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">
                {onlineViewers.length} 人在线
              </span>
              <div className="flex -space-x-2">
                {onlineViewers.slice(0, 3).map((viewer, index) => (
                  <div
                    key={viewer.id}
                    className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                    title={viewer.name}
                  >
                    {viewer.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {onlineViewers.length > 3 && (
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs border-2 border-white">
                    +{onlineViewers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 评论列表 */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex space-x-3"
            >
              {/* 用户头像 */}
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
              
              {/* 评论内容 */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.userName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(comment.timestamp)}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
                
                {/* 评论操作 */}
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => likeComment(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">{comment.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span className="text-xs">回复</span>
                  </button>
                </div>
                
                {/* 回复列表 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                          {reply.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-white rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 text-xs">
                              {reply.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>还没有评论，来发表第一个评论吧！</p>
          </div>
        )}
        
        <div ref={commentsEndRef} />
      </div>

      {/* 评论输入框 */}
      {user ? (
        <div className="p-4 border-t border-gray-100">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {(user.user_metadata?.name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && submitComment()}
                  placeholder="写下您的想法..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={submitComment}
                  disabled={!newComment.trim() || isLoading}
                  size="sm"
                  className="px-4"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">请登录后参与讨论</p>
        </div>
      )}
    </div>
  )
}
