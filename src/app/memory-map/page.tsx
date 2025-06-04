'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, GitBranch, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface MemoryNode {
  id: string
  title: string
  summary: string
  x: number
  y: number
  category: 'article' | 'kol-opinion' | 'insight'
  connections: string[]
}

const memoryNodes: MemoryNode[] = [
  {
    id: '1',
    title: 'GPT-4多模态能力',
    summary: 'AI能够同时理解文本和图像',
    x: 400,
    y: 200,
    category: 'article',
    connections: ['2', '3']
  },
  {
    id: '2',
    title: 'AI Agent趋势',
    summary: '未来AI将成为自主决策的伙伴',
    x: 200,
    y: 350,
    category: 'kol-opinion',
    connections: ['1', '4']
  },
  {
    id: '3',
    title: '计算机视觉突破',
    summary: '机器视觉理解能力的飞跃',
    x: 600,
    y: 350,
    category: 'insight',
    connections: ['1', '5']
  },
  {
    id: '4',
    title: '自主AI系统',
    summary: '具备规划和执行能力的AI',
    x: 100,
    y: 500,
    category: 'article',
    connections: ['2']
  },
  {
    id: '5',
    title: '多模态应用',
    summary: '医疗、教育等领域的应用',
    x: 700,
    y: 500,
    category: 'insight',
    connections: ['3']
  }
]

export default function MemoryMapPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const categoryColors = {
    article: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    'kol-opinion': { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    insight: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' }
  }

  const categoryIcons = {
    article: '📄',
    'kol-opinion': '💭',
    insight: '💡'
  }

  const getConnectionPath = (from: MemoryNode, to: MemoryNode) => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // 控制点偏移，创建曲线效果
    const controlOffset = distance * 0.3
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    
    // 垂直于连线方向的控制点
    const controlX = midX - dy * controlOffset / distance
    const controlY = midY + dx * controlOffset / distance
    
    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <GitBranch className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">知识记忆地图</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                全览模式
              </Button>
            </div>
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
          {/* 说明区域 */}
          <Card className="mb-8 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="w-5 h-5 mr-2 text-blue-600" />
                知识关联图谱
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                通过可视化的方式展示AI知识卡片之间的关联关系，帮助您建立系统性的知识体系。
                点击节点查看详细内容，连线表示知识点之间的关联强度。
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                  <span>文章</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></div>
                  <span>KOL观点</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span>洞察</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 记忆地图可视化 */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-0">
              <div className="relative w-full h-[600px] overflow-hidden">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  className="absolute inset-0"
                >
                  {/* 连接线 */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#94a3b8"
                      />
                    </marker>
                  </defs>
                  
                  {memoryNodes.map(node => 
                    node.connections.map(connectionId => {
                      const targetNode = memoryNodes.find(n => n.id === connectionId)
                      if (!targetNode) return null
                      
                      const isHighlighted = hoveredNode === node.id || hoveredNode === connectionId
                      
                      return (
                        <motion.path
                          key={`${node.id}-${connectionId}`}
                          d={getConnectionPath(node, targetNode)}
                          stroke={isHighlighted ? "#3b82f6" : "#94a3b8"}
                          strokeWidth={isHighlighted ? 3 : 2}
                          fill="none"
                          markerEnd="url(#arrowhead)"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="transition-all duration-300"
                        />
                      )
                    })
                  )}
                  
                  {/* 节点 */}
                  {memoryNodes.map((node, index) => {
                    const colors = categoryColors[node.category]
                    const isSelected = selectedNode === node.id
                    const isHovered = hoveredNode === node.id
                    
                    return (
                      <motion.g
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                      >
                        {/* 节点背景 */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isSelected || isHovered ? 45 : 40}
                          className={`${colors.bg} ${colors.border} transition-all duration-300`}
                          stroke={isSelected ? "#3b82f6" : undefined}
                          strokeWidth={isSelected ? 3 : 1}
                        />
                        
                        {/* 节点图标 */}
                        <text
                          x={node.x}
                          y={node.y - 5}
                          textAnchor="middle"
                          fontSize="20"
                        >
                          {categoryIcons[node.category]}
                        </text>
                        
                        {/* 节点标题 */}
                        <text
                          x={node.x}
                          y={node.y + 15}
                          textAnchor="middle"
                          fontSize="10"
                          className={colors.text}
                          fontWeight="600"
                        >
                          {node.title.length > 8 ? node.title.slice(0, 8) + '...' : node.title}
                        </text>
                        
                        {/* 悬停时显示完整信息 */}
                        {isHovered && (
                          <motion.g
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <rect
                              x={node.x - 80}
                              y={node.y - 80}
                              width="160"
                              height="60"
                              rx="8"
                              fill="white"
                              stroke="#e5e7eb"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <text
                              x={node.x}
                              y={node.y - 60}
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="600"
                              className="fill-gray-900"
                            >
                              {node.title}
                            </text>
                            <text
                              x={node.x}
                              y={node.y - 45}
                              textAnchor="middle"
                              fontSize="10"
                              className="fill-gray-600"
                            >
                              {node.summary}
                            </text>
                          </motion.g>
                        )}
                      </motion.g>
                    )
                  })}
                </svg>
                
                {/* 选中节点的详细信息 */}
                {selectedNode && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-4 right-4 w-80"
                  >
                    <Card className="bg-white shadow-xl border-2 border-blue-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {memoryNodes.find(n => n.id === selectedNode)?.title}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedNode(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          {memoryNodes.find(n => n.id === selectedNode)?.summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            关联节点: {memoryNodes.find(n => n.id === selectedNode)?.connections.length}
                          </span>
                          <Button size="sm" variant="outline">
                            <Zap className="w-4 h-4 mr-2" />
                            查看详情
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
