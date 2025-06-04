'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

interface AnalyticsMetrics {
  overview: {
    totalUsers: number
    totalViews: number
    totalInteractions: number
    avgSessionTime: number
    growthRate: number
  }
  userBehavior: {
    topPages: Array<{ page: string; views: number; percentage: number }>
    deviceTypes: Array<{ type: string; count: number; percentage: number }>
    trafficSources: Array<{ source: string; visitors: number; percentage: number }>
  }
  contentPerformance: {
    topCategories: Array<{ category: string; engagement: number; growth: number }>
    popularContent: Array<{ title: string; views: number; likes: number; shares: number }>
  }
  timeAnalysis: {
    hourlyActivity: Array<{ hour: number; activity: number }>
    weeklyTrends: Array<{ day: string; users: number; engagement: number }>
  }
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedView, setSelectedView] = useState<'overview' | 'users' | 'content' | 'performance'>('overview')

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockMetrics: AnalyticsMetrics = {
        overview: {
          totalUsers: 15847,
          totalViews: 89234,
          totalInteractions: 23456,
          avgSessionTime: 8.7,
          growthRate: 23.5
        },
        userBehavior: {
          topPages: [
            { page: '首页', views: 34567, percentage: 38.7 },
            { page: 'AI技术', views: 23456, percentage: 26.3 },
            { page: '产品设计', views: 18234, percentage: 20.4 },
            { page: '商业洞察', views: 12987, percentage: 14.6 }
          ],
          deviceTypes: [
            { type: '桌面端', count: 9876, percentage: 62.3 },
            { type: '移动端', count: 4567, percentage: 28.8 },
            { type: '平板', count: 1404, percentage: 8.9 }
          ],
          trafficSources: [
            { source: '直接访问', visitors: 6789, percentage: 42.8 },
            { source: '搜索引擎', visitors: 4567, percentage: 28.8 },
            { source: '社交媒体', visitors: 2890, percentage: 18.2 },
            { source: '推荐链接', visitors: 1601, percentage: 10.1 }
          ]
        },
        contentPerformance: {
          topCategories: [
            { category: 'AI技术', engagement: 87.5, growth: 15.3 },
            { category: '产品设计', engagement: 82.1, growth: 12.7 },
            { category: '商业洞察', engagement: 78.9, growth: 8.9 },
            { category: '开发技术', engagement: 75.2, growth: 6.4 }
          ],
          popularContent: [
            { title: 'AI驱动的代码生成工具革命', views: 5678, likes: 234, shares: 89 },
            { title: '2024年产品设计趋势预测', views: 4567, likes: 198, shares: 76 },
            { title: '商业模式创新的五个关键要素', views: 3456, likes: 167, shares: 54 },
            { title: '前端开发的未来发展方向', views: 2890, likes: 134, shares: 43 }
          ]
        },
        timeAnalysis: {
          hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            activity: Math.floor(Math.random() * 100) + 20
          })),
          weeklyTrends: [
            { day: '周一', users: 2345, engagement: 78.5 },
            { day: '周二', users: 2567, engagement: 82.1 },
            { day: '周三', users: 2890, engagement: 85.7 },
            { day: '周四', users: 2678, engagement: 83.2 },
            { day: '周五', users: 2456, engagement: 79.8 },
            { day: '周六', users: 1987, engagement: 72.4 },
            { day: '周日', users: 1876, engagement: 69.3 }
          ]
        }
      }
      
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    suffix = ''
  }: {
    title: string
    value: string | number
    change?: string
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
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change} vs 上期
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl bg-${color}-100`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">无法加载数据</h3>
          <p className="text-gray-600">请稍后重试</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">数据分析中心</h1>
                <p className="text-gray-600">深入了解平台使用情况和用户行为</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4" />
                <span>导出报告</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto p-6">
        {/* 核心指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="总用户数"
            value={metrics.overview.totalUsers}
            change="+23.5%"
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="总浏览量"
            value={metrics.overview.totalViews}
            change="+18.2%"
            icon={Eye}
            color="green"
          />
          <MetricCard
            title="总互动数"
            value={metrics.overview.totalInteractions}
            change="+15.7%"
            icon={Heart}
            color="red"
          />
          <MetricCard
            title="平均会话时长"
            value={metrics.overview.avgSessionTime}
            change="+2.3分钟"
            icon={Clock}
            color="purple"
            suffix="分钟"
          />
        </div>

        {/* 详细分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 用户行为分析 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">用户行为分析</h3>
            
            {/* 热门页面 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">热门页面</h4>
              <div className="space-y-3">
                {metrics.userBehavior.topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {page.page}
                        </span>
                        <span className="text-sm text-gray-600">
                          {page.views.toLocaleString()} ({page.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-blue-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${page.percentage}%` }}
                          transition={{ delay: index * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 设备类型 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">设备类型分布</h4>
              <div className="grid grid-cols-3 gap-4">
                {metrics.userBehavior.deviceTypes.map((device) => (
                  <div key={device.type} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {device.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">{device.type}</div>
                    <div className="text-xs text-gray-500">
                      {device.count.toLocaleString()} 用户
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 内容表现 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">内容表现</h3>
            
            {/* 热门分类 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">分类参与度</h4>
              <div className="space-y-3">
                {metrics.contentPerformance.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {category.category}
                        </span>
                        <span className="text-sm text-gray-600">
                          {category.engagement}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${category.engagement}%` }}
                          transition={{ delay: index * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                    <div className={`ml-3 text-xs px-2 py-1 rounded ${
                      category.growth > 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      +{category.growth}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 热门内容 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">热门内容</h4>
              <div className="space-y-3">
                {metrics.contentPerformance.popularContent.map((content, index) => (
                  <div key={content.title} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                      {content.title}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {content.views.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {content.likes}
                      </span>
                      <span className="flex items-center">
                        <Share2 className="w-3 h-3 mr-1" />
                        {content.shares}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 嵌入原有的分析仪表板 */}
        <div className="mt-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  )
}
