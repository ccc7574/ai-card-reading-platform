'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface TestResult {
  success: boolean
  result?: any
  error?: string
}

export default function TestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const runTest = async (testType: string, url?: string) => {
    setLoading(prev => ({ ...prev, [testType]: true }))
    
    try {
      const testUrl = url 
        ? `/api/test?type=${testType}&url=${encodeURIComponent(url)}`
        : `/api/test?type=${testType}`
      
      const response = await fetch(testUrl)
      const result = await response.json()
      
      setResults(prev => ({
        ...prev,
        [testType]: { success: response.ok, result }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testType]: { 
          success: false, 
          error: error instanceof Error ? error.message : '测试失败' 
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [testType]: false }))
    }
  }

  const runAgentTest = async () => {
    setLoading(prev => ({ ...prev, agents: true }))

    try {
      const response = await fetch('/api/agents?action=health')
      const result = await response.json()

      setResults(prev => ({
        ...prev,
        agents: { success: response.ok, result }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        agents: {
          success: false,
          error: error instanceof Error ? error.message : 'Agent系统测试失败'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, agents: false }))
    }
  }

  const testCases = [
    {
      id: 'health',
      title: '健康检查',
      description: '检查API服务状态和环境配置',
      action: () => runTest('health')
    },
    {
      id: 'scraper',
      title: '内容抓取测试',
      description: '测试网页内容抓取功能',
      action: () => runTest('scraper', 'https://httpbin.org/html')
    },
    {
      id: 'openai',
      title: 'OpenAI集成测试',
      description: '测试OpenAI GPT-4内容分析',
      action: () => runTest('openai')
    },
    {
      id: 'gemini',
      title: 'Gemini 2.0图片生成测试',
      description: '测试Gemini 2.0 Flash图片生成功能',
      action: () => runTest('gemini')
    },
    {
      id: 'imagen',
      title: 'Imagen 3图片生成测试',
      description: '测试Imagen 3高质量图片生成',
      action: () => runTest('imagen')
    },
    {
      id: 'agents',
      title: '多Agent系统测试',
      description: '测试多Agent协调和工作流执行',
      action: () => runAgentTest()
    }
  ]

  const getStatusIcon = (testId: string) => {
    if (loading[testId]) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
    }
    
    const result = results[testId]
    if (!result) {
      return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
    
    return result.success 
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />
  }

  const runAllTests = async () => {
    for (const testCase of testCases) {
      await testCase.action()
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            
            <h1 className="text-xl font-bold text-gray-900">AI服务测试</h1>
            
            <Button onClick={runAllTests} disabled={Object.values(loading).some(Boolean)}>
              <Play className="w-4 h-4 mr-2" />
              运行所有测试
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 说明 */}
          <Card className="mb-8 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>测试说明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                此页面用于测试AI服务集成的各个组件。请确保已正确配置环境变量中的API密钥。
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>注意：</strong> OpenAI和Gemini测试需要有效的API密钥。如果没有配置，相关测试会失败。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 测试用例 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testCases.map((testCase, index) => (
              <motion.div
                key={testCase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{testCase.title}</CardTitle>
                      {getStatusIcon(testCase.id)}
                    </div>
                    <p className="text-sm text-gray-600">{testCase.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <Button
                      onClick={testCase.action}
                      disabled={loading[testCase.id]}
                      className="w-full mb-4"
                      variant="outline"
                    >
                      {loading[testCase.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          测试中...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          运行测试
                        </>
                      )}
                    </Button>
                    
                    {/* 测试结果 */}
                    {results[testCase.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className={`p-3 rounded-lg text-sm ${
                          results[testCase.id].success
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        {results[testCase.id].success ? (
                          <div>
                            <p className="text-green-800 font-medium mb-2">✅ 测试通过</p>
                            <pre className="text-green-700 text-xs overflow-auto">
                              {JSON.stringify(results[testCase.id].result, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div>
                            <p className="text-red-800 font-medium mb-2">❌ 测试失败</p>
                            <p className="text-red-700 text-xs">
                              {results[testCase.id].error || '未知错误'}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 配置提示 */}
          <Card className="mt-8 bg-blue-50 border border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">配置提示</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-blue-800 text-sm space-y-2">
                <p>如果测试失败，请检查以下配置：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>确保 <code>.env.local</code> 文件存在并包含正确的API密钥</li>
                  <li>OpenAI API密钥格式：<code>sk-...</code></li>
                  <li>Google API密钥需要启用Generative AI API</li>
                  <li>检查网络连接和防火墙设置</li>
                </ul>
                <p className="mt-4">
                  详细配置说明请参考：
                  <a 
                    href="/AI_INTEGRATION_GUIDE.md" 
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                    target="_blank"
                  >
                    AI集成配置指南
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
