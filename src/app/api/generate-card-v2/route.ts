import { NextRequest, NextResponse } from 'next/server'
import { getModernOrchestrator, ModernAgentUtils, ModernAgentMonitor } from '@/lib/agents-v2'

// 现代AI Agent框架生成卡片内容
export async function POST(request: NextRequest) {
  const monitor = ModernAgentMonitor.getInstance()
  const startTime = Date.now()
  
  try {
    const { url, type = 'article', aiProvider = 'openai', imageMode = 'standard', model = 'gpt-4' } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: '请提供文章URL' },
        { status: 400 }
      )
    }

    // 验证URL格式
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: '请提供有效的URL格式' },
        { status: 400 }
      )
    }

    // 验证模型
    if (!ModernAgentUtils.isValidModel(model)) {
      return NextResponse.json(
        { error: `不支持的模型: ${model}` },
        { status: 400 }
      )
    }

    console.log(`🚀 启动现代Agent工作流`)
    console.log(`📍 URL: ${url}`)
    console.log(`🤖 AI模型: ${model}`)
    console.log(`🎨 图像模式: ${imageMode}`)

    // 获取现代化协调器
    const orchestrator = getModernOrchestrator(model)
    
    // 创建工作流
    const workflowId = await orchestrator.createCardGenerationWorkflow(
      url, 
      aiProvider as 'openai' | 'gemini', 
      imageMode as 'standard' | 'premium'
    )
    
    // 等待工作流完成
    const maxWaitTime = 180000 // 3分钟超时
    const pollInterval = 500 // 500ms轮询间隔
    const workflowStartTime = Date.now()
    
    while (Date.now() - workflowStartTime < maxWaitTime) {
      const result = orchestrator.getWorkflowStatus(workflowId)
      
      if (!result) {
        throw new Error('工作流状态丢失')
      }
      
      const summary = ModernAgentUtils.generateStatusSummary(result.state)
      
      if (summary.status === 'completed') {
        const executionTime = Date.now() - startTime
        
        // 记录性能指标
        monitor.recordWorkflowPerformance(workflowId, 'complete', executionTime, true)
        
        console.log(`✅ 现代Agent工作流完成: ${workflowId}`)
        console.log(`⏱️ 执行时间: ${ModernAgentUtils.formatExecutionTime(executionTime)}`)
        
        return NextResponse.json({
          success: true,
          card: result.card,
          processing: {
            workflowId,
            framework: '🚀 现代LangChain Agent框架',
            contentResearch: '✅ 内容研究专家完成',
            creativeDesign: '✅ 创意设计师完成', 
            knowledgeArchitecture: '✅ 知识架构师完成',
            qualityAssurance: '✅ 质量保证专家完成',
            finalIntegration: '✅ 智能整合完成'
          },
          metadata: {
            workflowId,
            framework: 'langchain-modern',
            model,
            aiProvider,
            imageMode,
            executionTime,
            progress: summary.progress,
            processingSteps: result.state.processingSteps?.length || 0,
            warnings: result.state.warnings?.length || 0,
            agentCount: 4,
            architecture: 'modern-multi-agent'
          },
          performance: {
            executionTime: ModernAgentUtils.formatExecutionTime(executionTime),
            stagesCompleted: result.state.processingSteps?.length || 0,
            warningsCount: result.state.warnings?.length || 0,
            qualityScore: result.card?.metadata?.qualityScore || 8.0
          }
        })
      }
      
      if (summary.status === 'failed') {
        const executionTime = Date.now() - startTime
        monitor.recordWorkflowPerformance(workflowId, 'failed', executionTime, false)
        
        console.error(`❌ 现代Agent工作流失败: ${workflowId}`)
        console.error(`错误: ${result.state.errors?.join(', ')}`)
        
        throw new Error(result.state.errors?.[0] || '工作流执行失败')
      }
      
      // 等待下次轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
    
    // 超时处理
    const executionTime = Date.now() - startTime
    monitor.recordWorkflowPerformance(workflowId, 'timeout', executionTime, false)
    
    console.error(`⏰ 现代Agent工作流超时: ${workflowId}`)
    
    return NextResponse.json(
      { 
        error: '处理超时，请稍后重试',
        details: {
          workflowId,
          timeout: ModernAgentUtils.formatExecutionTime(maxWaitTime),
          framework: 'langchain-modern'
        }
      },
      { status: 408 }
    )
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    
    console.error('现代Agent卡片生成失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '生成卡片时出现未知错误',
        framework: 'langchain-modern',
        executionTime: ModernAgentUtils.formatExecutionTime(executionTime),
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 获取现代Agent系统状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'
    
    const orchestrator = getModernOrchestrator()
    const monitor = ModernAgentMonitor.getInstance()
    
    switch (action) {
      case 'status':
        const systemStatus = orchestrator.getSystemStatus()
        
        return NextResponse.json({
          success: true,
          data: {
            system: systemStatus,
            framework: 'langchain-modern',
            timestamp: new Date().toISOString()
          }
        })
        
      case 'performance':
        const performanceReport = monitor.getPerformanceReport()
        
        return NextResponse.json({
          success: true,
          data: {
            performance: performanceReport,
            framework: 'langchain-modern',
            timestamp: new Date().toISOString()
          }
        })
        
      case 'workflow':
        const workflowId = searchParams.get('id')
        if (!workflowId) {
          return NextResponse.json(
            { error: '需要提供工作流ID' },
            { status: 400 }
          )
        }
        
        const workflowStatus = orchestrator.getWorkflowStatus(workflowId)
        if (!workflowStatus) {
          return NextResponse.json(
            { error: '工作流不存在' },
            { status: 404 }
          )
        }
        
        const summary = ModernAgentUtils.generateStatusSummary(workflowStatus.state)
        
        return NextResponse.json({
          success: true,
          data: {
            workflow: workflowStatus,
            summary,
            framework: 'langchain-modern'
          }
        })
        
      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('现代Agent API错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '现代Agent系统错误',
        framework: 'langchain-modern',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
