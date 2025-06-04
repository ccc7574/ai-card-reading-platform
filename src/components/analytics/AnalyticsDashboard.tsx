'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Bookmark, 
  Share2, 
  Clock,
  Calendar,
  Target,
  Zap
} from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  totalLikes: number
  totalBookmarks: number
  totalShares: number
  activeUsers: number
  avgReadingTime: number
  topCategories: Array<{ name: string; count: number; percentage: number }>
  dailyStats: Array<{ date: string; views: number; interactions: number }>
  userEngagement: {
    bounceRate: number
    avgSessionTime: number
    returnVisitors: number
  }
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟数据
      const mockData: AnalyticsData = {
        totalViews: 12847,
        totalLikes: 2156,
        totalBookmarks: 1432,
        totalShares: 876,
        activeUsers: 3421,
        avgReadingTime: 4.2,
        topCategories: [
          { name: 'AI技术', count: 1234, percentage: 35 },
          { name: '产品设计', count: 987, percentage: 28 },
          { name: '商业洞察', count: 765, percentage: 22 },
          { name: '开发技术', count: 543, percentage: 15 }
        ],
        dailyStats: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          views: Math.floor(Math.random() * 500) + 200,
          interactions: Math.floor(Math.random() * 100) + 50
        })),
        userEngagement: {
          bounceRate: 32.5,
          avgSessionTime: 8.7,
          returnVisitors: 68.3
        }
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string
    value: string | number
    change?: string
    icon: any
    color?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {change} vs 上期
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">数据分析</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">无法加载数据</h3>
        <p className="text-gray-600">请稍后重试</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">数据分析</h2>
          <p className="text-gray-600 mt-1">平台使用情况和用户行为分析</p>
        </div>
        
        {/* 时间范围选择 */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: '7d', label: '7天' },
            { key: '30d', label: '30天' },
            { key: '90d', label: '90天' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总浏览量"
          value={analyticsData.totalViews.toLocaleString()}
          change="+12.5%"
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="总点赞数"
          value={analyticsData.totalLikes.toLocaleString()}
          change="+8.3%"
          icon={Heart}
          color="red"
        />
        <StatCard
          title="总收藏数"
          value={analyticsData.totalBookmarks.toLocaleString()}
          change="+15.7%"
          icon={Bookmark}
          color="yellow"
        />
        <StatCard
          title="总分享数"
          value={analyticsData.totalShares.toLocaleString()}
          change="+6.2%"
          icon={Share2}
          color="green"
        />
      </div>

      {/* 用户指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="活跃用户"
          value={analyticsData.activeUsers.toLocaleString()}
          change="+18.9%"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="平均阅读时间"
          value={`${analyticsData.avgReadingTime}分钟`}
          change="+0.8分钟"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="跳出率"
          value={`${analyticsData.userEngagement.bounceRate}%`}
          change="-2.1%"
          icon={Target}
          color="orange"
        />
        <StatCard
          title="回访率"
          value={`${analyticsData.userEngagement.returnVisitors}%`}
          change="+5.4%"
          icon={Zap}
          color="teal"
        />
      </div>

      {/* 分类统计 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">热门分类</h3>
        <div className="space-y-4">
          {analyticsData.topCategories.map((category, index) => (
            <div key={category.name} className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {category.count} ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">浏览趋势</h3>
        <div className="h-64 flex items-end space-x-1">
          {analyticsData.dailyStats.slice(-14).map((stat, index) => (
            <motion.div
              key={stat.date}
              className="flex-1 bg-blue-500 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(stat.views / 700) * 100}%` }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              title={`${stat.date}: ${stat.views} 浏览`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>14天前</span>
          <span>今天</span>
        </div>
      </div>

      {/* 实时活动 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">实时活动</h3>
        <div className="space-y-3">
          {[
            { action: '用户查看了', content: 'AI技术趋势分析', time: '刚刚' },
            { action: '用户点赞了', content: '产品设计最佳实践', time: '2分钟前' },
            { action: '用户收藏了', content: '商业模式创新案例', time: '5分钟前' },
            { action: '用户分享了', content: '前端开发技术栈', time: '8分钟前' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {activity.action}
                  <span className="font-medium">「{activity.content}」</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
