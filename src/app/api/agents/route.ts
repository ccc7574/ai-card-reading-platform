import { NextRequest, NextResponse } from 'next/server'
import { getAgentOrchestrator, AgentMonitor } from '@/lib/agents'

// 获取Agent系统状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'
    
    const orchestrator = getAgentOrchestrator()
    const monitor = AgentMonitor.getInstance()
    
    switch (action) {
      case 'status':
        // 获取所有Agent状态
        const agentStatuses = orchestrator.getAgentStatuses()
        const systemStats = orchestrator.getSystemStats()
        
        return NextResponse.json({
          success: true,
          data: {
            agents: agentStatuses,
            system: systemStats,
            timestamp: new Date().toISOString()
          }
        })
        
      case 'workflows':
        // 获取工作流列表
        const workflowId = searchParams.get('id')
        
        if (workflowId) {
          const workflowStatus = orchestrator.getWorkflowStatus(workflowId)
          if (!workflowStatus) {
            return NextResponse.json(
              { error: '工作流不存在' },
              { status: 404 }
            )
          }
          
          return NextResponse.json({
            success: true,
            data: workflowStatus
          })
        } else {
          // 返回系统统计
          const stats = orchestrator.getSystemStats()
          return NextResponse.json({
            success: true,
            data: {
              workflows: stats.workflows,
              timestamp: new Date().toISOString()
            }
          })
        }
        
      case 'performance':
        // 获取性能报告
        const performanceReport = monitor.getPerformanceReport()
        
        return NextResponse.json({
          success: true,
          data: {
            performance: performanceReport,
            timestamp: new Date().toISOString()
          }
        })
        
      case 'health':
        // 健康检查
        const agents = orchestrator.getAgentStatuses()
        const healthyAgents = agents.filter(agent => !agent.isRunning || agent.currentTask)
        const isHealthy = healthyAgents.length === agents.length
        
        return NextResponse.json({
          success: true,
          data: {
            healthy: isHealthy,
            totalAgents: agents.length,
            healthyAgents: healthyAgents.length,
            issues: agents.filter(agent => agent.isRunning && !agent.currentTask).map(agent => ({
              agentId: agent.id,
              name: agent.name,
              issue: 'Agent运行中但无任务'
            })),
            timestamp: new Date().toISOString()
          }
        })
        
      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Agent API错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Agent系统错误',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 控制Agent系统
export async function POST(request: NextRequest) {
  try {
    const { action, workflowId, agentId } = await request.json()
    
    const orchestrator = getAgentOrchestrator()
    
    switch (action) {
      case 'stop-workflow':
        if (!workflowId) {
          return NextResponse.json(
            { error: '需要提供工作流ID' },
            { status: 400 }
          )
        }
        
        await orchestrator.stopWorkflow(workflowId)
        
        return NextResponse.json({
          success: true,
          message: `工作流 ${workflowId} 已停止`
        })
        
      case 'cleanup':
        // 清理完成的工作流
        const olderThan = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小时前
        orchestrator.cleanupCompletedWorkflows(olderThan)
        
        return NextResponse.json({
          success: true,
          message: '清理完成'
        })
        
      case 'reset-metrics':
        // 重置性能指标
        const monitor = AgentMonitor.getInstance()
        monitor.cleanup()
        
        return NextResponse.json({
          success: true,
          message: '性能指标已重置'
        })
        
      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Agent控制错误:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Agent控制失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
