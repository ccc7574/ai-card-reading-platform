'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  MoreHorizontal,
  Send,
  User,
  Clock,
  TrendingUp,
  Smile
} from 'lucide-react'
import { Comment, CommentStats } from '@/lib/comments/comment-system'

interface CommentSectionProps {
  cardId: string
  isOpen: boolean
  onClose: () => void
}

export default function CommentSection({ cardId, isOpen, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, cardId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/comments?cardId=${cardId}&action=list`)
      if (response.ok) {
        const result = await response.json()
        setComments(result.data.comments)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('加载评论失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockComments = async () => {
    try {
      const response = await fetch(`/api/comments?cardId=${cardId}&action=mock`)
      if (response.ok) {
        await loadComments()
      }
    } catch (error) {
      console.error('生成模拟评论失败:', error)
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          cardId,
          userId: 'current_user',
          content: newComment
        })
      })

      if (response.ok) {
        setNewComment('')
        await loadComments()
      }
    } catch (error) {
      console.error('添加评论失败:', error)
    }
  }

  const addReply = async (commentId: string) => {
    if (!replyContent.trim()) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_reply',
          commentId,
          userId: 'current_user',
          content: replyContent,
          replyTo: replyTo
        })
      })

      if (response.ok) {
        setReplyContent('')
        setReplyTo(null)
        await loadComments()
      }
    } catch (error) {
      console.error('添加回复失败:', error)
    }
  }

  const likeComment = async (commentId: string) => {
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like_comment',
          commentId,
          userId: 'current_user'
        })
      })
      await loadComments()
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'negative': return '😕'
      default: return '😐'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        
        {/* 评论面板 */}
        <motion.div
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2" />
                评论讨论
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 统计信息 */}
            {stats && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalComments}</div>
                  <div className="text-sm text-blue-800">评论</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-green-800">平均评分</div>
                </div>
              </div>
            )}

            {/* 情感分布 */}
            {stats && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">情感分布</h3>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-green-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.sentimentDistribution.positive / stats.totalComments) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: `${(stats.sentimentDistribution.neutral / stats.totalComments) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-red-100 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(stats.sentimentDistribution.negative / stats.totalComments) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 快速操作 */}
            <div className="flex space-x-2">
              <button
                onClick={generateMockComments}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                生成示例评论
              </button>
            </div>
          </div>

          {/* 评论列表 */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">加载评论中...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">还没有评论</p>
                <p className="text-sm text-gray-500">成为第一个评论的人吧！</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    className="bg-gray-50 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* 评论头部 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <img
                          src={comment.userAvatar || '/api/placeholder/32/32'}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{comment.userName}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                            {comment.isEdited && <span className="ml-2 text-gray-400">(已编辑)</span>}
                          </div>
                        </div>
                      </div>
                      
                      {/* 情感标识 */}
                      <div className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(comment.sentiment)}`}>
                        {getSentimentIcon(comment.sentiment)}
                      </div>
                    </div>

                    {/* 评论内容 */}
                    <p className="text-gray-800 mb-3 leading-relaxed">{comment.content}</p>

                    {/* 标签 */}
                    {comment.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {comment.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 评论操作 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => likeComment(comment.id)}
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{comment.likes}</span>
                        </button>
                        
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          <span>回复</span>
                        </button>
                      </div>

                      <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* 回复列表 */}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                        {comment.replies.map((reply, replyIndex) => (
                          <div key={reply.id} className="bg-white rounded-lg p-3">
                            <div className="flex items-center mb-2">
                              <img
                                src={reply.userAvatar || '/api/placeholder/24/24'}
                                alt={reply.userName}
                                className="w-6 h-6 rounded-full mr-2"
                              />
                              <div className="font-medium text-sm text-gray-900">{reply.userName}</div>
                              {reply.replyTo && (
                                <span className="text-xs text-gray-500 ml-2">
                                  回复 @{reply.replyTo}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800 mb-2">{reply.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString('zh-CN')}
                              </div>
                              <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500">
                                <Heart className="w-3 h-3" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 回复输入框 */}
                    {replyTo === comment.id && (
                      <motion.div
                        className="mt-4 p-3 bg-white rounded-lg border"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`回复 ${comment.userName}...`}
                          className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setReplyTo(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => addReply(comment.id)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            回复
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 底部输入框 */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="分享你的想法..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex space-x-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <Smile className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <button
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    发布
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
