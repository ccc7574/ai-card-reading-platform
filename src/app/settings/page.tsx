'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Heart,
  BookOpen,
  Zap,
  Save,
  ArrowLeft,
  Check,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserSettings {
  profile: {
    displayName: string
    bio: string
    avatar: string
    publicProfile: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    defaultView: 'cards' | 'list' | 'grid'
    cardsPerPage: number
    autoRefresh: boolean
    showTrending: boolean
  }
  notifications: {
    email: boolean
    push: boolean
    newContent: boolean
    achievements: boolean
    comments: boolean
    likes: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profilePublic: boolean
    showStats: boolean
    showActivity: boolean
    allowRecommendations: boolean
    dataCollection: boolean
  }
  content: {
    preferredCategories: string[]
    preferredDifficulty: string[]
    preferredReadingTime: number
    hideNSFW: boolean
    autoBookmark: boolean
  }
}

const defaultSettings: UserSettings = {
  profile: {
    displayName: '',
    bio: '',
    avatar: '',
    publicProfile: true
  },
  preferences: {
    theme: 'auto',
    language: 'zh-CN',
    defaultView: 'cards',
    cardsPerPage: 12,
    autoRefresh: true,
    showTrending: true
  },
  notifications: {
    email: true,
    push: false,
    newContent: true,
    achievements: true,
    comments: true,
    likes: false,
    weeklyDigest: true
  },
  privacy: {
    profilePublic: true,
    showStats: true,
    showActivity: false,
    allowRecommendations: true,
    dataCollection: true
  },
  content: {
    preferredCategories: [],
    preferredDifficulty: ['beginner', 'intermediate'],
    preferredReadingTime: 5,
    hideNSFW: true,
    autoBookmark: false
  }
}

const categories = [
  'AI技术', '产品设计', '商业洞察', '编程开发', '数据科学',
  '用户体验', '创业投资', '市场营销', '项目管理', '行业趋势'
]

