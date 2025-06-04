'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bookmark, 
  Search, 
  Filter, 
  Grid, 
  List, 
  ArrowLeft,
  Heart,
  Share2,
  Trash2,
  FolderPlus,
  Folder,
  MoreVertical,
  Calendar,
  Tag,
  Eye,
  Clock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card as CardType } from '@/types'

interface BookmarkFolder {
  id: string
  name: string
  description?: string
  color: string
  itemCount: number
  createdAt: string
}

interface BookmarkedItem {
  id: string
  type: 'card' | 'content'
  title: string
  summary: string
  imageUrl?: string
  author: string
  tags: string[]
  bookmarkedAt: string
  folderId: string
  notes?: string
  readingTime: number
  category: string
  url?: string
}

const mockFolders: BookmarkFolder[] = [
  {
    id: 'default',
    name: '默认收藏',
    description: '未分类的收藏内容',
    color: 'blue',
    itemCount: 12,
    createdAt: '2024-01-15'
  },
  {
    id: 'ai-tech',
    name: 'AI技术',
    description: '人工智能相关的技术文章和资源',
    color: 'purple',
    itemCount: 8,
    createdAt: '2024-01-10'
  },
  {
    id: 'design',
    name: '设计灵感',
    description: '产品设计和用户体验相关内容',
    color: 'green',
    itemCount: 15,
    createdAt: '2024-01-08'
  },
  {
    id: 'business',
    name: '商业洞察',
    description: '商业策略和市场分析',
    color: 'orange',
    itemCount: 6,
    createdAt: '2024-01-05'
  }
]

const mockBookmarks: BookmarkedItem[] = [
  {
    id: '1',
    type: 'card',
    title: 'GPT-4的多模态能力突破：从文本到视觉的AI革命',
    summary: 'AI不再只是"读"文字，现在它能"看"世界了！GPT-4的视觉能力让机器真正理解图像内容。',
    author: 'OpenAI研究团队',
    tags: ['GPT-4', '多模态', '计算机视觉'],
    bookmarkedAt: '2024-01-20',
    folderId: 'ai-tech',
    notes: '这篇文章很好地解释了多模态AI的技术原理',
    readingTime: 8,
    category: 'AI技术'
  },
  {
    id: '2',
    type: 'content',
    title: '设计系统的演进：从组件库到设计语言',
    summary: '探讨现代设计系统如何从简单的组件库发展为完整的设计语言体系。',
    author: '设计师小王',
    tags: ['设计系统', 'UI/UX', '组件库'],
    bookmarkedAt: '2024-01-18',
    folderId: 'design',
    readingTime: 6,
    category: '产品设计',
    url: 'https://example.com/design-system'
  },
  {
    id: '3',
    type: 'card',
    title: '创业公司的产品市场匹配策略',
    summary: '如何在早期阶段找到产品与市场的最佳匹配点，避免常见的创业陷阱。',
    author: '创业导师李明',
    tags: ['创业', 'PMF', '产品策略'],
    bookmarkedAt: '2024-01-16',
    folderId: 'business',
    readingTime: 10,
    category: '商业洞察'
  }
]

