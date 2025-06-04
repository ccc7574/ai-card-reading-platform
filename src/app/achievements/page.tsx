'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown, 
  Zap, 
  Target, 
  ArrowLeft,
  Lock,
  CheckCircle,
  Calendar,
  TrendingUp,
  BookOpen,
  Heart,
  Share2,
  Users,
  Flame
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'reading' | 'social' | 'creation' | 'exploration' | 'streak' | 'milestone'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  condition: {
    type: 'count' | 'streak' | 'time' | 'special'
    target: number
    current: number
  }
  isUnlocked: boolean
  unlockedAt?: string
  reward: {
    points: number
    badge?: string
    title?: string
  }
  progress: number // 0-100
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: '初来乍到',
    description: '完成第一次阅读',
    icon: '👋',
    category: 'reading',
    rarity: 'common',
    condition: { type: 'count', target: 1, current: 1 },
    isUnlocked: true,
    unlockedAt: '2024-01-15',
    reward: { points: 10, badge: '新手徽章' },
    progress: 100
  },
  {
    id: '2',
    title: '知识探索者',
    description: '阅读100篇文章',
    icon: '🔍',
    category: 'reading',
    rarity: 'rare',
    condition: { type: 'count', target: 100, current: 67 },
    isUnlocked: false,
    reward: { points: 100, badge: '探索者徽章' },
    progress: 67
  },
  {
    id: '3',
    title: '连续阅读达人',
    description: '连续阅读7天',
    icon: '🔥',
    category: 'streak',
    rarity: 'epic',
    condition: { type: 'streak', target: 7, current: 5 },
    isUnlocked: false,
    reward: { points: 200, badge: '坚持徽章', title: '阅读达人' },
    progress: 71
  },
  {
    id: '4',
    title: '社交达人',
    description: '获得50个点赞',
    icon: '❤️',
    category: 'social',
    rarity: 'rare',
    condition: { type: 'count', target: 50, current: 23 },
    isUnlocked: false,
    reward: { points: 150, badge: '人气徽章' },
    progress: 46
  },
  {
    id: '5',
    title: '内容创作者',
    description: '生成10张AI卡片',
    icon: '✨',
    category: 'creation',
    rarity: 'epic',
    condition: { type: 'count', target: 10, current: 3 },
    isUnlocked: false,
    reward: { points: 250, badge: '创作者徽章', title: '内容创作者' },
    progress: 30
  },
  {
    id: '6',
    title: '传奇收藏家',
    description: '收藏500篇内容',
    icon: '👑',
    category: 'milestone',
    rarity: 'legendary',
    condition: { type: 'count', target: 500, current: 89 },
    isUnlocked: false,
    reward: { points: 500, badge: '传奇徽章', title: '传奇收藏家' },
    progress: 18
  }
]

const categoryIcons = {
  reading: BookOpen,
  social: Heart,
  creation: Zap,
  exploration: Target,
  streak: Flame,
  milestone: Crown
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600'
}

