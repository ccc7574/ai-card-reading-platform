'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Zap, Clock, Database, Wifi, AlertTriangle } from 'lucide-react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  apiResponseTime: number
  memoryUsage: number
  networkSpeed: number
  errorRate: number
  userSatisfaction: number
}

interface PerformanceAlert {
  id: string
  type: 'warning' | 'error'
  message: string
  timestamp: Date
  resolved: boolean
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 只在开发环境显示
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
      startMonitoring()
    }
  }, [])

  const startMonitoring = () => {
    // 初始化性能监控
    measurePerformance()
    
    // 定期更新指标
    const interval = setInterval(measurePerformance, 5000)
    
    return () => clearInterval(interval)
  }

  const measurePerformance = () => {
    // 获取页面加载性能
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0

    // 获取内存使用情况
    const memory = (performance as any).memory
    const memoryUsage = memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0

    // 模拟其他指标
    const newMetrics: PerformanceMetrics = {
      loadTime: Math.round(loadTime),
      renderTime: Math.round(Math.random() * 100 + 50),
      apiResponseTime: Math.round(Math.random() * 200 + 100),
      memoryUsage: Math.round(memoryUsage),
      networkSpeed: Math.round(Math.random() * 50 + 50),
      errorRate: Math.round(Math.random() * 5),
      userSatisfaction: Math.round(Math.random() * 20 + 80)
    }

    setMetrics(newMetrics)

    // 检查性能警告
    checkPerformanceAlerts(newMetrics)
  }

  const checkPerformanceAlerts = (metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = []

    if (metrics.loadTime > 3000) {
      newAlerts.push({
        id: 'load-time-' + Date.now(),
        type: 'warning',
        message: `页面加载时间过长: ${metrics.loadTime}ms`,
        timestamp: new Date(),
        resolved: false
      })
    }

    if (metrics.memoryUsage > 80) {
      newAlerts.push({
        id: 'memory-' + Date.now(),
        type: 'error',
        message: `内存使用率过高: ${metrics.memoryUsage}%`,
        timestamp: new Date(),
        resolved: false
      })
    }

    if (metrics.apiResponseTime > 1000) {
      newAlerts.push({
        id: 'api-' + Date.now(),
        type: 'warning',
        message: `API响应时间过长: ${metrics.apiResponseTime}ms`,
        timestamp: new Date(),
        resolved: false
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 4)])
    }
  }

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMetricBgColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100'
    if (value <= thresholds.warning) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (!isVisible || !metrics) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">性能监控</h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* 性能指标 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={`p-2 rounded ${getMetricBgColor(metrics.loadTime, { good: 1000, warning: 2000 })}`}>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-medium">加载时间</span>
            </div>
            <p className={`text-sm font-bold ${getMetricColor(metrics.loadTime, { good: 1000, warning: 2000 })}`}>
              {metrics.loadTime}ms
            </p>
          </div>

          <div className={`p-2 rounded ${getMetricBgColor(metrics.memoryUsage, { good: 50, warning: 75 })}`}>
            <div className="flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span className="text-xs font-medium">内存使用</span>
            </div>
            <p className={`text-sm font-bold ${getMetricColor(metrics.memoryUsage, { good: 50, warning: 75 })}`}>
              {metrics.memoryUsage}%
            </p>
          </div>

          <div className={`p-2 rounded ${getMetricBgColor(metrics.apiResponseTime, { good: 300, warning: 600 })}`}>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">API响应</span>
            </div>
            <p className={`text-sm font-bold ${getMetricColor(metrics.apiResponseTime, { good: 300, warning: 600 })}`}>
              {metrics.apiResponseTime}ms
            </p>
          </div>

          <div className={`p-2 rounded ${getMetricBgColor(100 - metrics.networkSpeed, { good: 30, warning: 60 })}`}>
            <div className="flex items-center space-x-1">
              <Wifi className="w-3 h-3" />
              <span className="text-xs font-medium">网络速度</span>
            </div>
            <p className={`text-sm font-bold ${getMetricColor(100 - metrics.networkSpeed, { good: 30, warning: 60 })}`}>
              {metrics.networkSpeed}%
            </p>
          </div>
        </div>

        {/* 用户满意度 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>用户满意度</span>
            <span>{metrics.userSatisfaction}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.userSatisfaction}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* 性能警告 */}
        {alerts.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <AlertTriangle className="w-3 h-3" />
              <span>性能警告</span>
            </div>
            {alerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded text-xs ${
                  alert.type === 'error' 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* 性能评分 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">性能评分</span>
            <span className={`text-sm font-bold ${
              metrics.userSatisfaction >= 90 ? 'text-green-600' :
              metrics.userSatisfaction >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.userSatisfaction >= 90 ? 'A' :
               metrics.userSatisfaction >= 70 ? 'B' : 'C'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
