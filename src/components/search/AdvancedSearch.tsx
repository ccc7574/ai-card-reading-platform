'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Calendar, Tag, User, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card as CardType } from '@/types'

interface SearchFilters {
  query: string
  category: string
  difficulty: string
  author: string
  dateRange: string
  tags: string[]
  readingTime: string
  sortBy: string
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onClose: () => void
  isOpen: boolean
}

export function AdvancedSearch({ onSearch, onClose, isOpen }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    difficulty: 'all',
    author: '',
    dateRange: 'all',
    tags: [],
    readingTime: 'all',
    sortBy: 'newest'
  })

  const [availableTags, setAvailableTags] = useState<string[]>([
    'AI', '机器学习', '深度学习', '自然语言处理', '计算机视觉',
    '前端开发', '后端开发', '全栈开发', 'React', 'Vue', 'Angular',
    '数据科学', '区块链', '云计算', '微服务', 'DevOps',
    '产品设计', 'UI/UX', '用户体验', '交互设计',
    '创业', '商业模式', '市场营销', '投资', '管理'
  ])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleSearch = () => {
    onSearch(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      query: '',
      category: 'all',
      difficulty: 'all',
      author: '',
      dateRange: 'all',
      tags: [],
      readingTime: 'all',
      sortBy: 'newest'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 搜索面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Search className="w-6 h-6" />
                  <h2 className="text-xl font-bold">高级搜索</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 搜索内容 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* 关键词搜索 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关键词搜索
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={filters.query}
                      onChange={(e) => handleFilterChange('query', e.target.value)}
                      placeholder="输入关键词搜索标题、摘要或内容..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 筛选器网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 分类筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分类
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">全部分类</option>
                      <option value="article">技术文章</option>
                      <option value="kol-opinion">KOL观点</option>
                      <option value="insight">深度洞察</option>
                    </select>
                  </div>

                  {/* 难度筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      难度等级
                    </label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">全部难度</option>
                      <option value="beginner">初级</option>
                      <option value="intermediate">中级</option>
                      <option value="advanced">高级</option>
                    </select>
                  </div>

                  {/* 阅读时间筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      阅读时间
                    </label>
                    <select
                      value={filters.readingTime}
                      onChange={(e) => handleFilterChange('readingTime', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">全部时长</option>
                      <option value="short">短篇 (1-3分钟)</option>
                      <option value="medium">中篇 (4-8分钟)</option>
                      <option value="long">长篇 (9分钟以上)</option>
                    </select>
                  </div>

                  {/* 作者筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      作者
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        value={filters.author}
                        onChange={(e) => handleFilterChange('author', e.target.value)}
                        placeholder="输入作者名称..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* 时间范围筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      发布时间
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">全部时间</option>
                      <option value="today">今天</option>
                      <option value="week">本周</option>
                      <option value="month">本月</option>
                      <option value="year">今年</option>
                    </select>
                  </div>

                  {/* 排序方式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      排序方式
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="newest">最新发布</option>
                      <option value="oldest">最早发布</option>
                      <option value="popular">最受欢迎</option>
                      <option value="trending">热门趋势</option>
                      <option value="reading_time">阅读时间</option>
                    </select>
                  </div>
                </div>

                {/* 标签筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    标签筛选 ({filters.tags.length} 个已选择)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          filters.tags.includes(tag)
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>重置筛选</span>
                </Button>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    搜索
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