const rarityBorders = {
  common: 'border-gray-300',
  rare: 'border-blue-300',
  epic: 'border-purple-300',
  legendary: 'border-yellow-300'
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [userStats, setUserStats] = useState({
    totalPoints: 360,
    unlockedCount: 1,
    totalCount: 6,
    currentLevel: 3,
    nextLevelPoints: 500
  })

  useEffect(() => {
    if (user) {
      loadAchievements()
    }
  }, [user])

  const loadAchievements = async () => {
    try {
      const response = await fetch(`/api/agents/achievements?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 使用Agent返回的成就数据
          console.log('Agent成就数据:', data.data)
        }
      }
    } catch (error) {
      console.error('加载成就失败:', error)
    }
  }

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity
    return matchesCategory && matchesRarity
  })

  const categories = [
    { id: 'all', name: '全部', icon: Trophy },
    { id: 'reading', name: '阅读', icon: BookOpen },
    { id: 'social', name: '社交', icon: Heart },
    { id: 'creation', name: '创作', icon: Zap },
    { id: 'exploration', name: '探索', icon: Target },
    { id: 'streak', name: '连续', icon: Flame },
    { id: 'milestone', name: '里程碑', icon: Crown }
  ]

  const rarities = [
    { id: 'all', name: '全部稀有度' },
    { id: 'common', name: '普通', color: 'text-gray-600' },
    { id: 'rare', name: '稀有', color: 'text-blue-600' },
    { id: 'epic', name: '史诗', color: 'text-purple-600' },
    { id: 'legendary', name: '传奇', color: 'text-yellow-600' }
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">您需要登录才能查看成就</p>
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
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">成就系统</h1>
                  <p className="text-sm text-gray-600">
                    {userStats.unlockedCount}/{userStats.totalCount} 个成就已解锁
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">总积分</div>
                <div className="text-lg font-bold text-yellow-600">{userStats.totalPoints}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">等级</div>
                <div className="text-lg font-bold text-blue-600">Lv.{userStats.currentLevel}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 用户统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">总积分</p>
                <p className="text-2xl font-bold">{userStats.totalPoints}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">当前等级</p>
                <p className="text-2xl font-bold">Lv.{userStats.currentLevel}</p>
              </div>
              <Medal className="w-8 h-8 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">已解锁</p>
                <p className="text-2xl font-bold">{userStats.unlockedCount}/{userStats.totalCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">下级还需</p>
                <p className="text-2xl font-bold">{userStats.nextLevelPoints - userStats.totalPoints}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </button>
              )
            })}
          </div>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {rarities.map((rarity) => (
              <option key={rarity.id} value={rarity.id}>
                {rarity.name}
              </option>
            ))}
          </select>
        </div>

        {/* 成就列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// 成就卡片组件
interface AchievementCardProps {
  achievement: Achievement
  index: number
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const CategoryIcon = categoryIcons[achievement.category]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-lg ${
        achievement.isUnlocked
          ? `${rarityBorders[achievement.rarity]} hover:scale-105`
          : 'border-gray-200 opacity-75'
      }`}
    >
      {/* 稀有度渐变背景 */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rarityColors[achievement.rarity]}`} />

      {/* 解锁状态指示器 */}
      {achievement.isUnlocked && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
      )}

      {!achievement.isUnlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
      )}

      <div className="p-6">
        {/* 成就图标和标题 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${
            achievement.isUnlocked
              ? `bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white`
              : 'bg-gray-100 text-gray-400'
          }`}>
            {achievement.isUnlocked ? achievement.icon : '🔒'}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <CategoryIcon className="w-4 h-4 text-gray-500" />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                achievement.rarity === 'common' ? 'bg-gray-100 text-gray-700' :
                achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {achievement.rarity === 'common' ? '普通' :
                 achievement.rarity === 'rare' ? '稀有' :
                 achievement.rarity === 'epic' ? '史诗' : '传奇'}
              </span>
            </div>

            <h3 className={`font-bold text-lg mb-1 ${
              achievement.isUnlocked ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {achievement.title}
            </h3>

            <p className={`text-sm ${
              achievement.isUnlocked ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {achievement.description}
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">
              进度: {achievement.condition.current}/{achievement.condition.target}
            </span>
            <span className="text-gray-600">{achievement.progress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                achievement.isUnlocked
                  ? `bg-gradient-to-r ${rarityColors[achievement.rarity]}`
                  : 'bg-gray-400'
              }`}
              style={{ width: `${achievement.progress}%` }}
            />
          </div>
        </div>

        {/* 奖励信息 */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  {achievement.reward.points} 积分
                </span>
              </div>

              {achievement.reward.badge && (
                <div className="flex items-center space-x-1">
                  <Medal className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {achievement.reward.badge}
                  </span>
                </div>
              )}
            </div>

            {achievement.reward.title && (
              <div className="text-xs text-purple-600 font-medium">
                +称号: {achievement.reward.title}
              </div>
            )}
          </div>

          {achievement.isUnlocked && achievement.unlockedAt && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              解锁于 {formatDate(achievement.unlockedAt)}
            </div>
          )}
        </div>

        {/* 特殊效果 */}
        {achievement.isUnlocked && achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
