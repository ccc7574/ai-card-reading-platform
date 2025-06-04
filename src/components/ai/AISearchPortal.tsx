'use client'

import React, { useState, useRef, useEffect } from 'react'

import { 
  Search, 
  Brain, 
  Sparkles, 
  Zap, 
  Target, 
  TrendingUp,
  BookOpen,
  Lightbulb,
  Cpu,
  Network,
  ArrowRight,
  Mic,
  Camera,
  Globe,
  Code,
  Palette,
  BarChart3,
  Rocket,
  X
} from 'lucide-react'

interface AISearchPortalProps {
  onSearch: (query: string, type: string, context: any) => void
  isLoading?: boolean
  className?: string
}

interface SearchSuggestion {
  id: string
  text: string
  type: string
  icon: React.ComponentType<any>
  category: string
  color: string
  description: string
}

export function AISearchPortal({ onSearch, isLoading = false, className = '' }: AISearchPortalProps) {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedType, setSelectedType] = useState('explore')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchTypes = [
    { id: 'explore', label: '探索', icon: Search, color: 'from-blue-500 to-cyan-500' },
    { id: 'learn', label: '学习', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
    { id: 'create', label: '创作', icon: Lightbulb, color: 'from-purple-500 to-pink-500' },
    { id: 'analyze', label: '分析', icon: BarChart3, color: 'from-orange-500 to-red-500' }
  ]

  const suggestions: SearchSuggestion[] = [
    {
      id: '1',
      text: '机器学习基础',
      type: 'learn',
      icon: Brain,
      category: 'AI基础',
      color: 'bg-blue-500',
      description: '了解机器学习的核心概念和算法'
    },
    {
      id: '2',
      text: 'RAG技术原理',
      type: 'explore',
      icon: Network,
      category: 'AI技术',
      color: 'bg-purple-500',
      description: '探索检索增强生成技术'
    },
    {
      id: '3',
      text: 'AI产品设计',
      type: 'create',
      icon: Palette,
      category: '产品设计',
      color: 'bg-pink-500',
      description: '创建AI驱动的产品设计方案'
    },
    {
      id: '4',
      text: 'Transformer架构',
      type: 'analyze',
      icon: Cpu,
      category: '深度学习',
      color: 'bg-green-500',
      description: '分析Transformer的工作原理'
    },
    {
      id: '5',
      text: 'AI Agent开发',
      type: 'learn',
      icon: Rocket,
      category: 'AI开发',
      color: 'bg-orange-500',
      description: '学习智能代理的开发方法'
    },
    {
      id: '6',
      text: '大模型应用',
      type: 'explore',
      icon: Globe,
      category: 'AI应用',
      color: 'bg-cyan-500',
      description: '探索大语言模型的应用场景'
    }
  ]

  const filteredSuggestions = suggestions.filter(s => 
    selectedType === 'explore' || s.type === selectedType
  )

  const handleSearch = () => {
    if (!query.trim()) return
    
    const context = {
      type: selectedType,
      intent: getIntentFromType(selectedType),
      complexity: 'medium',
      timestamp: new Date().toISOString()
    }
    
    onSearch(query, selectedType, context)
    setQuery('')
    setIsExpanded(false)
    setShowSuggestions(false)
  }

  const getIntentFromType = (type: string) => {
    const intents = {
      explore: 'exploration',
      learn: 'learning',
      create: 'creation',
      analyze: 'analysis'
    }
    return intents[type as keyof typeof intents] || 'exploration'
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setSelectedType(suggestion.type)
    setTimeout(() => {
      const context = {
        type: suggestion.type,
        intent: getIntentFromType(suggestion.type),
        complexity: 'medium',
        category: suggestion.category,
        timestamp: new Date().toISOString()
      }
      onSearch(suggestion.text, suggestion.type, context)
      setQuery('')
      setIsExpanded(false)
      setShowSuggestions(false)
    }, 100)
  }

  useEffect(() => {
    // 标记为客户端渲染
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  return (
    <div className={`relative ${className}`}>
      {/* 主搜索界面 */}
      <div className="relative">
        {/* 背景光效 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl" />

        {/* 主容器 */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl overflow-hidden">
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
                AI知识入口
              </h2>
              <p className="text-gray-600 text-lg">
                探索、学习、创作、分析 - 开启你的AI知识之旅
              </p>
            </div>

            {/* 搜索类型选择 */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-gray-100 rounded-2xl p-1">
                {searchTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`relative flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                        selectedType === type.id
                          ? 'text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {selectedType === type.id && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${type.color} rounded-xl`} />
                      )}
                      <Icon className="w-5 h-5 relative z-10" />
                      <span className="font-medium relative z-10">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 搜索输入框 */}
            <div className="relative mb-6">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => {
                    setIsExpanded(true)
                    setShowSuggestions(true)
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={`${searchTypes.find(t => t.id === selectedType)?.label}AI知识...`}
                  className="w-full px-6 py-4 pr-32 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 placeholder-gray-400"
                />
                
                {/* 输入框右侧按钮 */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={isLoading || !query.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span className="hidden sm:inline">生成</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 智能建议 */}
            {isClient && showSuggestions && (
              <div className="overflow-hidden">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                        智能建议
                      </h3>
                      <button
                        onClick={() => setShowSuggestions(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
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
              </div>
            )}

            {/* 底部功能提示 */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>精准搜索</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>智能分析</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>AI生成</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 背景装饰效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/20 rounded-full" />
        <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400/30 rounded-full" />
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-cyan-400/25 rounded-full" />
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-blue-400/20 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-purple-400/20 rounded-full" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-400/30 rounded-full" />
      </div>
    </div>
  )
}

export default AISearchPortal