const difficulties = [
  { value: 'beginner', label: '入门级' },
  { value: 'intermediate', label: '中级' },
  { value: 'advanced', label: '高级' },
  { value: 'expert', label: '专家级' }
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (user) {
      // 加载用户设置
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data.settings })
      }
    } catch (error) {
      console.error('加载用户设置失败:', error)
    }
  }

  const saveSettings = async () => {
    if (!user) return

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('保存设置失败:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const toggleArrayValue = (section: keyof UserSettings, key: string, value: string) => {
    setSettings(prev => {
      const currentArray = (prev[section] as any)[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: newArray
        }
      }
    })
  }

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'preferences', label: '偏好设置', icon: Settings },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'privacy', label: '隐私设置', icon: Shield },
    { id: 'content', label: '内容偏好', icon: BookOpen }
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">您需要登录才能访问设置页面</p>
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">设置</h1>
                <p className="text-sm text-gray-600">个性化您的使用体验</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {saveStatus === 'saved' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center text-green-600 text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  已保存
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center text-red-600 text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  保存失败
                </motion.div>
              )}
              <Button 
                onClick={saveSettings}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? '保存中...' : '保存设置'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏 */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {/* 这里会根据activeTab渲染不同的设置面板 */}
              {activeTab === 'profile' && (
                <ProfileSettings 
                  settings={settings.profile}
                  onChange={(key, value) => updateSettings('profile', key, value)}
                />
              )}
              {activeTab === 'preferences' && (
                <PreferencesSettings 
                  settings={settings.preferences}
                  onChange={(key, value) => updateSettings('preferences', key, value)}
                />
              )}
              {activeTab === 'notifications' && (
                <NotificationSettings 
                  settings={settings.notifications}
                  onChange={(key, value) => updateSettings('notifications', key, value)}
                />
              )}
              {activeTab === 'privacy' && (
                <PrivacySettings 
                  settings={settings.privacy}
                  onChange={(key, value) => updateSettings('privacy', key, value)}
                />
              )}
              {activeTab === 'content' && (
                <ContentSettings 
                  settings={settings.content}
                  categories={categories}
                  difficulties={difficulties}
                  onChange={(key, value) => updateSettings('content', key, value)}
                  onToggleArray={(key, value) => toggleArrayValue('content', key, value)}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 个人资料设置组件
function ProfileSettings({ settings, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">个人资料</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              显示名称
            </label>
            <input
              type="text"
              value={settings.displayName}
              onChange={(e) => onChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入您的显示名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              个人简介
            </label>
            <textarea
              value={settings.bio}
              onChange={(e) => onChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="介绍一下您自己..."
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="publicProfile"
              checked={settings.publicProfile}
              onChange={(e) => onChange('publicProfile', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="publicProfile" className="ml-2 text-sm text-gray-700">
              公开个人资料
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// 偏好设置组件
function PreferencesSettings({ settings, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">偏好设置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主题
            </label>
            <select
              value={settings.theme}
              onChange={(e) => onChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认视图
            </label>
            <select
              value={settings.defaultView}
              onChange={(e) => onChange('defaultView', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cards">卡片视图</option>
              <option value="list">列表视图</option>
              <option value="grid">网格视图</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              每页卡片数量: {settings.cardsPerPage}
            </label>
            <input
              type="range"
              min="6"
              max="24"
              step="6"
              value={settings.cardsPerPage}
              onChange={(e) => onChange('cardsPerPage', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={settings.autoRefresh}
                onChange={(e) => onChange('autoRefresh', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-700">
                自动刷新内容
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showTrending"
                checked={settings.showTrending}
                onChange={(e) => onChange('showTrending', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showTrending" className="ml-2 text-sm text-gray-700">
                显示热门趋势
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 通知设置组件
function NotificationSettings({ settings, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h3>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">邮件通知</label>
                <p className="text-xs text-gray-500">接收重要更新的邮件通知</p>
              </div>
              <input
                type="checkbox"
                checked={settings.email}
                onChange={(e) => onChange('email', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">推送通知</label>
                <p className="text-xs text-gray-500">浏览器推送通知</p>
              </div>
              <input
                type="checkbox"
                checked={settings.push}
                onChange={(e) => onChange('push', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">新内容通知</label>
                <p className="text-xs text-gray-500">有新内容时通知我</p>
              </div>
              <input
                type="checkbox"
                checked={settings.newContent}
                onChange={(e) => onChange('newContent', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">成就通知</label>
                <p className="text-xs text-gray-500">获得新成就时通知我</p>
              </div>
              <input
                type="checkbox"
                checked={settings.achievements}
                onChange={(e) => onChange('achievements', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">评论通知</label>
                <p className="text-xs text-gray-500">有人评论我的内容时通知我</p>
              </div>
              <input
                type="checkbox"
                checked={settings.comments}
                onChange={(e) => onChange('comments', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">点赞通知</label>
                <p className="text-xs text-gray-500">有人点赞我的内容时通知我</p>
              </div>
              <input
                type="checkbox"
                checked={settings.likes}
                onChange={(e) => onChange('likes', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">周报</label>
                <p className="text-xs text-gray-500">每周发送活动摘要</p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyDigest}
                onChange={(e) => onChange('weeklyDigest', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 隐私设置组件
function PrivacySettings({ settings, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">隐私设置</h3>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">公开个人资料</label>
                <p className="text-xs text-gray-500">其他用户可以查看您的个人资料</p>
              </div>
              <input
                type="checkbox"
                checked={settings.profilePublic}
                onChange={(e) => onChange('profilePublic', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">显示统计数据</label>
                <p className="text-xs text-gray-500">在个人资料中显示阅读统计</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showStats}
                onChange={(e) => onChange('showStats', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">显示活动记录</label>
                <p className="text-xs text-gray-500">其他用户可以看到您的最近活动</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showActivity}
                onChange={(e) => onChange('showActivity', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">允许个性化推荐</label>
                <p className="text-xs text-gray-500">基于您的行为提供个性化内容推荐</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowRecommendations}
                onChange={(e) => onChange('allowRecommendations', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">数据收集</label>
                <p className="text-xs text-gray-500">允许收集匿名使用数据以改进服务</p>
              </div>
              <input
                type="checkbox"
                checked={settings.dataCollection}
                onChange={(e) => onChange('dataCollection', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 内容偏好设置组件
function ContentSettings({ settings, categories, difficulties, onChange, onToggleArray }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">内容偏好</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              偏好分类
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category: string) => (
                <button
                  key={category}
                  onClick={() => onToggleArray('preferredCategories', category)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    settings.preferredCategories.includes(category)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              偏好难度
            </label>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map((difficulty: any) => (
                <button
                  key={difficulty.value}
                  onClick={() => onToggleArray('preferredDifficulty', difficulty.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    settings.preferredDifficulty.includes(difficulty.value)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {difficulty.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              偏好阅读时间: {settings.preferredReadingTime} 分钟
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={settings.preferredReadingTime}
              onChange={(e) => onChange('preferredReadingTime', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1分钟</span>
              <span>30分钟</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hideNSFW"
                checked={settings.hideNSFW}
                onChange={(e) => onChange('hideNSFW', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hideNSFW" className="ml-2 text-sm text-gray-700">
                隐藏敏感内容
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoBookmark"
                checked={settings.autoBookmark}
                onChange={(e) => onChange('autoBookmark', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoBookmark" className="ml-2 text-sm text-gray-700">
                自动收藏喜欢的内容
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
