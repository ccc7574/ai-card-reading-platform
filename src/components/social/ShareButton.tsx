'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Link, 
  Copy, 
  Check,
  MessageCircle,
  Mail,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  title: string
  summary: string
  url?: string
  imageUrl?: string
  author?: string
  tags?: string[]
  className?: string
  variant?: 'default' | 'minimal' | 'floating'
}

interface SharePlatform {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  shareUrl: (data: ShareData) => string
}

interface ShareData {
  title: string
  summary: string
  url: string
  imageUrl?: string
  author?: string
  tags?: string[]
}

const sharePlatforms: SharePlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-blue-500 hover:bg-blue-600',
    shareUrl: (data) => {
      const text = `${data.title}\n\n${data.summary}\n\n${data.tags?.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ') || ''}`
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (data) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}&summary=${encodeURIComponent(data.summary)}`
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (data) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title + ' - ' + data.summary)}`
    }
  },
  {
    id: 'wechat',
    name: '微信',
    icon: MessageCircle,
    color: 'bg-green-500 hover:bg-green-600',
    shareUrl: (data) => {
      // 微信分享需要特殊处理，这里提供一个通用链接
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.url)}`
    }
  },
  {
    id: 'email',
    name: '邮件',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700',
    shareUrl: (data) => {
      const subject = `分享：${data.title}`
      const body = `${data.title}\n\n${data.summary}\n\n查看详情：${data.url}\n\n${data.author ? `作者：${data.author}` : ''}`
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }
]

export function ShareButton({ 
  title, 
  summary, 
  url, 
  imageUrl, 
  author, 
  tags = [],
  className = '',
  variant = 'default'
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // 生成分享URL
  const shareUrl = url || `${window.location.origin}/share/${encodeURIComponent(title)}`
  
  const shareData: ShareData = {
    title,
    summary,
    url: shareUrl,
    imageUrl,
    author,
    tags
  }

  const handleShare = async (platform: SharePlatform) => {
    try {
      // 记录分享事件
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'share',
          platform: platform.id,
          content: { title, url: shareUrl }
        })
      })

      if (platform.id === 'wechat') {
        // 微信分享显示二维码
        const qrUrl = platform.shareUrl(shareData)
        window.open(qrUrl, '_blank', 'width=300,height=300')
      } else {
        // 其他平台直接打开分享链接
        window.open(platform.shareUrl(shareData), '_blank', 'width=600,height=400')
      }
    } catch (error) {
      console.error('分享失败:', error)
    }
    
    setIsOpen(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      
      // 记录复制事件
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'copy_link',
          content: { title, url: shareUrl }
        })
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary,
          url: shareUrl
        })
        
        // 记录原生分享事件
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'native_share',
            content: { title, url: shareUrl }
          })
        })
      } catch (error) {
        console.error('原生分享失败:', error)
      }
    }
  }

  const handleDownload = async () => {
    try {
      // 生成分享卡片图片
      const response = await fetch('/api/share/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, author, imageUrl })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${title.slice(0, 20)}-分享卡片.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  if (variant === 'minimal') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 ${className}`}
        >
          <Share2 className="w-4 h-4" />
        </Button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50"
            >
              <div className="flex space-x-1">
                {sharePlatforms.slice(0, 3).map((platform) => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform)}
                      className={`p-2 rounded-lg text-white transition-colors ${platform.color}`}
                      title={`分享到${platform.name}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  )
                })}
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                  title="复制链接"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
        >
          <Share2 className="w-6 h-6" />
        </Button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
            >
              <div className="grid grid-cols-2 gap-2 w-48">
                {sharePlatforms.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform)}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-white transition-colors ${platform.color}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{platform.name}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className={`flex items-center space-x-2 ${className}`}
      >
        <Share2 className="w-4 h-4" />
        <span>分享</span>
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 min-w-80"
          >
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">分享到</h3>
              <div className="grid grid-cols-3 gap-3">
                {sharePlatforms.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform)}
                      className={`flex flex-col items-center space-y-2 p-3 rounded-lg text-white transition-colors ${platform.color}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{platform.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-1"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copied ? '已复制' : '复制链接'}</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">下载卡片</span>
                </button>
                
                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">更多</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