export default function BookmarksPage() {
  const { user } = useAuth()
  const [folders, setFolders] = useState<BookmarkFolder[]>(mockFolders)
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>(mockBookmarks)
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  useEffect(() => {
    if (user) {
      loadBookmarks()
    }
  }, [user])

  const loadBookmarks = async () => {
    try {
      const response = await fetch(`/api/user/bookmarks?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || mockFolders)
        setBookmarks(data.bookmarks || mockBookmarks)
      }
    } catch (error) {
      console.error('加载收藏失败:', error)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    const newFolder: BookmarkFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      color: 'blue',
      itemCount: 0,
      createdAt: new Date().toISOString()
    }

    setFolders([...folders, newFolder])
    setNewFolderName('')
    setIsCreatingFolder(false)
  }

  const deleteBookmark = async (bookmarkId: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== bookmarkId))
  }

  const moveToFolder = async (bookmarkId: string, folderId: string) => {
    setBookmarks(bookmarks.map(b => 
      b.id === bookmarkId ? { ...b, folderId } : b
    ))
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesFolder = selectedFolder === 'all' || bookmark.folderId === selectedFolder
    const matchesSearch = searchQuery === '' || 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFolder && matchesSearch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'date':
      default:
        return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
    }
  })

  const getFolderColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      red: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">您需要登录才能查看收藏</p>
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* 头部 */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">我的收藏</h1>
                  <p className="text-sm text-gray-600">{bookmarks.length} 个收藏项目</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索收藏..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              {/* 排序 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">按时间排序</option>
                <option value="title">按标题排序</option>
                <option value="category">按分类排序</option>
              </select>

              {/* 视图切换 */}
              <div className="flex border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* 新建文件夹 */}
              <Button
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center space-x-2"
              >
                <FolderPlus className="w-4 h-4" />
                <span>新建文件夹</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 侧边栏 - 文件夹列表 */}
          <div className="w-64 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">收藏文件夹</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                    selectedFolder === 'all' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Bookmark className="w-4 h-4 mr-2" />
                    <span>全部收藏</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {bookmarks.length}
                  </span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                      selectedFolder === folder.id 
                        ? `${getFolderColor(folder.color)} border` 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Folder className="w-4 h-4 mr-2" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {folder.itemCount}
                    </span>
                  </button>
                ))}
              </div>

              {/* 新建文件夹表单 */}
              {isCreatingFolder && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <input
                    type="text"
                    placeholder="文件夹名称"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={createFolder}>创建</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCreatingFolder(false)}>
                      取消
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1">
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无收藏</h3>
                <p className="text-gray-600 mb-6">开始收藏您感兴趣的内容吧</p>
                <Link href="/">
                  <Button>浏览内容</Button>
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    viewMode={viewMode}
                    folders={folders}
                    onDelete={deleteBookmark}
                    onMove={moveToFolder}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 收藏卡片组件
interface BookmarkCardProps {
  bookmark: BookmarkedItem
  viewMode: 'grid' | 'list'
  folders: BookmarkFolder[]
  onDelete: (id: string) => void
  onMove: (id: string, folderId: string) => void
}

function BookmarkCard({ bookmark, viewMode, folders, onDelete, onMove }: BookmarkCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                bookmark.type === 'card'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {bookmark.type === 'card' ? 'AI卡片' : '内容'}
              </span>
              <span className="text-xs text-gray-500">{bookmark.category}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {bookmark.readingTime}分钟
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {bookmark.title}
            </h3>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {bookmark.summary}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{bookmark.author}</span>
                <span>收藏于 {formatDate(bookmark.bookmarkedAt)}</span>
              </div>

              <div className="flex items-center space-x-2">
                {bookmark.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative ml-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowMoveMenu(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  移动到文件夹
                </button>
                <button
                  onClick={() => {
                    onDelete(bookmark.id)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除收藏
                </button>
              </div>
            )}

            {showMoveMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onMove(bookmark.id, folder.id)
                      setShowMoveMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {folder.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
    >
      {bookmark.imageUrl && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={bookmark.imageUrl}
            alt={bookmark.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            bookmark.type === 'card'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {bookmark.type === 'card' ? 'AI卡片' : '内容'}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowMoveMenu(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  移动到文件夹
                </button>
                <button
                  onClick={() => {
                    onDelete(bookmark.id)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除收藏
                </button>
              </div>
            )}

            {showMoveMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onMove(bookmark.id, folder.id)
                      setShowMoveMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {folder.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {bookmark.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {bookmark.summary}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {bookmark.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span>{bookmark.author}</span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {bookmark.readingTime}分钟
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(bookmark.bookmarkedAt)}</span>
          </div>
        </div>

        {bookmark.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 italic">
              📝 {bookmark.notes}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
