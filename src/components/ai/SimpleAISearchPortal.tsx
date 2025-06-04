'use client'

import React, { useState, useRef } from 'react'
import { 
  Search, 
  Brain, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  BarChart3,
  Mic, 
  Camera,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react'

interface SimpleAISearchPortalProps {
  onSearch: (query: string, type: string) => void
  isLoading?: boolean
  className?: string
}

export function SimpleAISearchPortal({ onSearch, isLoading = false, className = '' }: SimpleAISearchPortalProps) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('explore')
  const inputRef = useRef<HTMLInputElement>(null)

  const searchTypes = [
    { id: 'explore', label: '探索', icon: Search, color: 'from-blue-500 to-cyan-500' },
    { id: 'learn', label: '学习', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
    { id: 'create', label: '创作', icon: Lightbulb, color: 'from-purple-500 to-pink-500' },
    { id: 'analyze', label: '分析', icon: BarChart3, color: 'from-orange-500 to-red-500' }
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
      icon: BookOpen,
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

  const handleSearch = () => {
    if (query.trim() && !isLoading) {
      onSearch(query.trim(), selectedType)
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.text)
    setSelectedType(suggestion.type)
    onSearch(suggestion.text, suggestion.type)
  }

  const filteredSuggestions = suggestions.filter(s => s.type === selectedType)

  return (
    <div className={`bg-white rounded-3xl border border-gray-200/50 shadow-2xl overflow-hidden ${className}`}>
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              智能建议
            </h3>
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
  )
}

export default SimpleAISearchPortal
