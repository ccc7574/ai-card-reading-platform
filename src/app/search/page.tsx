'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Heart,
  Bookmark,
  Share2,
  X,
  SlidersHorizontal,
  Grid,
  List,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Card as CardType } from '@/types'

interface SearchFilters {
  query: string
  categories: string[]
  authors: string[]
  dateRange: {
    start: string
    end: string
  }
  difficulty: string[]
  sortBy: 'relevance' | 'date' | 'popularity' | 'rating'
  viewType: 'grid' | 'list'
}

interface SearchResult extends CardType {
  relevanceScore: number
  highlightedContent: string
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    authors: [],
    dateRange: { start: '', end: '' },
    difficulty: [],
    sortBy: 'relevance',
    viewType: 'grid'
  })
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  // 可用的筛选选项
  const availableCategories = ['AI技术', '产品设计', '商业洞察', '开发技术', '数据科学', '用户体验']
  const availableAuthors = ['张三', '李四', '王五', 'AI专家', '产品经理', '技术大牛']
  const difficultyLevels = ['入门', '中级', '高级', '专家']

  useEffect(() => {
    // 从URL参数获取初始搜索查询
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get('q')
    if (query) {
      setFilters(prev => ({ ...prev, query }))
      performSearch({ ...filters, query })
    }
    
    // 加载搜索历史
    loadSearchHistory()
  }, [])

  const loadSearchHistory = () => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }

  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  const performSearch = async (searchFilters: SearchFilters) => {
    if (!searchFilters.query.trim()) return
    
    setLoading(true)
    saveSearchHistory(searchFilters.query)
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟搜索结果
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'AI驱动的代码生成工具革命',
          summary: '探索最新的AI代码生成技术，如何改变软件开发流程...',
          content: '详细内容...',
          category: 'AI技术',
          author: 'AI专家',
          readTime: 8,
          difficulty: 'intermediate',
          tags: ['AI', '代码生成', '开发工具'],
          createdAt: '2024-03-15',
          updatedAt: '2024-03-15',
          imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
          likes: 234,
          views: 1567,
          bookmarks: 89,
          shares: 45,
          relevanceScore: 95,
          highlightedContent: '探索最新的<mark>AI代码生成</mark>技术，如何改变软件开发流程...'
        },
        {
          id: '2',
          title: '2024年产品设计趋势预测',
          summary: '分析即将到来的产品设计趋势，为设计师提供前瞻性指导...',
          content: '详细内容...',
          category: '产品设计',
          author: '产品经理',
          readTime: 6,
          difficulty: 'beginner',
          tags: ['设计趋势', '用户体验', '产品'],
          createdAt: '2024-03-14',
          updatedAt: '2024-03-14',
          imageUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
          likes: 189,
          views: 1234,
          bookmarks: 67,
          shares: 32,
          relevanceScore: 87,
          highlightedContent: '分析即将到来的<mark>产品设计趋势</mark>，为设计师提供前瞻性指导...'
        }
      ]
      
      setResults(mockResults)
      setTotalResults(mockResults.length)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    performSearch(filters)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    if (filters.query.trim()) {
      performSearch(newFilters)
    }
  }

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      categories: [],
      authors: [],
      dateRange: { start: '', end: '' },
      difficulty: [],
      sortBy: 'relevance',
      viewType: filters.viewType
    })
  }

  const SearchResultCard = ({ result }: { result: SearchResult }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        {result.imageUrl && (
          <img
            src={result.imageUrl}
            alt={result.title}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {result.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{result.relevanceScore}%</span>
            </div>
          </div>
          
          <div 
            className="text-gray-600 text-sm mb-3 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: result.highlightedContent }}
          />
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {result.author}
            </span>
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(result.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {result.readTime}分钟
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {result.views}
              </span>
              <span className="flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                {result.likes}
              </span>
              <span className="flex items-center">
                <Bookmark className="w-3 h-3 mr-1" />
                {result.bookmarks}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {result.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="搜索知识内容..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleFilterChange('viewType', 'grid')}
                className={`p-2 rounded ${
                  filters.viewType === 'grid' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFilterChange('viewType', 'list')}
                className={`p-2 rounded ${
                  filters.viewType === 'list' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* 侧边栏筛选器 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-80 flex-shrink-0"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">筛选器</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      清除
                    </button>
                  </div>
                  
                  {/* 分类筛选 */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">分类</h4>
                    <div className="space-y-2">
                      {availableCategories.map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...filters.categories, category]
                                : filters.categories.filter(c => c !== category)
                              handleFilterChange('categories', newCategories)
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* 难度筛选 */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">难度</h4>
                    <div className="space-y-2">
                      {difficultyLevels.map((level) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.difficulty.includes(level)}
                            onChange={(e) => {
                              const newDifficulty = e.target.checked
                                ? [...filters.difficulty, level]
                                : filters.difficulty.filter(d => d !== level)
                              handleFilterChange('difficulty', newDifficulty)
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* 排序方式 */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">排序方式</h4>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="relevance">相关性</option>
                      <option value="date">最新发布</option>
                      <option value="popularity">最受欢迎</option>
                      <option value="rating">最高评分</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 主要内容区域 */}
          <div className="flex-1">
            {/* 搜索结果统计 */}
            {filters.query && (
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    搜索结果
                  </h2>
                  <p className="text-gray-600">
                    找到 {totalResults} 个相关结果，用时 0.12 秒
                  </p>
                </div>
                
                {searchHistory.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">最近搜索：</span>
                    {searchHistory.slice(0, 3).map((query) => (
                      <button
                        key={query}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, query }))
                          performSearch({ ...filters, query })
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 搜索结果 */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : filters.query ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  没有找到相关结果
                </h3>
                <p className="text-gray-600 mb-4">
                  尝试使用不同的关键词或调整筛选条件
                </p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800"
                >
                  清除所有筛选器
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  开始搜索
                </h3>
                <p className="text-gray-600">
                  输入关键词来搜索相关的知识内容
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
