'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Link, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Card as CardType } from '@/types'

interface SimpleCardGeneratorProps {
  isOpen?: boolean
  onClose?: () => void
  onCardGenerated?: (card: CardType) => void
}

export function SimpleCardGenerator({ isOpen = false, onClose, onCardGenerated }: SimpleCardGeneratorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const modalIsOpen = isOpen || internalIsOpen
  
  const [url, setUrl] = useState('')
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('gemini')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
    setUrl('')
    setError(null)
  }

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError('请输入有效的URL')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // 调用AI生成API
      const response = await fetch('/api/simple-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          aiProvider
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      if (data.success && data.card) {
        onCardGenerated?.(data.card)
        handleClose()
      } else {
        throw new Error('生成的卡片数据无效')
      }

    } catch (err) {
      console.error('卡片生成错误:', err)
      setError(err instanceof Error ? err.message : '生成过程中出现错误')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {/* 触发按钮 */}
      {!onClose && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setInternalIsOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            AI生成卡片
          </Button>
        </motion.div>
      )}

      {/* 模态框 */}
      <AnimatePresence>
        {modalIsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isGenerating && handleClose()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="bg-white shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                      AI智能卡片生成
                    </CardTitle>
                    {!isGenerating && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isGenerating ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          文章链接
                        </label>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="输入AI文章或KOL观点的链接..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AI服务提供商
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setAiProvider('openai')}
                            className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                              aiProvider === 'openai'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-lg">🤖</span>
                              <span>OpenAI</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              GPT-4 + DALL-E 3
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAiProvider('gemini')}
                            className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                              aiProvider === 'gemini'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-lg">✨</span>
                              <span>Gemini</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Gemini 2.0 + Imagen 3
                            </div>
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                        >
                          {error}
                        </motion.div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={handleClose}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleGenerate}
                          disabled={!url.trim()}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          开始生成
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                          <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          AI正在处理中...
                        </h3>
                        <p className="text-gray-600 text-sm">
                          请稍候，我们正在为您生成高质量的知识卡片
                        </p>
                      </div>

                      <div className="flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
