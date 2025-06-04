'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  User,
  Settings,
  Heart,
  Bookmark,
  Eye,
  Share2,
  Calendar,
  Trophy,
  Target,
  Zap,
  Edit3,
  Camera,
  Bell,
  Shield,
  Palette,
  Download,
  Upload,
  Star,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  joinDate: string
  stats: {
    totalViews: number
    totalLikes: number
    totalBookmarks: number
    totalShares: number
    readingStreak: number
    favoriteCategories: string[]
  }
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    unlockedAt: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>
  preferences: {
    theme: string
    notifications: {
      email: boolean
      push: boolean
      weekly: boolean
    }
    privacy: {
      profilePublic: boolean
      showStats: boolean
      showActivity: boolean
    }
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'settings'>('overview')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProfile: UserProfile = {
        id: '1',
        name: user?.user_metadata?.full_name || '智能用户',
        email: user?.email || 'user@example.com',
        avatar: user?.user_metadata?.avatar_url || '👤',
        bio: '热爱学习新技术，专注于AI和产品设计领域的知识分享者。',
        joinDate: '2024-01-15',
        stats: {
          totalViews: 12847,
          totalLikes: 2156,
          totalBookmarks: 1432,
          totalShares: 876,
          readingStreak: 15,
          favoriteCategories: ['AI技术', '产品设计', '商业洞察']
        },
        achievements: [
          {
            id: '1',
            title: '知识探索者',
            description: '累计阅读100篇文章',
            icon: '📚',
            unlockedAt: '2024-02-01',
            rarity: 'common'
          },
          {
            id: '2',
            title: '分享达人',
            description: '分享内容被点赞超过1000次',
            icon: '🌟',
            unlockedAt: '2024-02-15',
            rarity: 'rare'
          },
          {
            id: '3',
            title: '连续阅读王',
            description: '连续阅读15天',
            icon: '🔥',
            unlockedAt: '2024-03-01',
            rarity: 'epic'
          },
          {
            id: '4',
            title: 'AI专家',
            description: '在AI技术分类中获得专家认证',
            icon: '🤖',
            unlockedAt: '2024-03-10',
            rarity: 'legendary'
          }
        ],
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            weekly: false
          },
          privacy: {
            profilePublic: true,
            showStats: true,
            showActivity: false
          }
        }
      }
      
      setProfile(mockProfile)
    } catch (error) {
      console.error('Failed to load user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue',
    suffix = ''
  }: {
    title: string
    value: string | number
    icon: any
    color?: string
    suffix?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  )

  const AchievementBadge = ({ achievement }: { achievement: UserProfile['achievements'][0] }) => {
    const rarityColors = {
      common: 'bg-gray-100 text-gray-700 border-gray-200',
      rare: 'bg-blue-100 text-blue-700 border-blue-200',
      epic: 'bg-purple-100 text-purple-700 border-purple-200',
      legendary: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-4 rounded-xl border-2 ${rarityColors[achievement.rarity]}`}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">{achievement.icon}</div>
          <h3 className="font-semibold text-sm">{achievement.title}</h3>
          <p className="text-xs mt-1 opacity-80">{achievement.description}</p>
          <p className="text-xs mt-2 opacity-60">
            {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">无法加载用户信息</h3>
          <p className="text-gray-600">请稍后重试</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
                <p className="text-gray-600">管理您的个人信息和偏好设置</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? '保存' : '编辑'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* 用户信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                {profile.avatar}
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 p-2 bg-white text-gray-600 rounded-full shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
              <p className="text-blue-100 mb-3">{profile.email}</p>
              <p className="text-white/90 mb-4">{profile.bio}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  加入于 {new Date(profile.joinDate).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  连续阅读 {profile.stats.readingStreak} 天
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 标签页导航 */}
        <div className="flex items-center space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          {[
            { key: 'overview', label: '概览', icon: User },
            { key: 'stats', label: '统计', icon: TrendingUp },
            { key: 'achievements', label: '成就', icon: Trophy },
            { key: 'settings', label: '设置', icon: Settings }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* 标签页内容 */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="总浏览量"
                  value={profile.stats.totalViews}
                  icon={Eye}
                  color="blue"
                />
                <StatCard
                  title="获得点赞"
                  value={profile.stats.totalLikes}
                  icon={Heart}
                  color="red"
                />
                <StatCard
                  title="收藏内容"
                  value={profile.stats.totalBookmarks}
                  icon={Bookmark}
                  color="yellow"
                />
                <StatCard
                  title="分享次数"
                  value={profile.stats.totalShares}
                  icon={Share2}
                  color="green"
                />
              </div>

              {/* 喜欢的分类 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">喜欢的分类</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.stats.favoriteCategories.map((category) => (
                    <span
                      key={category}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">我的成就</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {profile.achievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 通知设置 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">邮件通知</p>
                        <p className="text-sm text-gray-600">接收重要更新的邮件通知</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.preferences.notifications.email}
                        className="sr-only peer"
                        onChange={() => {}}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 隐私设置 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">隐私设置</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">公开个人资料</p>
                        <p className="text-sm text-gray-600">允许其他用户查看您的个人资料</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.preferences.privacy.profilePublic}
                        className="sr-only peer"
                        onChange={() => {}}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
