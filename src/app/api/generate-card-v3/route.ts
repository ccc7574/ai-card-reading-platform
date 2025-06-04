import { NextRequest, NextResponse } from 'next/server'
import { 
  getIntelligentSystem, 
  IntelligentAgentUtils, 
  IntelligentAgentMonitor,
  INTELLIGENT_AGENT_CONFIG
} from '@/lib/agents-v3'

// 智能AI Agent协作生成卡片内容
export async function POST(request: NextRequest) {
  const monitor = IntelligentAgentMonitor.getInstance()
  const startTime = Date.now()
  
  try {
    const { 
      url, 
      type = 'article', 
      model = 'gemini-2.0-flash',
      collaborationStrategy = 'consensus_building'
    } = await request.json()
    
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
    if (!IntelligentAgentUtils.isValidModel(model)) {
      return NextResponse.json(
        { error: `不支持的模型: ${model}。支持的模型: ${Object.values(INTELLIGENT_AGENT_CONFIG.SUPPORTED_MODELS).join(', ')}` },
        { status: 400 }
      )
    }

    // 验证协作策略
    if (!IntelligentAgentUtils.isValidStrategy(collaborationStrategy)) {
      return NextResponse.json(
        { error: `不支持的协作策略: ${collaborationStrategy}。支持的策略: ${Object.values(INTELLIGENT_AGENT_CONFIG.COLLABORATION_STRATEGIES).join(', ')}` },
        { status: 400 }
      )
    }

    console.log(`🧠 启动智能Agent协作系统`)
    console.log(`📍 URL: ${url}`)
    console.log(`🤖 AI模型: ${model}`)
    console.log(`🤝 协作策略: ${collaborationStrategy}`)

    // 获取智能协作系统
    const intelligentSystem = getIntelligentSystem(model as any)
    
    // 创建协作会话
    const sessionId = await intelligentSystem.createCardGenerationSession(
      url, 
      collaborationStrategy as any
    )
    
    // 等待协作完成
    const maxWaitTime = INTELLIGENT_AGENT_CONFIG.DEFAULTS.TIMEOUT
    const pollInterval = 2000 // 2秒轮询间隔
    const collaborationStartTime = Date.now()
    
    while (Date.now() - collaborationStartTime < maxWaitTime) {
      const sessionStatus = intelligentSystem.getSessionStatus(sessionId)
      
      if (!sessionStatus) {
        throw new Error('协作会话状态丢失')
      }
      
      if (sessionStatus.status === 'completed') {
        const executionTime = Date.now() - startTime
        const efficiency = IntelligentAgentUtils.calculateCollaborationEfficiency(sessionStatus)
        
        // 记录性能指标
        monitor.recordCollaborationPerformance(
          sessionId, 
          collaborationStrategy, 
          executionTime, 
          efficiency, 
          true
        )
        
        console.log(`✅ 智能Agent协作完成: ${sessionId}`)
        console.log(`⏱️ 执行时间: ${IntelligentAgentUtils.formatDuration(executionTime)}`)
        console.log(`📊 协作效率: ${Math.round(efficiency * 100)}%`)
        
        return NextResponse.json({
          success: true,
          card: sessionStatus.results,
          collaboration: {
            sessionId,
            framework: '🧠 智能Agent协作框架',
            strategy: collaborationStrategy,
            participants: sessionStatus.participantCount,
            insights: sessionStatus.insightCount,
            decisions: sessionStatus.decisionCount,
            efficiency: Math.round(efficiency * 100)
          },
          processing: {
            contentStrategy: '✅ 内容策略师完成深度分析',
            creativeDirection: '✅ 创意总监完成视觉概念',
            knowledgeEngineering: '✅ 知识工程师完成关联构建',
            qualityAssurance: '✅ 质量专家完成全面评估',
            intelligentCollaboration: '✅ 智能协作达成共识'
          },
          metadata: {
            sessionId,
            framework: 'intelligent-agent-collaboration',
            model,
            collaborationStrategy,
            executionTime,
            efficiency: Math.round(efficiency * 100),
            participantCount: sessionStatus.participantCount,
            insightCount: sessionStatus.insightCount,
            decisionCount: sessionStatus.decisionCount,
            architecture: 'intelligent-multi-agent-collaboration'
          },
          intelligence: {
            reasoning: '多Agent深度推理和协作',
            creativity: '创意思维和创新解决方案',
            knowledge: '智能知识图谱和关联发现',
            quality: '多维度质量保证和优化',
            collaboration: '智能协作和共识构建'
          }
        })
      }
      
      if (sessionStatus.status === 'failed') {
        const executionTime = Date.now() - startTime
        monitor.recordCollaborationPerformance(
          sessionId, 
          collaborationStrategy, 
          executionTime, 
          0, 
          false
        )
        
        console.error(`❌ 智能Agent协作失败: ${sessionId}`)
        
        throw new Error('智能协作执行失败')
      }
      
      // 等待下次轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
    
    // 超时处理
    const executionTime = Date.now() - startTime
    monitor.recordCollaborationPerformance(
      sessionId, 
      collaborationStrategy, 
      executionTime, 
      0, 
      false
    )
    
    console.error(`⏰ 智能Agent协作超时: ${sessionId}`)
    
    return NextResponse.json(
      { 
        error: '智能协作处理超时，请稍后重试',
        details: {
          sessionId,
          timeout: IntelligentAgentUtils.formatDuration(maxWaitTime),
          framework: 'intelligent-agent-collaboration'
        }
      },
      { status: 408 }
    )
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    
    console.error('智能Agent协作失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '智能协作时出现未知错误',
        framework: 'intelligent-agent-collaboration',
        executionTime: IntelligentAgentUtils.formatDuration(executionTime),
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 获取智能Agent系统状态和性能
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'
    
    const intelligentSystem = getIntelligentSystem()
    const monitor = IntelligentAgentMonitor.getInstance()
    
    switch (action) {
      case 'status':
        const systemStatus = intelligentSystem.getSystemStatus()
        
        return NextResponse.json({
          success: true,
          data: {
            system: systemStatus,
            framework: 'intelligent-agent-collaboration',
            capabilities: {
              reasoning: '深度推理和思考',
              creativity: '创意思维和创新',
              knowledge: '知识工程和关联',
              quality: '质量保证和优化',
              collaboration: '智能协作和共识'
            },
            timestamp: new Date().toISOString()
          }
        })
        
      case 'performance':
        const performanceReport = monitor.getPerformanceReport()
        
        return NextResponse.json({
          success: true,
          data: {
            performance: performanceReport,
            framework: 'intelligent-agent-collaboration',
            timestamp: new Date().toISOString()
          }
        })
        
      case 'session':
        const sessionId = searchParams.get('id')
        if (!sessionId) {
          return NextResponse.json(
            { error: '需要提供会话ID' },
            { status: 400 }
          )
        }
        
        const sessionStatus = intelligentSystem.getSessionStatus(sessionId)
        if (!sessionStatus) {
          return NextResponse.json(
            { error: '协作会话不存在' },
            { status: 404 }
          )
        }
        
        const summary = IntelligentAgentUtils.generateCollaborationSummary(sessionStatus)
        
        return NextResponse.json({
          success: true,
          data: {
            session: sessionStatus,
            summary,
            framework: 'intelligent-agent-collaboration'
          }
        })
        
      case 'capabilities':
        return NextResponse.json({
          success: true,
          data: {
            models: Object.values(INTELLIGENT_AGENT_CONFIG.SUPPORTED_MODELS),
            strategies: Object.values(INTELLIGENT_AGENT_CONFIG.COLLABORATION_STRATEGIES),
            reasoning: Object.values(INTELLIGENT_AGENT_CONFIG.REASONING_STRATEGIES),
            agents: Object.values(INTELLIGENT_AGENT_CONFIG.AGENT_ROLES),
            framework: 'intelligent-agent-collaboration'
          }
        })
        
      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('智能Agent API错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '智能Agent系统错误',
        framework: 'intelligent-agent-collaboration',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
