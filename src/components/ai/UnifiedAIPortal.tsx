'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Search, 
  Brain, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  BarChart3,
  Mic, 
  Camera,
  Link,
  Globe,
  Zap,
  ArrowRight,
  Plus,
  Target,
  TrendingUp,
  Code,
  Palette
} from 'lucide-react'

interface UnifiedAIPortalProps {
  onGenerate: (input: string, type: 'url' | 'search', searchType?: string) => void
  isLoading?: boolean
  className?: string
}

export function UnifiedAIPortal({ onGenerate, isLoading = false, className = '' }: UnifiedAIPortalProps) {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'url' | 'search'>('search')
  const [selectedSearchType, setSelectedSearchType] = useState('explore')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const searchTypes = [
    { id: 'explore', label: '探索', icon: Search, color: 'from-blue-500 to-cyan-500', desc: '发现新知识' },
    { id: 'learn', label: '学习', icon: BookOpen, color: 'from-green-500 to-emerald-500', desc: '系统学习' },
    { id: 'create', label: '创作', icon: Lightbulb, color: 'from-purple-500 to-pink-500', desc: '创意灵感' },
    { id: 'analyze', label: '分析', icon: BarChart3, color: 'from-orange-500 to-red-500', desc: '深度分析' }
  ]

  const suggestions = [
    {
      id: 'ml-basics',
      text: '机器学习基础',
      type: 'learn',
      category: 'AI基础',
      description: '了解机器学习的核心概念和算法',
      icon: Brain,
      color: 'bg-blue-500'
    },
    {
      id: 'rag-tech',
      text: 'RAG技术原理',
      type: 'explore',
      category: 'AI技术',
      description: '探索检索增强生成技术',
      icon: Search,
      color: 'bg-green-500'
    },
    {
      id: 'ai-product',
      text: 'AI产品设计',
      type: 'create',
      category: '产品设计',
      description: '设计智能化的产品体验',
      icon: Lightbulb,
      color: 'bg-purple-500'
    },
    {
      id: 'deep-learning',
      text: '深度学习应用',
      type: 'analyze',
      category: '技术分析',
      description: '分析深度学习的实际应用',
      icon: BarChart3,
      color: 'bg-orange-500'
    },
    {
      id: 'nlp-tech',
      text: '自然语言处理',
      type: 'learn',
      category: 'AI技术',
      description: '学习NLP的核心技术',
      icon: Code,
      color: 'bg-cyan-500'
    },
    {
      id: 'ai-ethics',
      text: 'AI伦理思考',
      type: 'analyze',
      category: '伦理思考',
      description: '探讨AI发展的伦理问题',
      icon: Target,
      color: 'bg-red-500'
    }
  ]

  // 检测输入是否为URL
  const isUrl = (text: string) => {
    try {
      new URL(text)
      return true
    } catch {
      return /^https?:\/\//.test(text) || /^www\./.test(text)
    }
  }

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setInput(value)
    const detectedType = isUrl(value) ? 'url' : 'search'
    if (detectedType !== inputType) {
      setInputType(detectedType)
    }
  }

  const handleGenerate = () => {
    if (input.trim() && !isLoading) {
      onGenerate(input.trim(), inputType, inputType === 'search' ? selectedSearchType : undefined)
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    setInput(suggestion.text)
    setInputType('search')
    setSelectedSearchType(suggestion.type)
    setShowSuggestions(false)
    onGenerate(suggestion.text, 'search', suggestion.type)
  }

  const filteredSuggestions = suggestions.filter(s => 
    inputType === 'search' ? s.type === selectedSearchType : true
  )

  const getPlaceholder = () => {
    if (inputType === 'url') {
      return '粘贴链接生成卡片...'
    }
    const currentType = searchTypes.find(t => t.id === selectedSearchType)
    return `${currentType?.desc}AI知识...`
  }

  return (
    <div className={`relative ${className}`}>
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl blur-3xl" />
      
      {/* 主容器 */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl overflow-hidden">
        {/* 顶部装饰条 */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500" />
        
        <div className="p-8">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
              AI智能生成
            </h2>
            <p className="text-gray-600 text-lg">
              输入链接或搜索关键词，AI为你生成精美卡片
            </p>
          </div>

          {/* 输入类型切换 */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setInputType('search')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  inputType === 'search'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">智能搜索</span>
              </button>
              <button
                onClick={() => setInputType('url')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  inputType === 'url'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Link className="w-5 h-5" />
                <span className="font-medium">链接生成</span>
              </button>
            </div>
          </div>

          {/* 搜索类型选择 - 仅在搜索模式显示 */}
          {inputType === 'search' && (
            <div className="flex justify-center mb-6">
              <div className="flex bg-gray-50 rounded-2xl p-1 gap-1">
                {searchTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedSearchType(type.id)}
                      className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        selectedSearchType === type.id
                          ? 'text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {selectedSearchType === type.id && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${type.color} rounded-xl`} />
                      )}
                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="text-sm font-medium relative z-10">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 主输入框 */}
          <div className="relative mb-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                onFocus={() => setShowSuggestions(true)}
                placeholder={getPlaceholder()}
                className="w-full px-6 py-4 pr-40 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 placeholder-gray-400"
              />
              
              {/* 输入框右侧按钮组 */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {/* 辅助输入按钮 */}
                <button 
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="语音输入"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="图像输入"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="网页链接"
                >
                  <Globe className="w-5 h-5" />
                </button>
                
                {/* 生成按钮 */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !input.trim()}
                  className={`px-6 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                    inputType === 'url'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span className="hidden sm:inline">生成</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 智能建议 - 仅在搜索模式且客户端渲染时显示 */}
          {isClient && inputType === 'search' && showSuggestions && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                  智能建议
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  收起
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSuggestions.map((suggestion) => {
                  const Icon = suggestion.icon
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="group p-4 bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 text-left hover:shadow-md"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 ${suggestion.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                            {suggestion.text}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {suggestion.description}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                            {suggestion.category}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 底部功能提示 */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>智能生成</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>多模态输入</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span>AI驱动</span>
            </div>
          </div>
        </div>

        {/* 背景装饰效果 */}
        {isClient && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/20 rounded-full" />
            <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400/30 rounded-full" />
            <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-cyan-400/25 rounded-full" />
            <div className="absolute bottom-10 right-10 w-1 h-1 bg-blue-400/20 rounded-full" />
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-purple-400/20 rounded-full" />
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-400/30 rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}

export default UnifiedAIPortal
