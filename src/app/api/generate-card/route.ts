import { NextRequest, NextResponse } from 'next/server'
import { getAgentOrchestrator } from '@/lib/agents'
import { AIProvider } from '@/lib/ai-services'

// 多Agent架构生成卡片内容
export async function POST(request: NextRequest) {
  try {
    const { url, type = 'article', aiProvider = 'openai', imageMode = 'standard' } = await request.json()

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

    // 验证AI服务提供商
    const provider = aiProvider === 'gemini' ? AIProvider.GEMINI : AIProvider.OPENAI

    console.log(`🤖 启动多Agent工作流: ${url}, AI服务: ${provider}, 图片模式: ${imageMode}`)

    // 获取Agent协调器
    const orchestrator = getAgentOrchestrator()

    // 创建卡片生成工作流
    const workflowId = await orchestrator.createCardGenerationWorkflow(url, provider, imageMode)

    // 等待工作流完成（带超时）
    const maxWaitTime = 120000 // 2分钟超时
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const status = orchestrator.getWorkflowStatus(workflowId)

      if (!status) {
        throw new Error('工作流状态丢失')
      }

      if (status.status === 'completed') {
        console.log(`✅ 多Agent工作流完成: ${workflowId}`)

        return NextResponse.json({
          success: true,
          card: status.result,
          processing: {
            workflowId,
            agentOrchestration: '✅ 多Agent协调完成',
            contentScraping: '✅ 内容抓取Agent完成',
            contentAnalysis: '✅ 内容分析Agent完成',
            imageGeneration: '✅ 图像生成Agent完成',
            knowledgeConnection: '✅ 知识关联Agent完成'
          },
          metadata: {
            workflowId,
            aiProvider: provider,
            imageMode,
            agentCount: orchestrator.getAgentStatuses().length,
            processingTime: Date.now() - startTime,
            architecture: 'multi-agent'
          }
        })
      }

      if (status.status === 'failed') {
        console.error(`❌ 多Agent工作流失败: ${workflowId} - ${status.error}`)
        throw new Error(status.error || '工作流执行失败')
      }

      // 等待100ms后再次检查
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 超时处理
    console.error(`⏰ 工作流超时: ${workflowId}`)
    await orchestrator.stopWorkflow(workflowId)

    return NextResponse.json(
      { error: '处理超时，请稍后重试' },
      { status: 408 }
    )

  } catch (error) {
    console.error('多Agent卡片生成失败:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '生成卡片时出现未知错误',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 获取处理状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  
  if (!jobId) {
    return NextResponse.json(
      { error: '请提供任务ID' },
      { status: 400 }
    )
  }

  // 模拟处理状态
  const mockStatus = {
    jobId,
    status: 'completed',
    progress: 100,
    steps: [
      { name: '内容抓取', status: 'completed', progress: 100 },
      { name: '内容分析', status: 'completed', progress: 100 },
      { name: '摘要生成', status: 'completed', progress: 100 },
      { name: '简笔画生成', status: 'completed', progress: 100 },
      { name: '标签提取', status: 'completed', progress: 100 }
    ],
    result: {
      cardsGenerated: 3,
      connectionsFound: 5
    }
  }

  return NextResponse.json(mockStatus)
}
