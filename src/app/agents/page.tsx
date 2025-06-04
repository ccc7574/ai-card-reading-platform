'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Activity, Zap, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface AgentStatus {
  id: string
  name: string
  isRunning: boolean
  currentTask?: string
  capabilities: string[]
}

interface SystemStats {
  agents: {
    total: number
    running: number
  }
  workflows: {
    total: number
    completed: number
    running: number
    failed: number
  }
  tasks: {
    queued: number
    running: number
  }
}

export default function AgentDashboard() {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchAgentData = async () => {
    try {
      const response = await fetch('/api/agents?action=status')
      const result = await response.json()
      
      if (result.success) {
        setAgentStatuses(result.data.agents)
        setSystemStats(result.data.system)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('获取Agent数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgentData()
    
    // 每5秒自动刷新
    const interval = setInterval(fetchAgentData, 5000)
    return () => clearInterval(interval)
  }, [])

  const getAgentStatusColor = (agent: AgentStatus) => {
    if (agent.isRunning) {
      return agent.currentTask ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
    }
    return 'text-gray-600 bg-gray-100'
  }

  const getAgentStatusText = (agent: AgentStatus) => {
    if (agent.isRunning) {
      return agent.currentTask ? `执行中: ${agent.currentTask}` : '运行中'
    }
    return '空闲'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Agent监控仪表板</h1>
            </div>
            
            <Button onClick={fetchAgentData} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 系统概览 */}
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm font-medium text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Agent状态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {systemStats.agents.running}/{systemStats.agents.total}
                  </div>
                  <p className="text-sm text-gray-600">运行中/总数</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm font-medium text-gray-600">
                    <Zap className="w-4 h-4 mr-2" />
                    工作流
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {systemStats.workflows.running}
                  </div>
                  <p className="text-sm text-gray-600">正在执行</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm font-medium text-gray-600">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    完成率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {systemStats.workflows.total > 0 
                      ? Math.round((systemStats.workflows.completed / systemStats.workflows.total) * 100)
                      : 0}%
                  </div>
                  <p className="text-sm text-gray-600">工作流成功率</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm font-medium text-gray-600">
                    <Activity className="w-4 h-4 mr-2" />
                    任务队列
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {systemStats.tasks.queued + systemStats.tasks.running}
                  </div>
                  <p className="text-sm text-gray-600">待处理任务</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Agent详细状态 */}
          <Card className="bg-white shadow-sm mb-8">
            <CardHeader>
              <CardTitle>Agent详细状态</CardTitle>
              <p className="text-sm text-gray-600">
                最后更新: {lastUpdate.toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">加载中...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentStatuses.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            agent.isRunning ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <div>
                            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                            <p className="text-sm text-gray-600">ID: {agent.id}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            getAgentStatusColor(agent)
                          }`}>
                            {getAgentStatusText(agent)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">能力:</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.map((capability, capIndex) => (
                            <span
                              key={capIndex}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700"
                            >
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 系统信息 */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>系统架构</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">多Agent协作模式</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>内容抓取Agent</strong>: 负责网页内容获取和预处理</li>
                    <li>• <strong>内容分析Agent</strong>: 使用AI进行深度内容理解</li>
                    <li>• <strong>图像生成Agent</strong>: 创建概念图和简笔画</li>
                    <li>• <strong>知识关联Agent</strong>: 建立知识点之间的关联</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">工作流特性</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>智能协调</strong>: 自动任务分配和依赖管理</li>
                    <li>• <strong>并行处理</strong>: 多个Agent同时工作提升效率</li>
                    <li>• <strong>容错机制</strong>: 单个Agent失败不影响整体流程</li>
                    <li>• <strong>实时监控</strong>: 完整的状态跟踪和性能监控</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
